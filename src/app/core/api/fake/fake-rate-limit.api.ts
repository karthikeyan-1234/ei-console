import { Injectable } from '@angular/core';
import { RateLimitApi } from '../rate-limit.api';
import { RateLimit } from '../../models';
import { SEED_RATE_LIMITS } from './seed.data';

@Injectable()
export class FakeRateLimitApi extends RateLimitApi {
  private rows: RateLimit[] = SEED_RATE_LIMITS.map(r => ({ ...r }));

  async list(): Promise<RateLimit[]> {
    return this.rows.map(r => ({ ...r }));
  }

  async get(id: string): Promise<RateLimit | undefined> {
    const r = this.rows.find(x => x.id === id);
    return r ? { ...r } : undefined;
  }

  async create(input: Omit<RateLimit, 'id'>): Promise<RateLimit> {
    const created: RateLimit = { ...input, id: 'rl-' + Math.random().toString(36).slice(2, 9) };
    this.rows.push(created);
    return { ...created };
  }

  async update(id: string, patch: Partial<RateLimit>): Promise<RateLimit> {
    const r = this.rows.find(x => x.id === id);
    if (!r) throw new Error(`Rate limit not found: ${id}`);
    Object.assign(r, patch);
    return { ...r };
  }

  async remove(id: string): Promise<void> {
    this.rows = this.rows.filter(r => r.id !== id);
  }
}