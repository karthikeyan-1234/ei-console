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
      default:                          return this.profile().type;
    }
  });

  /**
   * True when the profile is a SQL Server credential stored inline. Cards in
   * this state display a warning badge so operators can see at a glance which
   * connections carry plain-text credentials.
   */
  readonly isInlineCredential = computed(
    () =>
      this.profile().type === 'SqlServerConnectionString' &&
      this.profile().credentialStorageMode === 'Inline',
  );

  /** A masked preview of the server host, safe to render on the card. */
  readonly inlineServerHint = computed(() => {
    const cs = this.profile().inlineConnectionString ?? '';
    const match = cs.match(/(?:^|;)\s*(?:Server|Data Source)\s*=\s*([^;]+)/i);
    return match ? match[1].trim() : '';
  });

  readonly tenantLabel = computed(() =>
    this.tenants.labelFor(this.profile().tenant),
  );

  onEdit(): void { this.edited.emit(this.profile().id); }
  onTest(): void { this.tested.emit(this.profile().id); }
  onDelete(): void { this.deleted.emit(this.profile().id); }
}