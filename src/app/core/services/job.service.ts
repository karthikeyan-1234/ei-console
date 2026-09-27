import { Injectable, computed, inject, signal } from '@angular/core';
import { JOB_API, JobApi } from '../api/job.api';
import { Job } from '../models';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class JobService {
  private api = inject<JobApi>(JOB_API);
  private tenants = inject(TenantService);

  private readonly _jobs = signal<Job[]>([]);
  readonly jobs = this._jobs.asReadonly();

  readonly scopedJobs = computed(() =>
    this._jobs().filter(j => this.tenants.inScope(j.tenant)),
  );

  async load(): Promise<void> {
    this._jobs.set(await this.api.list());
  }

  byId(id: number): Job | undefined {
    return this._jobs().find(j => j.id === id);
  }

  /**
   * True when `slug` is already used by another job in the same tenant.
   * `excludeId` is optional so an edit can exclude the row being edited.
   */
  slugConflict(tenantId: string, slug: string, excludeId?: number): boolean {
    const low = String(slug ?? '').toLowerCase();
    if (!low) return false;
    return this._jobs().some(j =>
      j.tenant === tenantId
      && j.slug.toLowerCase() === low
      && j.id !== excludeId,
    );
  }

  async create(input: Omit<Job, 'id'>): Promise<Job> {
    const created = await this.api.create(input);
    this._jobs.update(rows => [...rows, created]);
    return created;
  }

  async update(id: number, patch: Partial<Job>): Promise<Job> {
    const updated = await this.api.update(id, patch);
    this._jobs.update(rows => rows.map(j => (j.id === id ? updated : j)));
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.api.remove(id);
    this._jobs.update(rows => rows.filter(j => j.id !== id));
  }

  async publish(id: number): Promise<Job> {
    const updated = await this.api.publish(id);
    this._jobs.update(rows => rows.map(j => (j.id === id ? updated : j)));
    return updated;
  }

  /** Counts used by the jobs-list summary line. */
  taskCount(job: Job): number { return job.pipeline.length; }
  subTaskCount(job: Job): number {
    return job.pipeline.reduce((acc, t) =>
      acc + (t.type === 'Transform' ? (t.subtasks?.length ?? 0) : 0), 0);
  }
  branchCount(job: Job): number {
    return job.pipeline.filter(t => t.type === 'Branch').length;
  }
  iteratorCount(job: Job): number {
    return job.pipeline.filter(t => t.type === 'Transform' && t.iterate).length;
  }
}