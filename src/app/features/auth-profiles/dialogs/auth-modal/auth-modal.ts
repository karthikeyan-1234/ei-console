import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import {
  AuthProfile,
  AuthType,
  CredentialStorageMode,
} from '../../../../core/models';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell';

export interface AuthSaveEvent {
  profile: AuthProfile;
  patch: Partial<AuthProfile>;
  isNew: boolean;
}

interface AuthForm {
  // Shared between Keycloak / OAuth2 / ApiKey / WS-Security
  kcBaseUrl: string;
  realm: string;
  clientId: string;
  secretRef: string;
  audience: string;
  scope: string;

  // mTLS-only
  certRef: string;
  keyRef: string;
  caRef: string;
  passRef: string;
  thumbprint: string;

  // SqlServer-only — mode decides which of these two is used.
  connectionStringSecretRef: string;
  inlineConnectionString: string;
}

const EMPTY_FORM: AuthForm = {
  kcBaseUrl: '',
  realm: '',
  clientId: '',
  secretRef: '',
  audience: '',
  scope: '',
  certRef: '',
  keyRef: '',
  caRef: '',
  passRef: '',
  thumbprint: '',
  connectionStringSecretRef: '',
  inlineConnectionString: '',
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

  /** True when the SQL Server block should render the inline connection-string editor. */
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

  onTypeInput(v: string): void {
    this.type.set(v as AuthType);
  }

  onStorageModeInput(v: string): void {
    this.storageMode.set(v as CredentialStorageMode);
  }

  patchForm<K extends keyof AuthForm>(key: K, value: AuthForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSave(): void {
    this.error.set(null);

    const name = this.name().trim();
    if (!name) { this.error.set('Name required'); return; }

    const type = this.type();
    const f = this.form();
    const p = this.profile();

    // ---------------------------------------------------------------------
    // Mutual TLS
    // ---------------------------------------------------------------------
    if (type === 'MutualTls') {
      const certRef = f.certRef.trim();
      const keyRef = f.keyRef.trim();
      if (!certRef || !keyRef) {
        this.error.set('mTLS requires cert and key references');
        return;
      }

      const payload: Partial<AuthProfile> = {
        name,
        type,
        certRef,
        keyRef,
        caRef: f.caRef.trim(),
        passRef: f.passRef.trim(),
        thumbprint: f.thumbprint.trim(),
      };

      if (p) {
        this.saved.emit({ profile: p, patch: payload, isNew: false });
      } else {
        this.saved.emit({
          profile: {
            id: '',
            name,
            type,
            tenant: '',
            certRef,
            keyRef,
            caRef: payload.caRef,
            passRef: payload.passRef,
            thumbprint: payload.thumbprint,
          },
          patch: {},
          isNew: true,
        });
      }
      return;
    }

    // ---------------------------------------------------------------------
    // SQL Server Connection String
    // ---------------------------------------------------------------------
    if (type === 'SqlServerConnectionString') {
      const mode = this.storageMode();

      if (mode === 'KeyVault') {
        const connectionStringSecretRef = f.connectionStringSecretRef.trim();
        if (!connectionStringSecretRef) {
          this.error.set(
            'A Key Vault secret reference is required when storing credentials in Key Vault.',
          );
          return;
        }

        const payload: Partial<AuthProfile> = {
          name,
          type,
          credentialStorageMode: 'KeyVault',
          connectionStringSecretRef,
          inlineConnectionString: undefined,
        };

        if (p) {
          this.saved.emit({ profile: p, patch: payload, isNew: false });
        } else {
          this.saved.emit({
            profile: {
              id: '',
              name,
              type,
              tenant: '',
              credentialStorageMode: 'KeyVault',
              connectionStringSecretRef,
            },
            patch: {},
            isNew: true,
          });
        }
        return;
      }

      // Inline mode
      const inline = f.inlineConnectionString.trim();
      if (!inline) {
        this.error.set('The inline connection string is required.');
        return;
      }

      // A very shallow sanity check — the value should at least look like a
      // connection string. We do not attempt to parse it, because credentials
      // may use any of the many SqlClient keywords and we do not want to
      // reject valid strings.
      const hasServer =
        /(?:^|;)\s*(?:Server|Data Source)\s*=/i.test(inline);
      const hasCredentials =
        /(?:^|;)\s*(?:User ID|UID|User|Authentication)\s*=/i.test(inline);

      if (!hasServer) {
        this.error.set('The connection string must include a Server= or Data Source= keyword.');
        return;
      }
      if (!hasCredentials) {
        this.error.set(
          'Inline mode requires credentials. Add User ID= (with Password=), or Authentication= to the string.',
        );
        return;
      }

      const payload: Partial<AuthProfile> = {
        name,
        type,
        credentialStorageMode: 'Inline',
        inlineConnectionString: inline,
        connectionStringSecretRef: undefined,
      };

      if (p) {
        this.saved.emit({ profile: p, patch: payload, isNew: false });
      } else {
        this.saved.emit({
          profile: {
            id: '',
            name,
            type,
            tenant: '',
            credentialStorageMode: 'Inline',
            inlineConnectionString: inline,
          },
          patch: {},
          isNew: true,
        });
      }
      return;
    }

    // ---------------------------------------------------------------------
    // Credential types — Keycloak / OAuth2 / ApiKey / WS-Security
    // ---------------------------------------------------------------------
    const patchOrNew: Partial<AuthProfile> = {
      name,
      type,
      realm: f.realm.trim() || '—',
      audience: f.audience.trim() || '—',
      kcBaseUrl: f.kcBaseUrl.trim(),
      clientId: f.clientId.trim(),
      secretRef: f.secretRef.trim(),
      scope: f.scope.trim(),
    };

    if (p) {
      this.saved.emit({ profile: p, patch: patchOrNew, isNew: false });
    } else {
      this.saved.emit({
        profile: {
          id: '',
          name,
          type,
          tenant: '',
          ...patchOrNew,
        },
        patch: {},
        isNew: true,
      });
    }
  }
}