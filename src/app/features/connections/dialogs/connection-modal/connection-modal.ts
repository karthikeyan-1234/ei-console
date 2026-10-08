import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AuthType, Connection, ConnectionProtocol } from '../../../../core/models';
import { AuthProfileService } from '../../../../core/services/auth-profile.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell';

export interface ConnectionSaveEvent {
  connection: Connection;
  patch: Partial<Connection>;
  isNew: boolean;
}

@Component({
  selector: 'ei-connection-modal',
  imports: [ModalShellComponent],
  templateUrl: './connection-modal.html',
})
export class ConnectionModalComponent implements OnInit {
  private readonly auths = inject(AuthProfileService);
  private readonly tenants = inject(TenantService);

  readonly connection = input<Connection | null>(null);

  readonly saved = output<ConnectionSaveEvent>();
  readonly cancelled = output<void>();

  readonly name = signal('');
  readonly provider = signal('');
  readonly protocol = signal<ConnectionProtocol>('Rest');
  readonly baseUrl = signal('');
  readonly port = signal<number | null>(null);
  readonly tenant = signal('');
  readonly authProfile = signal('');
  readonly timeout = signal(30000);
  readonly headers = signal('{"Accept":"application/json"}');
  readonly error = signal<string | null>(null);

  readonly isEdit = computed(() => this.connection() !== null);
  readonly title = computed(() => (this.isEdit() ? 'Edit Connection' : 'New Connection'));
  readonly subtitle = computed(() =>
    this.isEdit() ? 'Update provider endpoint' : 'Register a provider endpoint',
  );

  readonly isHttpProtocol = computed(() => {
    const p = this.protocol();
    return p === 'Rest' || p === 'Soap' || p === 'Json';
  });
  readonly isSqlServer = computed(() => this.protocol() === 'SqlServer');
  readonly isFileTransfer = computed(() => {
    const p = this.protocol();
    return p === 'Ftp' || p === 'Sftp';
  });

  readonly baseUrlLabel = computed(() => {
    if (this.isSqlServer()) return 'Connection String Fragment';
    if (this.isFileTransfer()) return 'Host';
    return 'Base URL';
  });

  readonly baseUrlHint = computed(() => {
    if (this.isSqlServer()) {
      return 'Server=tcp:host,1433;Database=DbName;Encrypt=True; — credentials come from the auth profile.';
    }
    if (this.isFileTransfer()) {
      return 'Just the hostname. The port goes in the field below.';
    }
    return '';
  });

  readonly timeoutLabel = computed(() =>
    this.isHttpProtocol() ? 'Timeout (ms)' : 'Timeout (seconds)',
  );

  readonly defaultPortFor = computed(() => {
    switch (this.protocol()) {
      case 'Ftp':  return 21;
      case 'Sftp': return 22;
      default:     return null;
    }
  });

  /** Dropdown of active tenants plus the `__shared` pseudo-tenant. */
  readonly tenantOptions = computed(() => {
    const list = this.tenants.activeTenants().map(t => ({ id: t.id, label: t.name }));
    list.push({ id: '__shared', label: 'Shared (All Tenants)' });
    return list;
  });

  /**
   * Auth profiles compatible with the selected protocol, scoped to the
   * currently-selected tenant.
   *   Rest | Soap | Json  →  Keycloak, OAuth2, ApiKey, WS-Security, mTLS
   *   SqlServer           →  SqlServerConnectionString
   *   Ftp                 →  FtpCredentials
   *   Sftp                →  FtpCredentials, SftpKeyCredentials
   */
  readonly authOptions = computed(() => {
    const scope = this.tenant();
    const proto = this.protocol();
    const compatible = (t: AuthType): boolean => {
      switch (proto) {
        case 'SqlServer': return t === 'SqlServerConnectionString';
        case 'Ftp':       return t === 'FtpCredentials';
        case 'Sftp':      return t === 'FtpCredentials' || t === 'SftpKeyCredentials';
        default:
          return t === 'KeycloakAuthCodeExchange'
              || t === 'OAuth2ClientCredentials'
              || t === 'ApiKey'
              || t === 'WsSecurityUsernameToken'
              || t === 'MutualTls';
      }
    };
    return this.auths.profiles().filter(a =>
      (a.tenant === scope || a.tenant === '__shared' || scope === '__shared')
      && compatible(a.type),
    );
  });

  ngOnInit(): void {
    const c = this.connection();
    if (c) {
      this.name.set(c.name);
      this.provider.set(c.provider);
      this.protocol.set(c.protocol);
      this.baseUrl.set(c.baseUrl);
      this.port.set(c.port ?? null);
      this.tenant.set(c.tenant);
      this.authProfile.set(c.authProfile ?? '');
      this.timeout.set(c.timeout ?? 30000);
      this.headers.set(c.headers ?? '{"Accept":"application/json"}');
    } else {
      this.tenant.set(this.tenants.activeTenantId());
    }
  }

  onNameInput(v: string): void { this.name.set(v); }
  onProviderInput(v: string): void { this.provider.set(v); }

  onProtocolInput(v: string): void {
    const prev = this.protocol();
    const next = v as ConnectionProtocol;
    this.protocol.set(next);

    // Auto-correct timeout when switching between ms-based (HTTP) and
    // s-based (everything else) protocols. 30000 seconds is nonsense, and
    // 30 milliseconds is useless. The threshold of 1000 is a safe heuristic
    // — no HTTP connection runs in <1s, and no FTP/SQL connection runs in
    // >1000s.
    const wasHttp = prev === 'Rest' || prev === 'Soap' || prev === 'Json';
    const isHttp = next === 'Rest' || next === 'Soap' || next === 'Json';
    if (wasHttp !== isHttp) {
      const t = this.timeout();
      if (isHttp && t < 1000) {
        this.timeout.set(30000);
      } else if (!isHttp && t >= 1000) {
        this.timeout.set(next === 'Sftp' ? 60 : 30);
      }
    }

    // If switching to Ftp/Sftp and no port is set, pre-fill the default.
    if (!this.port()) {
      if (next === 'Ftp') this.port.set(21);
      else if (next === 'Sftp') this.port.set(22);
    }

    // Auth compatibility — if the currently-selected profile no longer
    // matches, clear it. The dropdown will only show compatible options.
    const current = this.authProfile();
    if (current) {
      const stillCompatible = this.authOptions().some(a => a.id === current);
      if (!stillCompatible) this.authProfile.set('');
    }
  }

  onBaseUrlInput(v: string): void { this.baseUrl.set(v); }
  onPortInput(v: string): void {
    const n = parseInt(v, 10);
    this.port.set(isNaN(n) ? null : n);
  }
  onTenantInput(v: string): void {
    this.tenant.set(v);
    // Auth options depend on tenant scope; clear if no longer compatible.
    const current = this.authProfile();
    if (current && !this.authOptions().some(a => a.id === current)) {
      this.authProfile.set('');
    }
  }
  onAuthInput(v: string): void { this.authProfile.set(v); }
  onTimeoutInput(v: string): void { this.timeout.set(parseInt(v, 10) || 30); }
  onHeadersInput(v: string): void { this.headers.set(v); }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSave(): void {
    this.error.set(null);

    const name = this.name().trim();
    if (!name) { this.error.set('Name required'); return; }

    const headers = this.headers().trim() || '{"Accept":"application/json"}';
    if (this.isHttpProtocol()) {
      try {
        JSON.parse(headers);
      } catch {
        this.error.set('Default Headers must be valid JSON');
        return;
      }
    }

    const baseUrl = this.baseUrl().trim() || (
      this.isFileTransfer() ? 'ftp.example.com' : 'https://api.example.com'
    );

    if (this.isFileTransfer()) {
      const p = this.port();
      if (p !== null && (p < 1 || p > 65535)) {
        this.error.set('Port must be between 1 and 65535.');
        return;
      }
    }

    const payload: Partial<Connection> = {
      name,
      provider: this.provider().trim() || 'Unknown',
      protocol: this.protocol(),
      baseUrl,
      port: this.isFileTransfer() ? (this.port() ?? this.defaultPortFor() ?? undefined) : undefined,
      tenant: this.tenant(),
      authProfile: this.authProfile(),
      timeout: this.timeout(),
      headers: this.isHttpProtocol() ? headers : '',
      status: 'Active',
    };

    const c = this.connection();
    if (c) {
      this.saved.emit({ connection: c, patch: payload, isNew: false });
      return;
    }

    this.saved.emit({
      connection: {
        id: '',
        name: payload.name!,
        provider: payload.provider!,
        protocol: payload.protocol!,
        baseUrl: payload.baseUrl!,
        port: payload.port,
        tenant: payload.tenant!,
        authProfile: payload.authProfile ?? '',
        timeout: payload.timeout ?? 30,
        headers: payload.headers ?? '',
        status: 'Active',
      },
      patch: {},
      isNew: true,
    });
  }
}