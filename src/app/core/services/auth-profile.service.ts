import { Injectable, computed, inject, signal } from '@angular/core';
import { AUTH_PROFILE_API, AuthProfileApi, AuthTestResult } from '../api/auth-profile.api';
import { AuthProfile } from '../models';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class AuthProfileService {
  private api = inject<AuthProfileApi>(AUTH_PROFILE_API);
  private tenants = inject(TenantService);

  private readonly _profiles = signal<AuthProfile[]>([]);
  readonly profiles = this._profiles.asReadonly();

  readonly scopedProfiles = computed(() =>
    this._profiles().filter(a => this.tenants.inScope(a.tenant)),
  );

  async load(): Promise<void> {
    this._profiles.set(await this.api.list());
  }

  byId(id: string): AuthProfile | undefined {
    return this._profiles().find(a => a.id === id);
  }

  async create(input: Omit<AuthProfile, 'id'>): Promise<AuthProfile> {
    const created = await this.api.create(input);
    this._profiles.update(rows => [...rows, created]);
    return created;
  }

  async update(id: string, patch: Partial<AuthProfile>): Promise<AuthProfile> {
    const updated = await this.api.update(id, patch);
    this._profiles.update(rows => rows.map(a => (a.id === id ? updated : a)));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.api.remove(id);
    this._profiles.update(rows => rows.filter(a => a.id !== id));
  }

  test(id: string): Promise<AuthTestResult> {
    return this.api.test(id);
  }
}