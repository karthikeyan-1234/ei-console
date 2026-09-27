import { Injectable } from '@angular/core';
import { TenantApi } from '../tenant.api';
import { Tenant } from '../../models';
import { SEED_TENANTS } from './seed.data';

@Injectable()
export class FakeTenantApi extends TenantApi {
  private rows: Tenant[] = SEED_TENANTS.map(t => ({ ...t }));

  async list(): Promise<Tenant[]> {
    return this.rows.map(t => ({ ...t }));
  }

  async get(id: string): Promise<Tenant | undefined> {
    const t = this.rows.find(r => r.id === id);
    return t ? { ...t } : undefined;
  }

  async create(input: Omit<Tenant, 'id'>): Promise<Tenant> {
    const created: Tenant = { ...input, id: input.code };
    this.rows.push(created);
    return { ...created };
  }

  async update(id: string, patch: Partial<Tenant>): Promise<Tenant> {
    const t = this.rows.find(r => r.id === id);
    if (!t) throw new Error(`Tenant not found: ${id}`);
    Object.assign(t, patch);
    return { ...t };
  }

  async remove(id: string): Promise<void> {
    this.rows = this.rows.filter(t => t.id !== id);
  }
}