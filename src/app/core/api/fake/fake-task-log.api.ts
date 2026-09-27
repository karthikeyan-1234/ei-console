import { Injectable } from '@angular/core';
import { TaskLogApi } from '../task-log.api';
import { TaskLogEntry } from '../../models';
import { SEED_TASK_LOG } from './seed.data';

@Injectable()
export class FakeTaskLogApi extends TaskLogApi {
  private rows: TaskLogEntry[] = SEED_TASK_LOG.map(l => ({ ...l }));

  async list(executionId: string): Promise<TaskLogEntry[]> {
    return this.rows.filter(l => l.executionId === executionId).map(l => ({ ...l }));
  }
}