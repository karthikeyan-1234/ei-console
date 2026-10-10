import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WatermarkApi } from '../watermark.api';
import { environment } from '../../../../environments/environment';
import { Watermark } from '../../models';


@Injectable()
export class HttpWatermarkApi extends WatermarkApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/watermarks`;

  list()  { return firstValueFrom(this.http.get<Watermark[]>(this.base)); }
  get(id: string) { return firstValueFrom(this.http.get<Watermark | undefined>(`${this.base}/${id}`)); }
  update(id: string, patch: Partial<Watermark>) { return firstValueFrom(this.http.patch<Watermark>(`${this.base}/${id}`, patch)); }
}