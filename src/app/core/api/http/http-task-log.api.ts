import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TaskLogApi } from '../task-log.api';
import { environment } from '../../../../environments/environment';
import { TaskLogEntry } from '../../models';

interface TaskLogEntryDto {
  executionId: string; taskId: string; parentTaskId: string | null;
  orderIndex: number; name: string; type: string; status: string;
  attempt: number; started: string; completed: string;
  durationMs: number; summary: string; error?: string | null;
}

function toEntry(dto: TaskLogEntryDto): TaskLogEntry {
  return {
    executionId: dto.executionId,
    taskId: dto.taskId,
    parentTaskId: dto.parentTaskId,
    orderIndex: dto.orderIndex,
    name: dto.name,
    type: dto.type,
    status: dto.status as TaskLogEntry['status'],
    attempt: dto.attempt,
    started: dto.started,
    completed: dto.completed,
    duration: dto.durationMs,
    summary: dto.summary,
    error: dto.error ?? undefined,
  };
}

@Injectable()
export class HttpTaskLogApi extends TaskLogApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/executions`;

  async list(executionId: string): Promise<TaskLogEntry[]> {
    const rows = await firstValueFrom(
      this.http.get<TaskLogEntryDto[]>(`${this.base}/${executionId}/task-log`),
    );
    return rows.map(toEntry);
  }
}