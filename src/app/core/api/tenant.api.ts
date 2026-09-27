import { InjectionToken } from '@angular/core';
import { Tenant } from '../models';

export abstract class TenantApi {
  abstract list(): Promise<Tenant[]>;
  abstract get(id: string): Promise<Tenant | undefined>;
  abstract create(input: Omit<Tenant, 'id'>): Promise<Tenant>;
  abstract update(id: string, patch: Partial<Tenant>): Promise<Tenant>;
  abstract remove(id: string): Promise<void>;
}

export const TENANT_API = new InjectionToken<TenantApi>('TENANT_API');