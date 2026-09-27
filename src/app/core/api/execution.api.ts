import { InjectionToken } from '@angular/core';
import { Execution } from '../models';

export abstract class ExecutionApi {
  abstract list(): Promise<Execution[]>;
  abstract get(id: string): Promise<Execution | undefined>;
  /** Simulated replay of a single scatter item — a real backend queues a new work unit. */
  abstract replayScatterItem(execId: string, itemId: string): Promise<void>;
}

export const EXECUTION_API = new InjectionToken<ExecutionApi>('EXECUTION_API');