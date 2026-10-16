import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConnectionApi, ConnectionTestResult } from '../connection.api';
import { Connection, ConnectionProtocol } from '../../models';
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

/**
 * Resolves the port value the backend's CK_connections_port_protocol
 * constraint requires:
 *   Ftp      → port must be non-null (default 21)
 *   Sftp     → port must be non-null (default 22)
 *   Anything → port must be null
 *
 * The console's model allows port to be undefined for any protocol. The
 * backend does not. This is the translation boundary.
 */
function resolvePortFor(
  protocol: ConnectionProtocol,
  requested: number | null | undefined,
): number | null {
  const isFileTransfer = protocol === 'Ftp' || protocol === 'Sftp';
  if (!isFileTransfer) return null;

  if (typeof requested === 'number'
      && !isNaN(requested)
      && requested >= 1
      && requested <= 65535) {
    return requested;
  }

  return protocol === 'Sftp' ? 22 : 21;
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
async create(input: Omit<Connection, 'id'>): Promise<Connection> {
  const payload = {
    name: input.name,
    provider: input.provider,
    protocol: input.protocol,
    baseUrl: input.baseUrl,
    port: resolvePortFor(input.protocol, input.port),
    tenantId: input.tenant,
    authProfileId: input.authProfile || null,
    timeout: input.timeout,
    headers: input.headers,
  };
  const row = await firstValueFrom(
    this.http.post<ConnectionDto>(this.base, payload),
  );
  return toConnection(row);
}

async update(id: string, patch: Partial<Connection>): Promise<Connection> {
  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined)        payload['name'] = patch.name;
  if (patch.provider !== undefined)    payload['provider'] = patch.provider;
  if (patch.protocol !== undefined)    payload['protocol'] = patch.protocol;
  if (patch.baseUrl !== undefined)     payload['baseUrl'] = patch.baseUrl;
  if (patch.tenant !== undefined)      payload['tenantId'] = patch.tenant;
  if (patch.authProfile !== undefined) payload['authProfileId'] = patch.authProfile || null;
  if (patch.timeout !== undefined)     payload['timeout'] = patch.timeout;
  if (patch.headers !== undefined)     payload['headers'] = patch.headers;

  // Port requires the protocol to decide its value. If both are supplied
  // together, resolve. If only one is supplied, don't touch the port at
  // all — the backend's UpdateAsync treats a null as "leave as-is".
  if (patch.protocol !== undefined) {
    payload['port'] = resolvePortFor(patch.protocol, patch.port);
  }

  const row = await firstValueFrom(
    this.http.put<ConnectionDto>(`${this.base}/${id}`, payload),
  );
  return toConnection(row);
}
  async remove(id: string) {
    await firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
  test(id: string) {
    return firstValueFrom(this.http.post<ConnectionTestResult>(`${this.base}/${id}/test`, {}));
  }

  
}