import { Injectable } from '@angular/core';
import { AuthProfileApi, AuthTestResult } from '../auth-profile.api';
import { AuthProfile } from '../../models';
import { SEED_AUTH_PROFILES } from './seed.data';

@Injectable()
export class FakeAuthProfileApi extends AuthProfileApi {
  private rows: AuthProfile[] = SEED_AUTH_PROFILES.map(a => ({ ...a }));

  async list(): Promise<AuthProfile[]> {
    return this.rows.map(a => ({ ...a }));
  }

  async get(id: string): Promise<AuthProfile | undefined> {
    const a = this.rows.find(r => r.id === id);
    return a ? { ...a } : undefined;
  }

  async create(input: Omit<AuthProfile, 'id'>): Promise<AuthProfile> {
    const created: AuthProfile = { ...input, id: 'auth-' + Math.random().toString(36).slice(2, 9) };
    this.rows.push(created);
    return { ...created };
  }

  async update(id: string, patch: Partial<AuthProfile>): Promise<AuthProfile> {
    const a = this.rows.find(r => r.id === id);
    if (!a) throw new Error(`Auth profile not found: ${id}`);
    Object.assign(a, patch);
    return { ...a };
  }

  async remove(id: string): Promise<void> {
    this.rows = this.rows.filter(a => a.id !== id);
  }

  async test(_id: string): Promise<AuthTestResult> {
    await new Promise(r => setTimeout(r, 280));
    return { ok: true, message: 'TPT acquired' };
  }
}