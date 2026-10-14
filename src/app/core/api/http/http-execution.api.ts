import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ExecutionApi } from '../execution.api';
import { environment } from '../../../../environments/environment';
import { Execution } from '../../models';

/** Backend response shape from GET /api/ei/executions. */
interface ExecutionDto {
  id: string;
  jobId: string;
  job: string;
  tenantId: string;
  status: string;
  started: string;
  itemsDone: number;
  itemsTotal: number;
  failures: number;
  elapsedSec: number;
  correlationId: string;
  triggerSource: string;
  coreEvent: string | null;
  workerInstance: string;
  jobVersion: number;
  idempotencyKey: string | null;
  hasBranches: boolean;
}

@Injectable()
export class HttpExecutionApi extends ExecutionApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/executions`;

  async list(): Promise<Execution[]> {
    const rows = await firstValueFrom(
      this.http.get<ExecutionDto[]>(this.base),
    );
    return rows.map(toExecution);
  }

  async get(id: string): Promise<Execution | undefined> {
    const row = await firstValueFrom(
      this.http.get<ExecutionDto>(`${this.base}/${id}`),
    );
    return row ? toExecution(row) : undefined;
  }

  async replayScatterItem(execId: string, itemId: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(
        `${this.base}/${execId}/items/${itemId}/replay`,
        {},
      ),
    );
  }
}

/**
 * Projects the backend DTO into the console's Execution model. The names
 * differ in exactly two places: tenantId -> tenant, jobId string -> number.
 * Everything else carries over unchanged.
 */
function toExecution(dto: ExecutionDto): Execution {
  return {
    id: dto.id,
    job: dto.job,
    jobId: Number(dto.jobId),
    tenant: dto.tenantId,
    status: dto.status as Execution['status'],
    started: dto.started,
    itemsDone: dto.itemsDone,
    itemsTotal: dto.itemsTotal,
    failures: dto.failures,
    elapsedSec: dto.elapsedSec,
    correlationId: dto.correlationId,
    triggerSource: dto.triggerSource as Execution['triggerSource'],
    coreEvent: dto.coreEvent ?? '—',
    workerInstance: dto.workerInstance,
    jobVersion: dto.jobVersion,
    idempotencyKey: dto.idempotencyKey ?? '—',
    hasBranches: dto.hasBranches,
  };
}