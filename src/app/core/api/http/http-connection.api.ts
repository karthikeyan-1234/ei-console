import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConnectionApi, ConnectionTestResult } from '../connection.api';
import { Connection } from '../../models';
import { environment } from '../../../../environments/environment';

interface ConnectionDto {
  id: string; name: string; provider: string; protocol: string; baseUrl: string;
  port: number | null; tenantId: string; authProfileId: string | null;
  authProfileName: string | null; status: string; timeout: number; headers: string;
}

function toConnection(dto: ConnectionDto): Connection {
  return {
    id: dto.id,
    name: dto.name,
    provider: dto.provider,
    protocol: dto.protocol as Connection['protocol'],
    baseUrl: dto.baseUrl,
    port: dto.port ?? undefined,
    tenant: dto.tenantId,
    authProfile: dto.authProfileName ?? dto.authProfileId ?? '',
    status: dto.status as Connection['status'],
    timeout: dto.timeout,
    headers: dto.headers,
  };
}

@Injectable()
export class HttpConnectionApi extends ConnectionApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/connections`;

  async list(): Promise<Connection[]> {
    const rows = await firstValueFrom(this.http.get<ConnectionDto[]>(this.base));
    return rows.map(toConnection);
  }
  async get(id: string) {
    const row = await firstValueFrom(this.http.get<ConnectionDto>(`${this.base}/${id}`));
    return row ? toConnection(row) : undefined;
  }
  async create(input: Omit<Connection, 'id'>) {
    const row = await firstValueFrom(this.http.post<ConnectionDto>(this.base, input));
    return toConnection(row);
  }
  async update(id: string, patch: Partial<Connection>) {
    const row = await firstValueFrom(this.http.put<ConnectionDto>(`${this.base}/${id}`, patch));
    return toConnection(row);
  }
  async remove(id: string) {
    await firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
  test(id: string) {
    return firstValueFrom(this.http.post<ConnectionTestResult>(`${this.base}/${id}/test`, {}));
  }
}