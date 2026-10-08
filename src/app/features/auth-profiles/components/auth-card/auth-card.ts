import { Component, computed, inject, input, output } from '@angular/core';
import { AuthProfile } from '../../../../core/models';
import { TenantService } from '../../../../core/services/tenant.service';

@Component({
  selector: 'ei-auth-card',
  imports: [],
  templateUrl: './auth-card.html',
})
export class AuthCardComponent {
  private readonly tenants = inject(TenantService);

  readonly profile = input.required<AuthProfile>();

  readonly edited = output<string>();
  readonly tested = output<string>();
  readonly deleted = output<string>();

  readonly icon = computed<string>(() => {
    switch (this.profile().type) {
      case 'KeycloakAuthCodeExchange':  return '🔐';
      case 'OAuth2ClientCredentials':   return '🔑';
      case 'ApiKey':                    return '🗝';
      case 'MutualTls':                 return '🔒';
      case 'SqlServerConnectionString': return '🗄';
      case 'FtpCredentials':            return '📁';
      case 'SftpKeyCredentials':        return '📂';
      default:                          return '🛡';
    }
  });

  readonly typeLabel = computed<string>(() => {
    switch (this.profile().type) {
      case 'KeycloakAuthCodeExchange':  return 'Keycloak Auth Code + Token Exchange';
      case 'OAuth2ClientCredentials':   return 'OAuth2 Client Credentials';
      case 'ApiKey':                    return 'API Key';
      case 'WsSecurityUsernameToken':   return 'WS-Security UsernameToken';
      case 'MutualTls':                 return 'Mutual TLS';
      case 'SqlServerConnectionString': return 'SQL Server Connection String';
      case 'FtpCredentials':            return 'FTP Credentials';
      case 'SftpKeyCredentials':        return 'SFTP Key Credentials';
      default:                          return this.profile().type;
    }
  });

  /**
   * True when a profile stores credentials inline rather than in Key Vault.
   * Drives the red "🔓 Inline" warning badge on the card.
   */
  readonly isInlineCredential = computed(() =>
    this.profile().credentialStorageMode === 'Inline',
  );

  /** A safe hint of what's inside the profile — server for SQL, username for FTP/SFTP. */
  readonly inlineServerHint = computed(() => {
    const p = this.profile();
    if (p.type === 'SqlServerConnectionString') {
      const cs = p.inlineConnectionString ?? '';
      const match = cs.match(/(?:^|;)\s*(?:Server|Data Source)\s*=\s*([^;]+)/i);
      return match ? match[1].trim() : '';
    }
    if (p.type === 'FtpCredentials' || p.type === 'SftpKeyCredentials') {
      return p.username ?? '';
    }
    return '';
  });

  readonly tenantLabel = computed(() =>
    this.tenants.labelFor(this.profile().tenant),
  );

  onEdit(): void { this.edited.emit(this.profile().id); }
  onTest(): void { this.tested.emit(this.profile().id); }
  onDelete(): void { this.deleted.emit(this.profile().id); }
}