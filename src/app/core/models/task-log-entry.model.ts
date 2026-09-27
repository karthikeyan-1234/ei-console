export type TaskLogStatus = 'Success' | 'Running' | 'Failed' | 'Pending';

export interface TaskLogEntry {
  executionId: string;
  taskId: string;
  parentTaskId?: string | null;
  orderIndex: number;
  name: string;
  type: string;
  status: TaskLogStatus;
  attempt: number;
  started: string;
  completed: string;
  duration: number;
  summary: string;
}