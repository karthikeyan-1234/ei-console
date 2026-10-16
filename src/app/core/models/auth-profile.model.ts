export type AuthType =
  | 'KeycloakAuthCodeExchange'
  | 'OAuth2ClientCredentials'
  | 'ApiKey'
  | 'WsSecurityUsernameToken'
  | 'MutualTls'
  | 'SqlServerConnectionString'
  | 'FtpCredentials'
  | 'SftpKeyCredentials'
  | 'SubscriptionTokenExchange';

export type CredentialStorageMode = 'KeyVault' | 'StoredCredential' | 'Inline';

export interface AuthProfile {
  id: string;
  name: string;
  type: AuthType;
  tenant: string;

  // Keycloak / OAuth2 / ApiKey / WS-Security
  realm?: string;
  audience?: string;
  kcBaseUrl?: string;
  clientId?: string;
  secretRef?: string;
  scope?: string;

  // MutualTls
  certRef?: string;
  keyRef?: string;
  caRef?: string;
  passRef?: string;
  thumbprint?: string;

  // SqlServerConnectionString
  credentialStorageMode?: CredentialStorageMode;
  connectionStringSecretRef?: string;
  inlineConnectionString?: string;

  // FtpCredentials / SftpKeyCredentials
  username?: string;
  ftpPasswordSecretRef?: string;
  ftpInlinePassword?: string;
  sftpPrivateKeySecretRef?: string;
  sftpPassphraseSecretRef?: string;
  sftpInlinePrivateKey?: string;
  sftpInlinePassphrase?: string;

  /** For SQL Server / FTP / SFTP when storage mode is StoredCredential. */
  storedCredentialId?: string;

  // ── SubscriptionTokenExchange ─────────────────────────────────────────
  stTokenEndpoint?: string;
  stTokenContentType?: string;
  stGrantType?: string;
  stSubscriptionKeyMode?: string;
  stSubscriptionKeyHeader?: string;
  stSubscriptionKeyQueryParam?: string;
  stUsernameFieldName?: string;
  stPasswordFieldName?: string;
  stSecretKeyFieldName?: string;
  stPasswordSecretRef?: string;
  stInlinePassword?: string;
  stSecretKeySecretRef?: string;
  stInlineSecretKey?: string;
  stSubscriptionKeySecretRef?: string;
  stInlineSubscriptionKey?: string;
  stSuccessRequiresJsonPath?: string;
  stTokenJsonPath?: string;
  stTokenPrefix?: string;
  stTtlSource?: string;
  stExpiresInJsonPath?: string;
  stDefaultTtlSeconds?: number;
  stAdditionalBodyJson?: string;
}