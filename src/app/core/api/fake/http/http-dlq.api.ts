import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DlqApi } from '../..';
import { environment } from '../../../../../environments/environment';
import { DlqItem } from '../../../models';


@Injectable()
export class HttpDlqApi extends DlqApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/dlq`;

  list()  { return firstValueFrom(this.http.get<DlqItem[]>(this.base)); }
  get(id: string) { return firstValueFrom(this.http.get<DlqItem | undefined>(`${this.base}/${id}`)); }
  replay(id: string) { return firstValueFrom(this.http.post<DlqItem>(`${this.base}/${id}/replay`, {})); }
  discard(id: string) { return firstValueFrom(this.http.post<DlqItem>(`${this.base}/${id}/discard`, {})); }
}