export type StoredCredentialKind = 'FtpPassword' | 'SftpPrivateKey';

/**
 * A credential stored explicitly inside EI's own database.
 *
 * Distinct from a Key Vault reference, which points to a secret managed by
 * an external vault. Credentials in this store live in the `secret` column,
 * which will be encrypted at rest in a future delivery. Today the
 * `encryptionState` is always `'Plaintext'` — the field exists so that when
 * encryption is added, existing rows can be migrated without any consumer
 * changing.
 */
export interface StoredCredential {
  id: string;
  tenant: string;
  name: string;
  kind: StoredCredentialKind;

  username: string;

  /**
   * The primary secret. For FtpPassword this is the password. For
   * SftpPrivateKey this is the PEM-encoded private key. Plaintext today;
   * ciphertext once encryption lands.
   */
  secret: string;

  /** Optional passphrase for SFTP private keys. Ignored for FTP. */
  secondarySecret?: string;

  notes?: string;

  /** Placeholder for future encryption. Always 'Plaintext' today. */
  encryptionState: 'Plaintext' | 'Encrypted';

  createdAt: string;
  updatedAt: string;
  lastRotatedAt?: string;
}