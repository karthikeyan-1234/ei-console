import { Injectable, inject, signal } from '@angular/core';
import { RATE_LIMIT_API, RateLimitApi } from '../api/rate-limit.api';
import { RateLimit } from '../models';

@Injectable({ providedIn: 'root' })
export class RateLimitService {
  private api = inject<RateLimitApi>(RATE_LIMIT_API);

  private readonly _policies = signal<RateLimit[]>([]);
  readonly policies = this._policies.asReadonly();

  async load(): Promise<void> {
    this._policies.set(await this.api.list());
  }

  byId(id: string): RateLimit | undefined {
    return this._policies().find(p => p.id === id);
  }

  async create(input: Omit<RateLimit, 'id'>): Promise<RateLimit> {
    const created = await this.api.create(input);
    this._policies.update(rows => [...rows, created]);
    return created;
  }

  async update(id: string, patch: Partial<RateLimit>): Promise<RateLimit> {
    const updated = await this.api.update(id, patch);
    this._policies.update(rows => rows.map(p => (p.id === id ? updated : p)));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.api.remove(id);
    this._policies.update(rows => rows.filter(p => p.id !== id));
  }
}