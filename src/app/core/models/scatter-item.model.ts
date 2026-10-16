export type ScatterItemStatus =
  | 'Completed'
  | 'Dispatched'
  | 'Failed'
  | 'Queued';

/** View-model consumed by the table components. Unchanged shape. */
export interface ScatterItem {
  executionId: string;
  id: string;
  task: string;
  taskId: string;
  status: ScatterItemStatus;
  http: number | string;
  attempts: number;
  completed: string;
  duration?: string;  
}

/**
 * Backend shape returned by GET /api/ei/executions/{id}/scatter-items.
 * Mirrors ScatterGatherItemDto on the API side.
 */
export interface ScatterItemDto {
  itemId: number;
  executionId: string;
  taskId: number;
  taskName: string;
  parentTaskId: number;
  itemIndex: number;
  itemKey: string | null;
  status: 'Queued' | 'Dispatched' | 'Completed' | 'Failed' | 'Cancelled';
  httpStatusCode: number | null;
  attemptCount: number;
  inputPayload: string | null;
  outputPayload: string | null;
  errorMessage: string | null;
  dispatchedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
}

/** Projects a backend DTO into the console's view-model. */
export function toScatterItem(dto: ScatterItemDto): ScatterItem {
  return {
    executionId: dto.executionId,
    id: String(dto.itemId),
    task: dto.taskName,
    taskId: String(dto.taskId),
    status: mapStatus(dto.status),
    http: dto.httpStatusCode ?? '—',
    attempts: dto.attemptCount,
    completed: dto.completedAt ? shortTime(dto.completedAt) : '—',
    duration: dto.durationMs != null ? `${dto.durationMs} ms` : '—',   // ← new
  };
}

function mapStatus(s: ScatterItemDto['status']): ScatterItemStatus {
  if (s === 'Cancelled') return 'Failed';
  return s;
}

function shortTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}