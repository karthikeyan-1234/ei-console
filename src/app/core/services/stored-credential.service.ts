import { Injectable, computed, inject, signal } from '@angular/core';
import { STORED_CREDENTIAL_API, StoredCredentialApi } from '../api/stored-credential.api';
import { StoredCredential } from '../models';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class StoredCredentialService {
  private api = inject<StoredCredentialApi>(STORED_CREDENTIAL_API);
  private tenants = inject(TenantService);

  private readonly _credentials = signal<StoredCredential[]>([]);
  readonly credentials = this._credentials.asReadonly();

  /** Credentials in the active tenant scope, plus any shared ones. */
  readonly scopedCredentials = computed(() =>
    this._credentials().filter(c => this.tenants.inScope(c.tenant)),
  );

  /** Count of credentials that are still stored as plaintext. */
  readonly plaintextCount = computed(() =>
    this._credentials().filter(c => c.encryptionState === 'Plaintext').length,
  );

  async load(): Promise<void> {
    this._credentials.set(await this.api.list());
  }

  byId(id: string): StoredCredential | undefined {
    return this._credentials().find(c => c.id === id);
  }

  nameById(id: string): string {
    return this.byId(id)?.name ?? id;
  }

  async create(input: Omit<StoredCredential, 'id'>): Promise<StoredCredential> {
    const created = await this.api.create(input);
    this._credentials.update(rows => [...rows, created]);
    return created;
  }

  async update(id: string, patch: Partial<StoredCredential>): Promise<StoredCredential> {
    const updated = await this.api.update(id, patch);
    this._credentials.update(rows => rows.map(c => (c.id === id ? updated : c)));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.api.remove(id);
    this._credentials.update(rows => rows.filter(c => c.id !== id));
  }
}