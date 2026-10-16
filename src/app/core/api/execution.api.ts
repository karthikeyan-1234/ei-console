import { InjectionToken } from '@angular/core';
import { Execution } from '../models';

export interface TriggerResult {
  executionId: string;
  statusUrl: string;
}

export abstract class ExecutionApi {
  abstract list(): Promise<Execution[]>;
  abstract get(id: string): Promise<Execution | undefined>;
  abstract trigger(jobId: number): Promise<TriggerResult>;
  abstract replayScatterItem(execId: string, itemId: string): Promise<void>;
}

export const EXECUTION_API = new InjectionToken<ExecutionApi>('EXECUTION_API');