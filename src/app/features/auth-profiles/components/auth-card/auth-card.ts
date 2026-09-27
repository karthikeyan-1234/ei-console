import { Component, computed, input, output } from '@angular/core';
import { AuthProfile, AuthType } from '../../../../core/models';
import { TenantService } from '../../../../core/services/tenant.service';
import { inject } from '@angular/core';

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
      case 'KeycloakAuthCodeExchange': return '🔐';
      case 'OAuth2ClientCredentials':  return '🔑';
      case 'ApiKey':                   return '🗝';
      case 'MutualTls':                return '🔒';
      default:                         return '🛡';
    }
  });

  readonly typeLabel = computed<string>(() => {
    switch (this.profile().type) {
      case 'KeycloakAuthCodeExchange': return 'Keycloak Auth Code + Token Exchange';
      case 'OAuth2ClientCredentials':  return 'OAuth2 Client Credentials';
      case 'ApiKey':                   return 'API Key';
      case 'WsSecurityUsernameToken':  return 'WS-Security UsernameToken';
      case 'MutualTls':                return 'Mutual TLS';
      default:                         return this.profile().type;
    }
  });

  readonly tenantLabel = computed(() =>
    this.tenants.labelFor(this.profile().tenant),
  );

  onEdit(): void { this.edited.emit(this.profile().id); }
  onTest(): void { this.tested.emit(this.profile().id); }
  onDelete(): void { this.deleted.emit(this.profile().id); }
}