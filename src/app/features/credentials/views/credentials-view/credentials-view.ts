import { Component, computed, inject, signal } from '@angular/core';
import { StoredCredential } from '../../../../core/models';
import { StoredCredentialService } from '../../../../core/services/stored-credential.service';
import { AuthProfileService } from '../../../../core/services/auth-profile.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CredentialCardComponent } from '../../components/credential-card/credential-card';
import {
  CredentialModalComponent,
  CredentialSaveEvent,
} from '../../dialogs/credential-modal/credential-modal';
import { refList } from '../../../../core/utils/ref.util';

@Component({
  selector: 'ei-credentials-view',
  imports: [CredentialCardComponent, CredentialModalComponent],
  templateUrl: './credentials-view.html',
})
export class CredentialsViewComponent {
  private readonly credentials = inject(StoredCredentialService);
  private readonly auths = inject(AuthProfileService);
  private readonly tenants = inject(TenantService);
  private readonly toasts = inject(ToastService);

  readonly rows = this.credentials.scopedCredentials;
  readonly plaintextCount = this.credentials.plaintextCount;

  readonly modalOpen = signal(false);
  readonly modalEditing = signal<StoredCredential | null>(null);

  readonly subtitle = computed(() => {
    const n = this.rows().length;
    const p = this.plaintextCount();
    const label = this.tenants.labelFor(this.tenants.activeTenantId());
    if (p > 0) {
      return `${n} credential${n === 1 ? '' : 's'} for ${label} · ${p} stored as plaintext`;
    }
    return `${n} credential${n === 1 ? '' : 's'} for ${label}`;
  });

  openCreate(): void {
    this.modalEditing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(id: string): void {
    const c = this.credentials.byId(id) ?? null;
    this.modalEditing.set(c);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.modalEditing.set(null);
  }

  async onSave(event: CredentialSaveEvent): Promise<void> {
    if (event.isNew) {
      await this.credentials.create(event.payload);
      this.toasts.success('Credential created');
    } else {
      await this.credentials.update(event.credential!.id, event.payload);
      this.toasts.success('Credential updated');
    }
    this.closeModal();
  }

  async onDelete(id: string): Promise<void> {
    const c = this.credentials.byId(id);
    if (!c) return;

    // Guard — every auth profile that references this credential.
    const referencing = this.auths
      .profiles()
      .filter(p => p.storedCredentialId === id)
      .map(p => p.name);

    if (referencing.length) {
      this.toasts.error(
        `Cannot delete "${c.name}" — referenced by ${refList(referencing)}`,
      );
      return;
    }

    if (!confirm(`Delete stored credential "${c.name}"?`)) return;
    await this.credentials.remove(id);
    this.toasts.warn('Credential removed');
  }
}