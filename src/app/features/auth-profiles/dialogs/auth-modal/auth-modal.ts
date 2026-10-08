import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import {
  AuthProfile,
  AuthType,
  CredentialStorageMode,
} from '../../../../core/models';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell';
import { StoredCredentialService } from '../../../../core/services/stored-credential.service';

export interface AuthSaveEvent {
  profile: AuthProfile;
  patch: Partial<AuthProfile>;
  isNew: boolean;
}

interface AuthForm {
  // Keycloak / OAuth2 / ApiKey / WS-Security
  kcBaseUrl: string;
  realm: string;
  clientId: string;
  secretRef: string;
  audience: string;
  scope: string;

  // mTLS
  certRef: string;
  keyRef: string;
  caRef: string;
  passRef: string;
  thumbprint: string;

  // SQL Server
  connectionStringSecretRef: string;
  inlineConnectionString: string;

  // FTP / SFTP
  username: string;
  ftpPasswordSecretRef: string;
  ftpInlinePassword: string;
  sftpPrivateKeySecretRef: string;
  sftpPassphraseSecretRef: string;
  sftpInlinePrivateKey: string;
  sftpInlinePassphrase: string;

    // FTP / SFTP — reference to a stored credential in the EI vault
  storedCredentialId: string;
}

const EMPTY_FORM: AuthForm = {
  kcBaseUrl: '', realm: '', clientId: '', secretRef: '', audience: '', scope: '',
  certRef: '', keyRef: '', caRef: '', passRef: '', thumbprint: '',
  connectionStringSecretRef: '', inlineConnectionString: '',
  username: '',
  ftpPasswordSecretRef: '', ftpInlinePassword: '',
  sftpPrivateKeySecretRef: '', sftpPassphraseSecretRef: '',
  sftpInlinePrivateKey: '', sftpInlinePassphrase: '',
  storedCredentialId: '',
};

@Component({
  selector: 'ei-auth-modal',
  imports: [ModalShellComponent],
  templateUrl: './auth-modal.html',
})
export class AuthModalComponent implements OnInit {
  readonly profile = input<AuthProfile | null>(null);

  readonly saved = output<AuthSaveEvent>();
  readonly cancelled = output<void>();

  readonly name = signal('');
  readonly type = signal<AuthType>('KeycloakAuthCodeExchange');
  readonly storageMode = signal<CredentialStorageMode>('KeyVault');
  readonly form = signal<AuthForm>({ ...EMPTY_FORM });
  readonly error = signal<string | null>(null);

  readonly isEdit = computed(() => this.profile() !== null);
  readonly title = computed(() => (this.isEdit() ? 'Edit Auth Profile' : 'New Auth Profile'));
  readonly subtitle = computed(() =>
    this.isEdit() ? 'Update authentication' : 'Configure authentication',
  );

  readonly showCredentialBlock = computed(() => {
    const t = this.type();
    return (
      t === 'KeycloakAuthCodeExchange' ||
      t === 'OAuth2ClientCredentials' ||
      t === 'ApiKey' ||
      t === 'WsSecurityUsernameToken'
    );
  });
  readonly showMtlsBlock = computed(() => this.type() === 'MutualTls');
  readonly showSqlServerBlock = computed(() => this.type() === 'SqlServerConnectionString');
  readonly showFtpBlock = computed(() => this.type() === 'FtpCredentials');
  readonly showSftpBlock = computed(() => this.type() === 'SftpKeyCredentials');

  readonly isInlineMode = computed(() => this.storageMode() === 'Inline');

  readonly baseUrlLabel = computed(() => {
    switch (this.type()) {
      case 'KeycloakAuthCodeExchange': return 'Keycloak Base URL';
      case 'OAuth2ClientCredentials':  return 'Token URL';
      case 'ApiKey':                   return 'Header Name';
      case 'WsSecurityUsernameToken':  return 'WS-Security Endpoint';
      default:                         return 'Base URL';
    }
  });

  readonly headerTitle = computed(() => {
    switch (this.type()) {
      case 'KeycloakAuthCodeExchange': return '🔐 Keycloak Configuration';
      case 'OAuth2ClientCredentials':  return '🔑 OAuth2 Client Credentials';
      case 'ApiKey':                   return '🗝 API Key';
      case 'WsSecurityUsernameToken':  return '🛡 WS-Security UsernameToken';
      default:                         return 'Configuration';
    }
  });

  readonly headerHint = computed(() =>
    this.type() === 'ApiKey'
      ? 'Only the secret reference is stored.'
      : 'Only secret references are stored — never raw credentials.',
  );

    private readonly storedCreds = inject(StoredCredentialService);

      /** Credentials compatible with the current FTP/SFTP type. */
  readonly availableStoredCredentials = computed(() => {
    const kind = this.type() === 'SftpKeyCredentials' ? 'SftpPrivateKey' : 'FtpPassword';
    return this.storedCreds.scopedCredentials().filter(c => c.kind === kind);
  });

  readonly storageModeLabel = computed(() => {
    const t = this.type();
    if (t === 'SftpKeyCredentials') return 'Private Key';
    return 'Password';
  });
    

  ngOnInit(): void {
    const p = this.profile();
    if (p) {
      this.name.set(p.name);
      this.type.set(p.type);
      this.storageMode.set(p.credentialStorageMode ?? 'KeyVault');
      this.form.set({
        kcBaseUrl: p.kcBaseUrl ?? '',
        realm: p.realm ?? '',
        clientId: p.clientId ?? '',
        secretRef: p.secretRef ?? '',
        audience: p.audience ?? '',
        scope: p.scope ?? '',
        certRef: p.certRef ?? '',
        keyRef: p.keyRef ?? '',
        caRef: p.caRef ?? '',
        passRef: p.passRef ?? '',
        thumbprint: p.thumbprint ?? '',
        connectionStringSecretRef: p.connectionStringSecretRef ?? '',
        inlineConnectionString: p.inlineConnectionString ?? '',
        username: p.username ?? '',
        ftpPasswordSecretRef: p.ftpPasswordSecretRef ?? '',
        ftpInlinePassword: p.ftpInlinePassword ?? '',
        sftpPrivateKeySecretRef: p.sftpPrivateKeySecretRef ?? '',
        sftpPassphraseSecretRef: p.sftpPassphraseSecretRef ?? '',
        sftpInlinePrivateKey: p.sftpInlinePrivateKey ?? '',
        sftpInlinePassphrase: p.sftpInlinePassphrase ?? '',
        storedCredentialId: p.storedCredentialId ?? '',
      });
    } else {
      this.storageMode.set('KeyVault');
      this.form.set({
        ...EMPTY_FORM,
        kcBaseUrl: 'https://auth.insureliv.com',
        realm: 'insureliv',
        clientId: 'ei-platform',
        audience: 'insureliv-core-api',
        scope: 'openid profile email',
      });
    }
  }

  onNameInput(v: string): void { this.name.set(v); }
  onTypeInput(v: string): void { this.type.set(v as AuthType); }
  onStorageModeInput(v: string): void { this.storageMode.set(v as CredentialStorageMode); }

  patchForm<K extends keyof AuthForm>(key: K, value: AuthForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  onCancel(): void { this.cancelled.emit(); }

  onSave(): void {
    this.error.set(null);

    const name = this.name().trim();
    if (!name) { this.error.set('Name required'); return; }

    const type = this.type();
    const f = this.form();
    const p = this.profile();
    const mode = this.storageMode();

    // -------------------------------------------------------------
    // Mutual TLS
    // -------------------------------------------------------------
    if (type === 'MutualTls') {
      const certRef = f.certRef.trim();
      const keyRef = f.keyRef.trim();
      if (!certRef || !keyRef) {
        this.error.set('mTLS requires cert and key references');
        return;
      }
      const payload: Partial<AuthProfile> = {
        name, type, certRef, keyRef,
        caRef: f.caRef.trim(), passRef: f.passRef.trim(), thumbprint: f.thumbprint.trim(),
      };
      if (p) this.saved.emit({ profile: p, patch: payload, isNew: false });
      else this.saved.emit({
        profile: {
          id: '', name, type, tenant: '',
          certRef, keyRef,
          caRef: payload.caRef, passRef: payload.passRef, thumbprint: payload.thumbprint,
        },
        patch: {}, isNew: true,
      });
      return;
    }

    // -------------------------------------------------------------
    // SQL Server Connection String
    // -------------------------------------------------------------
    if (type === 'SqlServerConnectionString') {
      if (mode === 'KeyVault') {
        const ref = f.connectionStringSecretRef.trim();
        if (!ref) { this.error.set('A Key Vault secret reference is required.'); return; }
        const payload: Partial<AuthProfile> = {
          name, type, credentialStorageMode: 'KeyVault',
          connectionStringSecretRef: ref, inlineConnectionString: undefined,
        };
        if (p) this.saved.emit({ profile: p, patch: payload, isNew: false });
        else this.saved.emit({
          profile: {
            id: '', name, type, tenant: '',
            credentialStorageMode: 'KeyVault', connectionStringSecretRef: ref,
          },
          patch: {}, isNew: true,
        });
        return;
      }
      const inline = f.inlineConnectionString.trim();
      if (!inline) { this.error.set('The inline connection string is required.'); return; }
      if (!/(?:^|;)\s*(?:Server|Data Source)\s*=/i.test(inline)) {
        this.error.set('The connection string must include a Server= or Data Source= keyword.');
        return;
      }
      if (!/(?:^|;)\s*(?:User ID|UID|User|Authentication)\s*=/i.test(inline)) {
        this.error.set('Inline mode requires credentials. Add User ID= (with Password=), or Authentication=.');
        return;
      }
      const payload: Partial<AuthProfile> = {
        name, type, credentialStorageMode: 'Inline',
        inlineConnectionString: inline, connectionStringSecretRef: undefined,
      };
      if (p) this.saved.emit({ profile: p, patch: payload, isNew: false });
      else this.saved.emit({
        profile: {
          id: '', name, type, tenant: '',
          credentialStorageMode: 'Inline', inlineConnectionString: inline,
        },
        patch: {}, isNew: true,
      });
      return;
    }

    // -------------------------------------------------------------
    // FTP Credentials  (username + password, Key Vault or Inline)
    // -------------------------------------------------------------
    if (type === 'FtpCredentials') {
      const username = f.username.trim();
      if (!username) { this.error.set('Username is required for FTP.'); return; }

      if (mode === 'KeyVault') {
        const ref = f.ftpPasswordSecretRef.trim();
        if (!ref) { this.error.set('A Key Vault secret reference for the password is required.'); return; }
        const payload: Partial<AuthProfile> = {
          name, type, credentialStorageMode: 'KeyVault',
          username, ftpPasswordSecretRef: ref, ftpInlinePassword: undefined,
          storedCredentialId: undefined,
        };
        if (p) this.saved.emit({ profile: p, patch: payload, isNew: false });
        else this.saved.emit({
          profile: {
            id: '', name, type, tenant: '',
            credentialStorageMode: 'KeyVault', username, ftpPasswordSecretRef: ref,
          },
          patch: {}, isNew: true,
        });
        return;
      }

      if (mode === 'StoredCredential') {
        const credId = f.storedCredentialId;
        if (!credId) { this.error.set('Select a stored credential.'); return; }
        const payload: Partial<AuthProfile> = {
          name, type, credentialStorageMode: 'StoredCredential',
          username, storedCredentialId: credId,
          ftpPasswordSecretRef: undefined, ftpInlinePassword: undefined,
        };
        if (p) this.saved.emit({ profile: p, patch: payload, isNew: false });
        else this.saved.emit({
          profile: {
            id: '', name, type, tenant: '',
            credentialStorageMode: 'StoredCredential',
            username, storedCredentialId: credId,
          },
          patch: {}, isNew: true,
        });
        return;
      }

      // Inline
      const inlinePassword = f.ftpInlinePassword;
      if (!inlinePassword) { this.error.set('The inline password cannot be empty.'); return; }
      const payload: Partial<AuthProfile> = {
        name, type, credentialStorageMode: 'Inline',
        username, ftpInlinePassword: inlinePassword, ftpPasswordSecretRef: undefined,
        storedCredentialId: undefined,
      };
      if (p) this.saved.emit({ profile: p, patch: payload, isNew: false });
      else this.saved.emit({
        profile: {
          id: '', name, type, tenant: '',
          credentialStorageMode: 'Inline', username, ftpInlinePassword: inlinePassword,
        },
        patch: {}, isNew: true,
      });
      return;
    }

    // -------------------------------------------------------------
    // SFTP Key Credentials  (username + private key + optional passphrase)
    // -------------------------------------------------------------
    if (type === 'SftpKeyCredentials') {
      const username = f.username.trim();
      if (!username) { this.error.set('Username is required for SFTP.'); return; }

      if (mode === 'KeyVault') {
        const keyRef = f.sftpPrivateKeySecretRef.trim();
        if (!keyRef) { this.error.set('A Key Vault secret reference for the private key is required.'); return; }
        const payload: Partial<AuthProfile> = {
          name, type, credentialStorageMode: 'KeyVault',
          username,
          sftpPrivateKeySecretRef: keyRef,
          sftpPassphraseSecretRef: f.sftpPassphraseSecretRef.trim() || undefined,
          sftpInlinePrivateKey: undefined, sftpInlinePassphrase: undefined,
          storedCredentialId: undefined,
        };
        if (p) this.saved.emit({ profile: p, patch: payload, isNew: false });
        else this.saved.emit({
          profile: {
            id: '', name, type, tenant: '',
            credentialStorageMode: 'KeyVault',
            username,
            sftpPrivateKeySecretRef: keyRef,
            sftpPassphraseSecretRef: payload.sftpPassphraseSecretRef,
          },
          patch: {}, isNew: true,
        });
        return;
      }

      if (mode === 'StoredCredential') {
        const credId = f.storedCredentialId;
        if (!credId) { this.error.set('Select a stored credential.'); return; }
        const payload: Partial<AuthProfile> = {
          name, type, credentialStorageMode: 'StoredCredential',
          username, storedCredentialId: credId,
          sftpPrivateKeySecretRef: undefined, sftpPassphraseSecretRef: undefined,
          sftpInlinePrivateKey: undefined, sftpInlinePassphrase: undefined,
        };
        if (p) this.saved.emit({ profile: p, patch: payload, isNew: false });
        else this.saved.emit({
          profile: {
            id: '', name, type, tenant: '',
            credentialStorageMode: 'StoredCredential',
            username, storedCredentialId: credId,
          },
          patch: {}, isNew: true,
        });
        return;
      }

      // Inline
      const inlineKey = f.sftpInlinePrivateKey.trim();
      if (!inlineKey) { this.error.set('The inline private key is required.'); return; }
      if (!inlineKey.includes('BEGIN') || !inlineKey.includes('PRIVATE KEY')) {
        this.error.set('The inline private key does not look like a PEM-encoded key.');
        return;
      }
      const payload: Partial<AuthProfile> = {
        name, type, credentialStorageMode: 'Inline',
        username,
        sftpInlinePrivateKey: inlineKey,
        sftpInlinePassphrase: f.sftpInlinePassphrase || undefined,
        sftpPrivateKeySecretRef: undefined, sftpPassphraseSecretRef: undefined,
        storedCredentialId: undefined,
      };
      if (p) this.saved.emit({ profile: p, patch: payload, isNew: false });
      else this.saved.emit({
        profile: {
          id: '', name, type, tenant: '',
          credentialStorageMode: 'Inline',
          username,
          sftpInlinePrivateKey: inlineKey,
          sftpInlinePassphrase: payload.sftpInlinePassphrase,
        },
        patch: {}, isNew: true,
      });
      return;
    }

    // -------------------------------------------------------------
    // Credential types — Keycloak / OAuth2 / ApiKey / WS-Security
    // -------------------------------------------------------------
    const patchOrNew: Partial<AuthProfile> = {
      name, type,
      realm: f.realm.trim() || '—',
      audience: f.audience.trim() || '—',
      kcBaseUrl: f.kcBaseUrl.trim(),
      clientId: f.clientId.trim(),
      secretRef: f.secretRef.trim(),
      scope: f.scope.trim(),
    };
    if (p) this.saved.emit({ profile: p, patch: patchOrNew, isNew: false });
    else this.saved.emit({
      profile: { id: '', name, type, tenant: '', ...patchOrNew },
      patch: {}, isNew: true,
    });
  }
}