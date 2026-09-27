import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TenantApi } from '../..';
import { Tenant } from '../../../models';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class HttpTenantApi extends TenantApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/tenants`;

  list()  { return firstValueFrom(this.http.get<Tenant[]>(this.base)); }
  get(id: string) { return firstValueFrom(this.http.get<Tenant | undefined>(`${this.base}/${id}`)); }
  create(input: Omit<Tenant, 'id'>) { return firstValueFrom(this.http.post<Tenant>(this.base, input)); }
  update(id: string, patch: Partial<Tenant>) { return firstValueFrom(this.http.patch<Tenant>(`${this.base}/${id}`, patch)); }
  remove(id: string) { return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`)); }
}