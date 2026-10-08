import { Injectable } from '@angular/core';
import { StoredCredentialApi } from '../stored-credential.api';
import { StoredCredential } from '../../models';
import { SEED_STORED_CREDENTIALS } from './seed.data';

@Injectable()
export class FakeStoredCredentialApi extends StoredCredentialApi {
  private rows: StoredCredential[] = SEED_STORED_CREDENTIALS.map(c => ({ ...c }));

  async list(): Promise<StoredCredential[]> {
    return this.rows.map(c => ({ ...c }));
  }

  async get(id: string): Promise<StoredCredential | undefined> {
    const c = this.rows.find(x => x.id === id);
    return c ? { ...c } : undefined;
  }

  async create(input: Omit<StoredCredential, 'id'>): Promise<StoredCredential> {
    const created: StoredCredential = {
      ...input,
      id: 'cred-' + Math.random().toString(36).slice(2, 9),
    };
    this.rows.push(created);
    return { ...created };
  }

  async update(id: string, patch: Partial<StoredCredential>): Promise<StoredCredential> {
    const c = this.rows.find(x => x.id === id);
    if (!c) throw new Error(`StoredCredential not found: ${id}`);
    Object.assign(c, patch, { updatedAt: new Date().toISOString() });
    return { ...c };
  }

  async remove(id: string): Promise<void> {
    this.rows = this.rows.filter(c => c.id !== id);
  }
}