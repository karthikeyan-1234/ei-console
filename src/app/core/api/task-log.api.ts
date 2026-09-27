import { InjectionToken } from '@angular/core';
import { TaskLogEntry } from '../models';

export abstract class TaskLogApi {
  abstract list(executionId: string): Promise<TaskLogEntry[]>;
}

export const TASK_LOG_API = new InjectionToken<TaskLogApi>('TASK_LOG_API');