import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { StoredCredential, StoredCredentialKind } from '../../../../core/models';
import { TenantService } from '../../../../core/services/tenant.service';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell';
import { nowLong } from '../../../../core/utils/date.util';

export interface CredentialSaveEvent {
  credential: StoredCredential | null;  // null when creating
  payload: Omit<StoredCredential, 'id'>;
  isNew: boolean;
}

@Component({
  selector: 'ei-credential-modal',
  imports: [ModalShellComponent],
  templateUrl: './credential-modal.html',
})
export class CredentialModalComponent implements OnInit {
  private readonly tenants = inject(TenantService);

  readonly credential = input<StoredCredential | null>(null);

  readonly saved = output<CredentialSaveEvent>();
  readonly cancelled = output<void>();

  readonly name = signal('');
  readonly kind = signal<StoredCredentialKind>('FtpPassword');
  readonly tenant = signal('');
  readonly username = signal('');
  readonly secret = signal('');
  readonly secondarySecret = signal('');
  readonly notes = signal('');
  readonly error = signal<string | null>(null);
  readonly showSecret = signal(false);

  readonly isEdit = computed(() => this.credential() !== null);
  readonly title = computed(() => (this.isEdit() ? 'Edit Stored Credential' : 'New Stored Credential'));
  readonly subtitle = computed(() =>
    this.isEdit()
      ? 'Rotate credentials by editing the secret. The secret is not displayed.'
      : 'Store credentials explicitly in EI\'s own database.',
  );

  readonly isSftp = computed(() => this.kind() === 'SftpPrivateKey');

  readonly tenantOptions = computed(() => {
    const list = this.tenants.activeTenants().map(t => ({ id: t.id, label: t.name }));
    list.push({ id: '__shared', label: 'Shared (All Tenants)' });
    return list;
  });

  ngOnInit(): void {
    const c = this.credential();
    if (c) {
      this.name.set(c.name);
      this.kind.set(c.kind);
      this.tenant.set(c.tenant);
      this.username.set(c.username);
      // Never pre-fill the secret — the user must retype to change it.
      this.secret.set('');
      this.secondarySecret.set('');
      this.notes.set(c.notes ?? '');
    } else {
      this.tenant.set(this.tenants.activeTenantId());
    }
  }

  onNameInput(v: string): void { this.name.set(v); }
  onKindInput(v: string): void { this.kind.set(v as StoredCredentialKind); }
  onTenantInput(v: string): void { this.tenant.set(v); }
  onUsernameInput(v: string): void { this.username.set(v); }
  onSecretInput(v: string): void { this.secret.set(v); }
  onSecondarySecretInput(v: string): void { this.secondarySecret.set(v); }
  onNotesInput(v: string): void { this.notes.set(v); }
  toggleSecretVisibility(): void { this.showSecret.update(v => !v); }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSave(): void {
    this.error.set(null);

    const name = this.name().trim();
    if (!name) { this.error.set('Name required.'); return; }

    const username = this.username().trim();
    if (!username) { this.error.set('Username required.'); return; }

    const existing = this.credential();
    const secret = this.secret().trim();
    const secondary = this.secondarySecret().trim();

    // On edit, an empty secret means "keep the existing one". This is the
    // rotation-friendly path: the operator edits the name or notes without
    // being forced to re-enter the secret.
    if (!existing && !secret) {
      this.error.set('Secret required.');
      return;
    }

    if (secret && this.kind() === 'SftpPrivateKey') {
      if (!secret.includes('BEGIN') || !secret.includes('PRIVATE KEY')) {
        this.error.set('The SFTP secret does not look like a PEM-encoded private key.');
        return;
      }
    }

    const now = nowLong();

    const payload: Omit<StoredCredential, 'id'> = {
      tenant: this.tenant(),
      name,
      kind: this.kind(),
      username,
      secret: secret || existing?.secret || '',
      secondarySecret: secondary || existing?.secondarySecret || undefined,
      notes: this.notes().trim() || undefined,
      encryptionState: existing?.encryptionState ?? 'Plaintext',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastRotatedAt: secret && existing ? now : existing?.lastRotatedAt,
    };

    this.saved.emit({
      credential: existing,
      payload,
      isNew: !existing,
    });
  }
}