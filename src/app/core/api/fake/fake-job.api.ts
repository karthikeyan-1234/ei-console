import { Injectable } from '@angular/core';
import { JobApi } from '../job.api';
import { Job } from '../../models';
import { SEED_JOBS } from './seed.data';

/**
 * Bump this when the shape of SEED_JOBS changes. Old payloads under a
 * previous version key are ignored and the seed is used fresh.
 */
const STORAGE_KEY = 'ei.fake.jobs.v1';

@Injectable()
export class FakeJobApi extends JobApi {
  private rows: Job[] = this.load();

  private load(): Job[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Job[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      /* Corrupted payload — fall through to the seed. */
    }
    return SEED_JOBS.map(j => this.clone(j));
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rows));
    } catch {
      /* Quota exceeded or private browsing — silently degrade. */
    }
  }

  private clone(j: Job): Job {
    return {
      ...j,
      pipeline: JSON.parse(JSON.stringify(j.pipeline)),
    };
  }

  async list(): Promise<Job[]> {
    return this.rows.map(j => this.clone(j));
  }

  async get(id: number): Promise<Job | undefined> {
    const j = this.rows.find(x => x.id === id);
    return j ? this.clone(j) : undefined;
  }

  async create(input: Omit<Job, 'id'>): Promise<Job> {
    const nextId = this.rows.reduce((m, j) => Math.max(m, j.id), 0) + 1;
    const created: Job = { ...input, id: nextId };
    this.rows.push(created);
    this.persist();
    return this.clone(created);
  }

  async update(id: number, patch: Partial<Job>): Promise<Job> {
    const j = this.rows.find(x => x.id === id);
    if (!j) throw new Error(`Job not found: ${id}`);
    Object.assign(j, patch);
    this.persist();
    return this.clone(j);
  }

  async remove(id: number): Promise<void> {
    this.rows = this.rows.filter(j => j.id !== id);
    this.persist();
  }

  async publish(id: number): Promise<Job> {
    const j = this.rows.find(x => x.id === id);
    if (!j) throw new Error(`Job not found: ${id}`);
    const wasDraft = !j.version;
    j.version = (j.version || 0) + 1;
    j.publishedAt =
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ' ' +
      new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    j.publishedBy = 'current.user';
    if (wasDraft) {
      j.status = 'Active';
      j.next =
        j.trigger === 'Scheduled'
          ? 'Pending scheduler'
          : j.trigger === 'Webhook'
            ? 'On-demand'
            : 'Manual';
    }
    this.persist();
    return this.clone(j);
  }
}