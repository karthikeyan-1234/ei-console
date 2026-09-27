import { Component, computed, inject, signal } from '@angular/core';
import { Connection, ConnectionProtocol } from '../../../../core/models';
import { ConnectionService } from '../../../../core/services/connection.service';
import { RateLimitService } from '../../../../core/services/rate-limit.service';
import { JobService } from '../../../../core/services/job.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConnectionCardComponent } from '../../components/connection-card/connection-card';
import { ConnectionModalComponent, ConnectionSaveEvent } from '../../dialogs/connection-modal/connection-modal';
import { findTasksUsing } from '../../../../core/utils/pipeline.util';
import { refList } from '../../../../core/utils/ref.util';

type ProtocolFilter = '' | ConnectionProtocol;

@Component({
  selector: 'ei-connections-view',
  imports: [ConnectionCardComponent, ConnectionModalComponent],
  templateUrl: './connections-view.html',
})
export class ConnectionsViewComponent {
  private readonly connections = inject(ConnectionService);
  private readonly rateLimits = inject(RateLimitService);
  private readonly jobs = inject(JobService);
  private readonly toasts = inject(ToastService);

  readonly search = signal('');
  readonly protocolFilter = signal<ProtocolFilter>('');

  readonly modalOpen = signal(false);
  readonly modalEditing = signal<Connection | null>(null);

  readonly rows = computed(() => {
    const query = this.search().toLowerCase().trim();
    const proto = this.protocolFilter();

    return this.connections.scopedConnections().filter(c => {
      if (query && !(`${c.name} ${c.provider}`.toLowerCase().includes(query))) return false;
      if (proto && c.protocol !== proto) return false;
      return true;
    });
  });

  onSearchInput(v: string): void { this.search.set(v); }
  onProtocolInput(v: string): void { this.protocolFilter.set(v as ProtocolFilter); }

  openCreate(): void {
    this.modalEditing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(id: string): void {
    const c = this.connections.byId(id) ?? null;
    this.modalEditing.set(c);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.modalEditing.set(null);
  }

  async onSave(event: ConnectionSaveEvent): Promise<void> {
    if (event.isNew) {
      await this.connections.create({
        name: event.connection.name,
        provider: event.connection.provider,
        protocol: event.connection.protocol,
        baseUrl: event.connection.baseUrl,
        tenant: event.connection.tenant,
        authProfile: event.connection.authProfile,
        timeout: event.connection.timeout,
        headers: event.connection.headers,
        status: 'Active',
      });
      this.toasts.success('Connection created');
    } else {
      await this.connections.update(event.connection.id, event.patch);
      this.toasts.success('Connection updated');
    }
    this.closeModal();
  }

  async onTest(id: string): Promise<void> {
    const c = this.connections.byId(id);
    if (!c) return;
    const result = await this.connections.test(id);
    if (result.ok) {
      this.toasts.success(`Testing "${c.name}" — ${result.status} OK (${result.latencyMs}ms)`);
    } else {
      this.toasts.error(`Testing "${c.name}" — failed`);
    }
  }

  async onDelete(id: string): Promise<void> {
    const c = this.connections.byId(id);
    if (!c) return;

    const usedByTasks = findTasksUsing(this.jobs.jobs(), 'connectionId', id);
    if (usedByTasks.length) {
      this.toasts.error(`Cannot delete "${c.name}" — used by ${refList(usedByTasks)}`);
      return;
    }

    const attachedRateLimits = this.rateLimits.policies().filter(r => r.connectionId === id);
    const confirmMessage = attachedRateLimits.length
      ? `Delete "${c.name}"?\n\nIts ${attachedRateLimits.length} rate limit policy(ies) will be deleted too.`
      : `Delete "${c.name}"?`;

    if (!confirm(confirmMessage)) return;

    // Remove attached rate limits first, then the connection itself.
    for (const r of attachedRateLimits) {
      await this.rateLimits.remove(r.id);
    }
    await this.connections.remove(id);
    this.toasts.warn('Deleted');
  }
}