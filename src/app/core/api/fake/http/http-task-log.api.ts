import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TaskLogApi } from '../..';
import { environment } from '../../../../../environments/environment';
import { TaskLogEntry } from '../../../task-log-entry.model';


@Injectable()
export class HttpTaskLogApi extends TaskLogApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/executions`;

  list(executionId: string) {
    return firstValueFrom(this.http.get<TaskLogEntry[]>(`${this.base}/${executionId}/task-log`));
  }
}