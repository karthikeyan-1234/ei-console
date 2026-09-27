import { Component, computed, inject, signal } from '@angular/core';
import { AuthProfile } from '../../../../core/models';
import { AuthProfileService } from '../../../../core/services/auth-profile.service';
import { ConnectionService } from '../../../../core/services/connection.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthCardComponent } from '../../components/auth-card/auth-card';
import { AuthModalComponent, AuthSaveEvent } from '../../dialogs/auth-modal/auth-modal';
import { refList } from '../../../../core/utils/ref.util';

@Component({
  selector: 'ei-auth-profiles-view',
  imports: [AuthCardComponent, AuthModalComponent],
  templateUrl: './auth-profiles-view.html',
})
export class AuthProfilesViewComponent {
  private readonly auths = inject(AuthProfileService);
  private readonly connections = inject(ConnectionService);
  private readonly tenants = inject(TenantService);
  private readonly toasts = inject(ToastService);

  readonly rows = this.auths.scopedProfiles;

  readonly modalOpen = signal(false);
  readonly modalEditing = signal<AuthProfile | null>(null);

  openCreate(): void {
    this.modalEditing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(id: string): void {
    const a = this.auths.byId(id) ?? null;
    this.modalEditing.set(a);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.modalEditing.set(null);
  }

  async onSave(event: AuthSaveEvent): Promise<void> {
    if (event.isNew) {
      // Fill in tenant scope from the currently active tenant.
      const created = await this.auths.create({
        ...event.profile,
        tenant: this.tenants.activeTenantId(),
        id: undefined as unknown as string,
      } as Omit<AuthProfile, 'id'>);
      this.toasts.success('Auth created');
      void created;
    } else {
      await this.auths.update(event.profile.id, event.patch);
      this.toasts.success('Auth updated');
    }
    this.closeModal();
  }

  onTest(id: string): void {
    const a = this.auths.byId(id);
    this.toasts.success(`Testing "${a?.name ?? id}" — TPT acquired`);
  }

  async onDelete(id: string): Promise<void> {
    const a = this.auths.byId(id);
    if (!a) return;

    const byConn = this.connections.connections()
      .filter(c => c.authProfile === id)
      .map(c => c.name);

    // Jobs that reference this auth profile — walking their pipelines is
    // deferred to Group 16 (builder); for now the connection check is
    // the primary guard, which matches the original console's first pass.
    const byTask: string[] = [];

    const refs = [...byConn, ...byTask];
    if (refs.length) {
      this.toasts.error(`Cannot delete "${a.name}" — used by ${refList(refs)}`);
      return;
    }

    if (!confirm(`Delete "${a.name}"?`)) return;

    await this.auths.remove(id);
    this.toasts.warn('Deleted');
  }
}