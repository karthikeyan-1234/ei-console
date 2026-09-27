import { InjectionToken } from '@angular/core';
import { Job } from '../models';

export abstract class JobApi {
  abstract list(): Promise<Job[]>;
  abstract get(id: number): Promise<Job | undefined>;
  abstract create(input: Omit<Job, 'id'>): Promise<Job>;
  abstract update(id: number, patch: Partial<Job>): Promise<Job>;
  abstract remove(id: number): Promise<void>;
  /** Bump version, stamp publishedAt/publishedBy, and flip status from Draft to Active. */
  abstract publish(id: number): Promise<Job>;
}

export const JOB_API = new InjectionToken<JobApi>('JOB_API');