import { Injectable, computed, inject, signal } from '@angular/core';
import { TENANT_API, TenantApi } from '../api/tenant.api';
import { Tenant } from '../models';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private api = inject<TenantApi>(TENANT_API);

  private readonly _tenants = signal<Tenant[]>([]);
  private readonly _activeTenantId = signal<string>('broker-uae');
  private readonly _loaded = signal<boolean>(false);

  readonly tenants = this._tenants.asReadonly();
  readonly activeTenantId = this._activeTenantId.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  readonly activeTenant = computed(() =>
    this._tenants().find(t => t.id === this._activeTenantId()) ?? null,
  );

  /** Tenants visible in the current scope. The `__shared` pseudo-tenant is never listed. */
  readonly activeTenants = computed(() =>
    this._tenants().filter(t => t.active),
  );

  async load(): Promise<void> {
    const rows = await this.api.list();
    this._tenants.set(rows);
    this._loaded.set(true);

    // If the seeded active tenant is not present, fall back to the first active one.
    const current = this._activeTenantId();
    if (!rows.some(t => t.id === current && t.active)) {
      const fallback = rows.find(t => t.active);
      if (fallback) this._activeTenantId.set(fallback.id);
    }
  }

  switchTo(id: string): void {
    this._activeTenantId.set(id);
  }

  async create(input: Omit<Tenant, 'id'>): Promise<Tenant> {
    const created = await this.api.create(input);
    this._tenants.update(rows => [...rows, created]);
    return created;
  }

  async update(id: string, patch: Partial<Tenant>): Promise<Tenant> {
    const updated = await this.api.update(id, patch);
    this._tenants.update(rows => rows.map(t => (t.id === id ? updated : t)));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.api.remove(id);
    this._tenants.update(rows => rows.filter(t => t.id !== id));
    if (this._activeTenantId() === id) {
      const next = this._tenants().find(t => t.active);
      if (next) this._activeTenantId.set(next.id);
    }
  }

  /** Human-readable label for a tenant id. Handles the `__shared` pseudo-tenant. */
  labelFor(id: string): string {
    if (id === '__shared') return 'Shared';
    return this._tenants().find(t => t.id === id)?.name ?? id;
  }

  /**
   * True when a tenant-owned resource (job, connection, etc.) is visible in the
   * current tenant scope. `__shared` resources are always visible.
   */
  inScope(tenantId: string): boolean {
    return tenantId === this._activeTenantId() || tenantId === '__shared';
  }
}