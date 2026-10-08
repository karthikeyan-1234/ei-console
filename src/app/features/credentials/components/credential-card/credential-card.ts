import { Component, computed, inject, input, output } from '@angular/core';
import { StoredCredential } from '../../../../core/models';
import { TenantService } from '../../../../core/services/tenant.service';

@Component({
  selector: 'ei-credential-card',
  imports: [],
  templateUrl: './credential-card.html',
})
export class CredentialCardComponent {
  private readonly tenants = inject(TenantService);

  readonly credential = input.required<StoredCredential>();

  readonly edited = output<string>();
  readonly deleted = output<string>();

  readonly icon = computed(() =>
    this.credential().kind === 'FtpPassword' ? '📁' : '📂',
  );

  readonly kindLabel = computed(() =>
    this.credential().kind === 'FtpPassword' ? 'FTP Password' : 'SFTP Private Key',
  );

  readonly tenantLabel = computed(() =>
    this.tenants.labelFor(this.credential().tenant),
  );

  /** Mask the secret so it never appears on the card. */
  readonly maskedSecret = computed(() => {
    const s = this.credential().secret ?? '';
    if (!s) return '—';
    if (this.credential().kind === 'SftpPrivateKey') return '•••••••• (PEM key)';
    return '•'.repeat(Math.min(12, s.length));
  });

  onEdit(): void { this.edited.emit(this.credential().id); }
  onDelete(): void { this.deleted.emit(this.credential().id); }
}