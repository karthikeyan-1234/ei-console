export type AuthType =
  | 'KeycloakAuthCodeExchange'
  | 'OAuth2ClientCredentials'
  | 'ApiKey'
  | 'WsSecurityUsernameToken'
  | 'MutualTls'
  | 'SqlServerConnectionString';

/**
 * How a SQL Server credential is stored.
 *
 *   'KeyVault' — only a Key Vault secret URI is stored. The credential portion
 *                of the connection string lives in the vault.
 *   'Inline'   — the full connection string, including username and password,
 *                is stored directly on the profile row. Not recommended for
 *                production. Use only inside a trusted private network with
 *                restricted access, and rotate credentials on a short cycle.
 */
export type CredentialStorageMode = 'KeyVault' | 'Inline';

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

  // Populated for SqlServerConnectionString only.
  // The storage mode decides which of the two following fields is set.
  credentialStorageMode?: CredentialStorageMode;
  connectionStringSecretRef?: string;    // when mode === 'KeyVault'
  inlineConnectionString?: string;       // when mode === 'Inline'
}