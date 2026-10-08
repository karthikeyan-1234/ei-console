import { Component, computed, inject, input, output } from '@angular/core';
import { Connection } from '../../../../core/models';
import { AuthProfileService } from '../../../../core/services/auth-profile.service';

@Component({
  selector: 'ei-connection-card',
  imports: [],
  templateUrl: './connection-card.html',
})
export class ConnectionCardComponent {
  private readonly auths = inject(AuthProfileService);

  readonly connection = input.required<Connection>();

  readonly edited = output<string>();
  readonly tested = output<string>();
  readonly deleted = output<string>();

  readonly isShared = computed(() => this.connection().tenant === '__shared');
  readonly isSqlServer = computed(() => this.connection().protocol === 'SqlServer');
  readonly isFtp = computed(() => this.connection().protocol === 'Ftp');
  readonly isSftp = computed(() => this.connection().protocol === 'Sftp');
  readonly isFileTransfer = computed(() => this.isFtp() || this.isSftp());

  readonly icon = computed(() => {
    switch (this.connection().protocol) {
      case 'SqlServer': return '🗄';
      case 'Soap':      return '📜';
      case 'Json':      return '📦';
      case 'Ftp':       return '📁';
      case 'Sftp':      return '📂';
      default:          return '🔌';
    }
  });

  readonly urlLabel = computed(() => {
    if (this.isSqlServer()) return 'Server';
    if (this.isFileTransfer()) return 'Host';
    return 'URL';
  });

  /** Host + port for FTP/SFTP, base URL for everything else. */
  readonly endpointDisplay = computed(() => {
    const c = this.connection();
    if (!this.isFileTransfer()) return c.baseUrl;
    const port = c.port ?? (this.isFtp() ? 21 : 22);
    return `${c.baseUrl}:${port}`;
  });

  readonly authName = computed(() => {
    const id = this.connection().authProfile;
    if (!id) return '—';
    return this.auths.byId(id)?.name ?? '—';
  });

  readonly hasInlineCredentials = computed(() => {
    const id = this.connection().authProfile;
    if (!id) return false;
    const profile = this.auths.byId(id);
    if (!profile) return false;
    return (
      profile.credentialStorageMode === 'Inline' &&
      (
        profile.type === 'SqlServerConnectionString' ||
        profile.type === 'FtpCredentials' ||
        profile.type === 'SftpKeyCredentials'
      )
    );
  });

  readonly timeoutUnit = computed(() => {
    const p = this.connection().protocol;
    if (p === 'Rest' || p === 'Soap' || p === 'Json') return ' ms';
    return ' s';
  });

  onEdit(): void { this.edited.emit(this.connection().id); }
  onTest(): void { this.tested.emit(this.connection().id); }
  onDelete(): void { this.deleted.emit(this.connection().id); }
}