export type AuthType =
  | 'KeycloakAuthCodeExchange'
  | 'OAuth2ClientCredentials'
  | 'ApiKey'
  | 'WsSecurityUsernameToken'
  | 'MutualTls'
  | 'SqlServerConnectionString'
  | 'FtpCredentials'
  | 'SftpKeyCredentials';

/**
 * How a SQL Server / FTP / SFTP credential is stored.
 *
 *   'KeyVault'          — only a Key Vault secret URI is stored; the credential
 *                         itself lives in the vault.
 *   'StoredCredential'  — the credential is written into EI's own credential
 *                         store (see StoredCredential). Recommended over
 *                         'Inline' because it lives in one place, is
 *                         independently rotatable, and will be encrypted at
 *                         rest in a future delivery.
 *   'Inline'            — the credential lives directly on the profile row.
 *                         Kept for backward compatibility. Use only for
 *                         temporary setups inside a trusted private network.
 */
export type CredentialStorageMode = 'KeyVault' | 'StoredCredential' | 'Inline';

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
  credentialStorageMode?: CredentialStorageMode;
  connectionStringSecretRef?: string;    // when mode === 'KeyVault'
  inlineConnectionString?: string;       // when mode === 'Inline'

  // Populated for FtpCredentials / SftpKeyCredentials.
  /** Login username. Used by both FTP and SFTP auth types. */
  username?: string;

  /** FtpCredentials, Key Vault mode. */
  ftpPasswordSecretRef?: string;
  /** FtpCredentials, Inline mode. */
  ftpInlinePassword?: string;

  /** SftpKeyCredentials, Key Vault mode. */
  sftpPrivateKeySecretRef?: string;
  sftpPassphraseSecretRef?: string;

  /** SftpKeyCredentials, Inline mode. PEM-encoded private key text. */
  sftpInlinePrivateKey?: string;
  sftpInlinePassphrase?: string;

  /**
   * For SQL Server / FTP / SFTP profiles only. When the storage mode is
   * 'StoredCredential', this id points into EI's own credential store.
   * Undefined for all other modes.
   */
  storedCredentialId?: string;
}