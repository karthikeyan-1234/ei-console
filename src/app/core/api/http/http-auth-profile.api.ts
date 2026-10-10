import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthProfileApi, AuthTestResult } from '../auth-profile.api';
import { environment } from '../../../../environments/environment';
import { AuthProfile } from '../../models';

@Injectable()
export class HttpAuthProfileApi extends AuthProfileApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/auth-profiles`;

  list()  { return firstValueFrom(this.http.get<AuthProfile[]>(this.base)); }
  get(id: string) { return firstValueFrom(this.http.get<AuthProfile | undefined>(`${this.base}/${id}`)); }
  create(input: Omit<AuthProfile, 'id'>) { return firstValueFrom(this.http.post<AuthProfile>(this.base, input)); }
  update(id: string, patch: Partial<AuthProfile>) { return firstValueFrom(this.http.patch<AuthProfile>(`${this.base}/${id}`, patch)); }
  remove(id: string) { return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`)); }
  test(id: string) { return firstValueFrom(this.http.post<AuthTestResult>(`${this.base}/${id}/test`, {})); }
}