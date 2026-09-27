import { InjectionToken } from '@angular/core';
import { AuthProfile } from '../models';

export interface AuthTestResult {
  ok: boolean;
  message: string;
}

export abstract class AuthProfileApi {
  abstract list(): Promise<AuthProfile[]>;
  abstract get(id: string): Promise<AuthProfile | undefined>;
  abstract create(input: Omit<AuthProfile, 'id'>): Promise<AuthProfile>;
  abstract update(id: string, patch: Partial<AuthProfile>): Promise<AuthProfile>;
  abstract remove(id: string): Promise<void>;
  abstract test(id: string): Promise<AuthTestResult>;
}

export const AUTH_PROFILE_API = new InjectionToken<AuthProfileApi>('AUTH_PROFILE_API');