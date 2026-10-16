import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Job, PipelineTask } from '../../models';
import { JobApi } from '../job.api';

interface JobSummaryDto {
  id: string; name: string; slug: string; tenantId: string; status: string;
  trigger: string; cron: string; created: string; lastRun: string; next: string;
  description: string;
  version: number;
  publishedVersion: number | null;   // new
  publishedAt: string; publishedBy: string;
  taskCount: number; subTaskCount: number; branchCount: number; iteratorCount: number;
}

interface JobDto extends JobSummaryDto {
  pipeline: unknown[];
}

@Injectable()
export class HttpJobApi extends JobApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/jobs`;

  async list(): Promise<Job[]> {
    const rows = await firstValueFrom(this.http.get<JobSummaryDto[]>(this.base));
    return rows.map(toJobSummary);
  }

  async get(id: number): Promise<Job | undefined> {
    const row = await firstValueFrom(this.http.get<JobDto>(`${this.base}/${id}`));
    return row ? toJobFull(row) : undefined;
  }

async create(input: Omit<Job, 'id'>): Promise<Job> {
  const payload = {
    name: input.name,
    tenantId: input.tenant,
    trigger: input.trigger,
    cron: input.cron === '—' || !input.cron ? null : input.cron,
    description: input.description,
  };
  const row = await firstValueFrom(
    this.http.post<JobDto>(this.base, payload),
  );
  return toJobFull(row);
}

async update(id: number, patch: Partial<Job>): Promise<Job> {
  const payload: any = {};

  if (patch.name !== undefined)        payload.name = patch.name;
  if (patch.trigger !== undefined)     payload.trigger = patch.trigger;
  if (patch.cron !== undefined)        payload.cron = patch.cron;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.pipeline !== undefined)    payload.pipeline = patch.pipeline.map(toPipelineTaskWire);

console.log('[HttpJobApi.update] payload =', JSON.stringify(payload, null, 2));

  const row = await firstValueFrom(
    this.http.put<JobDto>(`${this.base}/${id}`, payload),
  );
  return toJobFull(row);
}

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }

  async publish(id: number): Promise<Job> {
    const row = await firstValueFrom(this.http.post<JobDto>(`${this.base}/${id}/publish`, {}));
    return toJobFull(row);
  }
}

function base(dto: JobSummaryDto) {
  return {
    id: Number(dto.id),
    name: dto.name,
    slug: dto.slug,
    tenant: dto.tenantId,
    status: dto.status as Job['status'],
    trigger: dto.trigger as Job['trigger'],
    cron: dto.cron,
    created: dto.created,
    lastRun: dto.lastRun,
    next: dto.next,
    description: dto.description,
    version: dto.version,
    publishedVersion: dto.publishedVersion ?? undefined,   // new
    publishedAt: dto.publishedAt,
    publishedBy: dto.publishedBy,
  };
}

function toJobSummary(dto: JobSummaryDto): Job {
  return {
    ...base(dto),
    pipeline: [],
    taskCount: dto.taskCount,
    subTaskCount: dto.subTaskCount,
    branchCount: dto.branchCount,
    iteratorCount: dto.iteratorCount,
  } as Job;
}

function toJobFull(dto: JobDto): Job {
  return {
    ...base(dto),
    pipeline: (dto.pipeline ?? []).map(toPipelineTask),
  } as Job;
}

function toPipelineTask(raw: any): PipelineTask {
  return {
    ...raw,
    authId: raw.authProfileId ?? undefined,
    timeout: raw.timeoutSeconds ?? undefined,
    children: raw.children?.map(toPipelineTask),
    subtasks: raw.subtasks?.map(toPipelineTask),
  };
}

/**
 * Console PipelineTask → wire shape accepted by the backend's
 * PipelineTaskDto. Renames authId → authProfileId and timeout → timeoutSeconds;
 * drops console-only fields; recurses into children and subtasks.
 */
function toPipelineTaskWire(t: PipelineTask): any {
  const out: any = {
    id: t.id,
    type: t.type,
    name: t.name,
    connectionId: (t as any).connectionId || null,
    authProfileId: (t as any).authId || null,
    timeoutSeconds: t.timeout ?? null,
    outputKey: (t as any).outputKey ?? null,
  };

  const optional = [
    'url', 'method', 'body', 'sampleResponse', 'inputSource', 'jsonata',
    'useSampleInput', 'sampleInput', 'kafkaTopic', 'condition',
    'executionMode', 'joinMode', 'joinThreshold', 'joinTimeoutSeconds',
    'joinTimeoutAction', 'iterate', 'remotePath', 'fileFormat',
    'deleteAfterDownload', 'query', 'queryTimeout', 'batchSize',
    'maxConcurrency',
  ];
  for (const key of optional) {
    const v = (t as any)[key];
    if (v !== undefined) out[key] = v;
  }

  const children = (t as any).children;
  if (Array.isArray(children)) out.children = children.map(toPipelineTaskWire);

  const subtasks = (t as any).subtasks;
  if (Array.isArray(subtasks)) out.subtasks = subtasks.map(toPipelineTaskWire);

  return out;
}