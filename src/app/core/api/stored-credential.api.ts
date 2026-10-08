import { InjectionToken } from '@angular/core';
import { StoredCredential } from '../models';

export abstract class StoredCredentialApi {
  abstract list(): Promise<StoredCredential[]>;
  abstract get(id: string): Promise<StoredCredential | undefined>;
  abstract create(input: Omit<StoredCredential, 'id'>): Promise<StoredCredential>;
  abstract update(id: string, patch: Partial<StoredCredential>): Promise<StoredCredential>;
  abstract remove(id: string): Promise<void>;
}

export const STORED_CREDENTIAL_API = new InjectionToken<StoredCredentialApi>(
  'STORED_CREDENTIAL_API',
);