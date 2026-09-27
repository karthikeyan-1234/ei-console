import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { AuthProfile, AuthType } from '../../../../core/models';
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
  readonly form = signal<AuthForm>({ ...EMPTY_FORM });
  readonly error = signal<string | null>(null);

  readonly isEdit = computed(() => this.profile() !== null);
  readonly title = computed(() => (this.isEdit() ? 'Edit Auth Profile' : 'New Auth Profile'));
  readonly subtitle = computed(() =>
    this.isEdit() ? 'Update authentication' : 'Configure authentication',
  );

  /** True when the modal should show the credential block (not mTLS). */
  readonly showCredentialBlock = computed(() => this.type() !== 'MutualTls');

  /** True when the modal should show the mTLS block. */
  readonly showMtlsBlock = computed(() => this.type() === 'MutualTls');

  /** Label for the base-URL field, swapped per type. */
  readonly baseUrlLabel = computed(() => {
    switch (this.type()) {
      case 'KeycloakAuthCodeExchange': return 'Keycloak Base URL';
      case 'OAuth2ClientCredentials':  return 'Token URL';
      case 'ApiKey':                   return 'Header Name';
      case 'WsSecurityUsernameToken':  return 'WS-Security Endpoint';
      default:                         return 'Base URL';
    }
  });

  /** Header title for the credential block. */
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
      });
    } else {
      // Sensible defaults for a brand-new Keycloak profile, matching the seed.
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
    const next = v as AuthType;
    this.type.set(next);
    // When switching between credential-types, keep the credential form as-is.
    // When switching into mTLS, keep whatever was typed there before.
    // When switching into credential-types, keep their previous values too.
    // Nothing is cleared — the two field sets are disjoint.
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

    if (type === 'MutualTls') {
      const certRef = f.certRef.trim();
      const keyRef = f.keyRef.trim();
      if (!certRef || !keyRef) {
        this.error.set('mTLS requires cert and key references');
        return;
      }

      const p = this.profile();
      if (p) {
        this.saved.emit({
          profile: p,
          patch: {
            name,
            type,
            certRef,
            keyRef,
            caRef: f.caRef.trim(),
            passRef: f.passRef.trim(),
            thumbprint: f.thumbprint.trim(),
          },
          isNew: false,
        });
      } else {
        this.saved.emit({
          profile: {
            id: '',
            name,
            type,
            tenant: '', // filled by the view
            certRef,
            keyRef,
            caRef: f.caRef.trim(),
            passRef: f.passRef.trim(),
            thumbprint: f.thumbprint.trim(),
          },
          patch: {},
          isNew: true,
        });
      }
      return;
    }

    // Credential-type save
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

    const p = this.profile();
    if (p) {
      this.saved.emit({ profile: p, patch: patchOrNew, isNew: false });
    } else {
      this.saved.emit({
        profile: {
          id: '',
          name,
          type,
          tenant: '', // filled by the view
          ...patchOrNew,
        },
        patch: {},
        isNew: true,
      });
    }
  }
}