import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ScatterItem, ScatterItemDto, toScatterItem } from '../../models';
import { ScatterItemApi } from '../scatter-item.api';

@Injectable()
export class HttpScatterItemApi extends ScatterItemApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/executions`;

  async list(executionId: string): Promise<ScatterItem[]> {
    const rows = await firstValueFrom(
      this.http.get<ScatterItemDto[]>(
        `${this.base}/${executionId}/scatter-items`,
      ),
    );
    return rows.map(toScatterItem);
  }

  async replay(_executionId: string, _itemId: string): Promise<ScatterItem> {
    throw new Error(
      'Replay is not yet supported against the real backend. ' +
      'This will land when the DLQ replay endpoint is implemented.',
    );
  }
}