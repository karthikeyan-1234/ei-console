import { InjectionToken } from '@angular/core';
import { RateLimit } from '../models';

export abstract class RateLimitApi {
  abstract list(): Promise<RateLimit[]>;
  abstract get(id: string): Promise<RateLimit | undefined>;
  abstract create(input: Omit<RateLimit, 'id'>): Promise<RateLimit>;
  abstract update(id: string, patch: Partial<RateLimit>): Promise<RateLimit>;
  abstract remove(id: string): Promise<void>;
}

export const RATE_LIMIT_API = new InjectionToken<RateLimitApi>('RATE_LIMIT_API');