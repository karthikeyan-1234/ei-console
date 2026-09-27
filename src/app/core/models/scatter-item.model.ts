export type ScatterItemStatus = 'Completed' | 'Dispatched' | 'Failed' | 'Queued';

export interface ScatterItem {
  executionId: string;
  id: string;
  task: string;
  taskId: string;
  status: ScatterItemStatus;
  http: number | string;
  attempts: number;
  completed: string;
}