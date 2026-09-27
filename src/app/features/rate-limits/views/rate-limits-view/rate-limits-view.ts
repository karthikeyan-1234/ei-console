import { Component, inject, signal } from '@angular/core';
import { RateLimit } from '../../../../core/models';
import { RateLimitService } from '../../../../core/services/rate-limit.service';
import { ConnectionService } from '../../../../core/services/connection.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RateLimitModalComponent, RateLimitSaveEvent } from '../../dialogs/rate-limit-modal/rate-limit-modal';

@Component({
  selector: 'ei-rate-limits-view',
  imports: [RateLimitModalComponent],
  templateUrl: './rate-limits-view.html',
})
export class RateLimitsViewComponent {
  private readonly rateLimits = inject(RateLimitService);
  private readonly connections = inject(ConnectionService);
  private readonly toasts = inject(ToastService);

  readonly rows = this.rateLimits.policies;

  readonly modalOpen = signal(false);
  readonly modalEditing = signal<RateLimit | null>(null);

  connectionName(id: string): string {
    return this.connections.nameById(id);
  }

  openCreate(): void {
    this.modalEditing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(id: string): void {
    const r = this.rateLimits.byId(id) ?? null;
    this.modalEditing.set(r);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.modalEditing.set(null);
  }

  async onSave(event: RateLimitSaveEvent): Promise<void> {
    if (event.isNew) {
      await this.rateLimits.create({
        connectionId: event.rateLimit.connectionId,
        scope: event.rateLimit.scope,
        rps: event.rateLimit.rps,
        burst: event.rateLimit.burst,
        concurrent: event.rateLimit.concurrent,
      });
      this.toasts.success('Rate limit created');
    } else {
      await this.rateLimits.update(event.rateLimit.id, event.patch);
      this.toasts.success('Rate limit updated');
    }
    this.closeModal();
  }

  async onDelete(id: string): Promise<void> {
    const r = this.rateLimits.byId(id);
    if (!r) return;

    if (!confirm(`Delete the rate limit policy for "${this.connectionName(r.connectionId)}"?`)) {
      return;
    }

    await this.rateLimits.remove(id);
    this.toasts.warn('Deleted');
  }
}