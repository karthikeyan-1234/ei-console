import { Injectable, inject, signal } from '@angular/core';
import { TASK_LOG_API, TaskLogApi } from '../api/task-log.api';
import { TaskLogEntry } from '../models';

@Injectable({ providedIn: 'root' })
export class TaskLogService {
  private api = inject<TaskLogApi>(TASK_LOG_API);

  private readonly _entries = signal<TaskLogEntry[]>([]);
  readonly entries = this._entries.asReadonly();

  async loadFor(executionId: string): Promise<void> {
    this._entries.set(await this.api.list(executionId));
  }

  forExecution(executionId: string): TaskLogEntry[] {
    return this._entries().filter(e => e.executionId === executionId);
  }
}