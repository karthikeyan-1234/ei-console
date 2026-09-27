export type AuthType =
  | 'KeycloakAuthCodeExchange'
  | 'OAuth2ClientCredentials'
  | 'ApiKey'
  | 'WsSecurityUsernameToken'
  | 'MutualTls';

export interface AuthProfile {
  id: string;
  name: string;
  type: AuthType;
  tenant: string;

  // Populated for Keycloak / OAuth2 / ApiKey / WS-Security variants.
  realm?: string;
  audience?: string;
  kcBaseUrl?: string;
  clientId?: string;
  secretRef?: string;
  scope?: string;

  // Populated for MutualTls only.
  certRef?: string;
  keyRef?: string;
  caRef?: string;
  passRef?: string;
  thumbprint?: string;
}