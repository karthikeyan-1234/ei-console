import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Job } from '../../models';
import { JobApi } from '../job.api';



@Injectable()
export class HttpJobApi extends JobApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/jobs`;

  list()  { return firstValueFrom(this.http.get<Job[]>(this.base)); }
  get(id: number) { return firstValueFrom(this.http.get<Job | undefined>(`${this.base}/${id}`)); }
  create(input: Omit<Job, 'id'>) { return firstValueFrom(this.http.post<Job>(this.base, input)); }
  update(id: number, patch: Partial<Job>) { return firstValueFrom(this.http.patch<Job>(`${this.base}/${id}`, patch)); }
  remove(id: number) { return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`)); }
  publish(id: number) { return firstValueFrom(this.http.post<Job>(`${this.base}/${id}/publish`, {})); }
}