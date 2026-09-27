import { Injectable, computed, inject, signal } from '@angular/core';
import { CONNECTION_API, ConnectionApi, ConnectionTestResult } from '../api/connection.api';
import { Connection } from '../models';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private api = inject<ConnectionApi>(CONNECTION_API);
  private tenants = inject(TenantService);

  private readonly _connections = signal<Connection[]>([]);
  readonly connections = this._connections.asReadonly();

  /** Connections in the active tenant scope, plus `__shared` ones. */
  readonly scopedConnections = computed(() =>
    this._connections().filter(c => this.tenants.inScope(c.tenant)),
  );

  async load(): Promise<void> {
    this._connections.set(await this.api.list());
  }

  byId(id: string): Connection | undefined {
    return this._connections().find(c => c.id === id);
  }

  nameById(id: string): string {
    return this.byId(id)?.name ?? id;
  }

  async create(input: Omit<Connection, 'id'>): Promise<Connection> {
    const created = await this.api.create(input);
    this._connections.update(rows => [...rows, created]);
    return created;
  }

  async update(id: string, patch: Partial<Connection>): Promise<Connection> {
    const updated = await this.api.update(id, patch);
    this._connections.update(rows => rows.map(c => (c.id === id ? updated : c)));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.api.remove(id);
    this._connections.update(rows => rows.filter(c => c.id !== id));
  }

  test(id: string): Promise<ConnectionTestResult> {
    return this.api.test(id);
  }
}