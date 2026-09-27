import { Component, computed, inject, signal } from '@angular/core';
import { Tenant } from '../../../../core/models';
import { TenantService } from '../../../../core/services/tenant.service';
import { JobService } from '../../../../core/services/job.service';
import { ConnectionService } from '../../../../core/services/connection.service';
import { AuthProfileService } from '../../../../core/services/auth-profile.service';
import { WatermarkService } from '../../../../core/services/watermark.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TenantCardComponent, TenantCounts } from '../../components/tenant-card/tenant-card';
import { TenantModalComponent, TenantSaveEvent } from '../../dialogs/tenant-modal/tenant-modal';
import { refList } from '../../../../core/utils/ref.util';

@Component({
  selector: 'ei-tenants-view',
  imports: [TenantCardComponent, TenantModalComponent],
  templateUrl: './tenants-view.html',
})
export class TenantsViewComponent {
  private readonly tenants = inject(TenantService);
  private readonly jobs = inject(JobService);
  private readonly connections = inject(ConnectionService);
  private readonly auths = inject(AuthProfileService);
  private readonly watermarks = inject(WatermarkService);
  private readonly toasts = inject(ToastService);

  readonly rows = this.tenants.tenants;
  readonly activeTenantId = this.tenants.activeTenantId;

  readonly modalOpen = signal(false);
  readonly modalEditingTenant = signal<Tenant | null>(null);

  readonly countsByTenant = computed<Record<string, TenantCounts>>(() => {
    const jobs = this.jobs.jobs();
    const conns = this.connections.connections();
    const auths = this.auths.profiles();
    const wms = this.watermarks.watermarks();

    const result: Record<string, TenantCounts> = {};
    for (const t of this.tenants.tenants()) {
      result[t.id] = {
        jobs: jobs.filter(j => j.tenant === t.id).length,
        conns: conns.filter(c => c.tenant === t.id || c.tenant === '__shared').length,
        auths: auths.filter(a => a.tenant === t.id || a.tenant === '__shared').length,
        wms: wms.filter(w => w.tenant === t.id).length,
      };
    }
    return result;
  });

  countsFor(id: string): TenantCounts {
    return this.countsByTenant()[id] ?? { jobs: 0, conns: 0, auths: 0, wms: 0 };
  }

  openCreate(): void {
    this.modalEditingTenant.set(null);
    this.modalOpen.set(true);
  }

  openEdit(id: string): void {
    const t = this.tenants.tenants().find(x => x.id === id) ?? null;
    this.modalEditingTenant.set(t);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.modalEditingTenant.set(null);
  }

  async onSave(event: TenantSaveEvent): Promise<void> {
    if (event.isNew) {
      await this.tenants.create({
        code: event.tenant.code,
        name: event.tenant.name,
        coreUrl: event.tenant.coreUrl,
        coreDbRef: event.tenant.coreDbRef,
        active: event.tenant.active,
      });
      this.toasts.success('Tenant created');
    } else {
      await this.tenants.update(event.tenant.id, event.patch);
      this.toasts.success('Tenant updated');
    }
    this.closeModal();
  }

  onSwitch(id: string): void {
    this.tenants.switchTo(id);
    this.toasts.success(`Switched to ${this.tenants.labelFor(id)}`);
  }

  async onDelete(id: string): Promise<void> {
    if (this.tenants.tenants().length <= 1) {
      this.toasts.error('Cannot delete last tenant');
      return;
    }

    const owned: string[] = [];
    const jobCount = this.jobs.jobs().filter(j => j.tenant === id).length;
    const connCount = this.connections.connections().filter(c => c.tenant === id).length;
    const authCount = this.auths.profiles().filter(a => a.tenant === id).length;

    if (jobCount) owned.push(`${jobCount} job${jobCount === 1 ? '' : 's'}`);
    if (connCount) owned.push(`${connCount} connection${connCount === 1 ? '' : 's'}`);
    if (authCount) owned.push(`${authCount} auth profile${authCount === 1 ? '' : 's'}`);

    if (owned.length) {
      this.toasts.error(
        `Cannot delete "${this.tenants.labelFor(id)}" — it still owns ${refList(owned)}`,
      );
      return;
    }

    if (!confirm(`Delete "${this.tenants.labelFor(id)}"?`)) return;

    await this.tenants.remove(id);
    this.toasts.warn('Deleted');
  }
}