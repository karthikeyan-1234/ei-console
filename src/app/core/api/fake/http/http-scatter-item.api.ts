import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ScatterItemApi } from '../..';
import { environment } from '../../../../../environments/environment';
import { ScatterItem } from '../../../models';


@Injectable()
export class HttpScatterItemApi extends ScatterItemApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/executions`;

  list(executionId: string) {
    return firstValueFrom(this.http.get<ScatterItem[]>(`${this.base}/${executionId}/items`));
  }

  replay(executionId: string, itemId: string) {
    return firstValueFrom(this.http.post<ScatterItem>(
      `${this.base}/${executionId}/items/${itemId}/replay`, {},
    ));
  }
}