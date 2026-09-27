import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ExecutionApi } from '../..';
import { environment } from '../../../../../environments/environment';
import { Execution } from '../../../models';


@Injectable()
export class HttpExecutionApi extends ExecutionApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/executions`;

  list()  { return firstValueFrom(this.http.get<Execution[]>(this.base)); }
  get(id: string) { return firstValueFrom(this.http.get<Execution | undefined>(`${this.base}/${id}`)); }
  replayScatterItem(execId: string, itemId: string) {
    return firstValueFrom(this.http.post<void>(`${this.base}/${execId}/items/${itemId}/replay`, {}));
  }
}