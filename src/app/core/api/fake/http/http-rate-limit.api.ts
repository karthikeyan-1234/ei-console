import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RateLimitApi } from '../..';
import { environment } from '../../../../../environments/environment';
import { RateLimit } from '../../../models';


@Injectable()
export class HttpRateLimitApi extends RateLimitApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/rate-limits`;

  list()  { return firstValueFrom(this.http.get<RateLimit[]>(this.base)); }
  get(id: string) { return firstValueFrom(this.http.get<RateLimit | undefined>(`${this.base}/${id}`)); }
  create(input: Omit<RateLimit, 'id'>) { return firstValueFrom(this.http.post<RateLimit>(this.base, input)); }
  update(id: string, patch: Partial<RateLimit>) { return firstValueFrom(this.http.patch<RateLimit>(`${this.base}/${id}`, patch)); }
  remove(id: string) { return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`)); }
}