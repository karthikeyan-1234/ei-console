import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConnectionApi, ConnectionTestResult } from '../connection.api';
import { Connection } from '../../../models';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class HttpConnectionApi extends ConnectionApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/connections`;

  list()  { return firstValueFrom(this.http.get<Connection[]>(this.base)); }
  get(id: string) { return firstValueFrom(this.http.get<Connection | undefined>(`${this.base}/${id}`)); }
  create(input: Omit<Connection, 'id'>) { return firstValueFrom(this.http.post<Connection>(this.base, input)); }
  update(id: string, patch: Partial<Connection>) { return firstValueFrom(this.http.patch<Connection>(`${this.base}/${id}`, patch)); }
  remove(id: string) { return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`)); }
  test(id: string) { return firstValueFrom(this.http.post<ConnectionTestResult>(`${this.base}/${id}/test`, {})); }
}