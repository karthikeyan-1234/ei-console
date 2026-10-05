import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { Connection, ConnectionProtocol } from '../../../../core/models';
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

    /** True when the selected protocol is SqlServer. Drives label swaps and hides HTTP-only fields. */
  readonly isSqlServer = computed(() => this.protocol() === 'SqlServer');

  /** Label for the base-URL field, swapped per protocol. */
  readonly baseUrlLabel = computed(() =>
    this.isSqlServer() ? 'Connection String Fragment' : 'Base URL',
  );

  readonly baseUrlHint = computed(() =>
    this.isSqlServer()
      ? 'Server=tcp:host,1433;Database=DbName;Encrypt=True; — credentials come from the auth profile.'
      : '',
  );

  /** Dropdown of active tenants plus the `__shared` pseudo-tenant. */
  readonly tenantOptions = computed(() => {
    const list = this.tenants.activeTenants().map(t => ({ id: t.id, label: t.name }));
    list.push({ id: '__shared', label: 'Shared (All Tenants)' });
    return list;
  });

  /** Auth profiles that are visible from the currently selected tenant scope. */
  readonly authOptions = computed(() => {
    const scope = this.tenant();
    return this.auths.profiles().filter(a =>
      a.tenant === scope || a.tenant === '__shared' || scope === '__shared',
    );
  });

  ngOnInit(): void {
    const c = this.connection();
    if (c) {
      this.name.set(c.name);
      this.provider.set(c.provider);
      this.protocol.set(c.protocol);
      this.baseUrl.set(c.baseUrl);
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
  onProtocolInput(v: string): void { this.protocol.set(v as ConnectionProtocol); }
  onBaseUrlInput(v: string): void { this.baseUrl.set(v); }
  onTenantInput(v: string): void { this.tenant.set(v); }
  onAuthInput(v: string): void { this.authProfile.set(v); }
  onTimeoutInput(v: string): void { this.timeout.set(parseInt(v, 10) || 30000); }
  onHeadersInput(v: string): void { this.headers.set(v); }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSave(): void {
    this.error.set(null);

    const name = this.name().trim();
    if (!name) { this.error.set('Name required'); return; }

    const headers = this.headers().trim() || '{"Accept":"application/json"}';
    try {
      JSON.parse(headers);
    } catch {
      this.error.set('Default Headers must be valid JSON');
      return;
    }

    const baseUrl = this.baseUrl().trim() || 'https://api.example.com';

    const payload: Partial<Connection> = {
      name,
      provider: this.provider().trim() || 'Unknown',
      protocol: this.protocol(),
      baseUrl,
      tenant: this.tenant(),
      authProfile: this.authProfile(),
      timeout: this.timeout(),
      headers,
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
        tenant: payload.tenant!,
        authProfile: payload.authProfile ?? '',
        timeout: payload.timeout ?? 30000,
        headers: payload.headers ?? '{"Accept":"application/json"}',
        status: 'Active',
      },
      patch: {},
      isNew: true,
    });
  }
}