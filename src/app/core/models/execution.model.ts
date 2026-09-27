import { BranchProgress, JoinProgress } from './branch-progress.model';

export type ExecutionStatus = 'Running' | 'Completed' | 'Failed';
export type ExecutionTriggerSource = 'Scheduled' | 'Webhook' | 'Manual';

export interface Execution {
  id: string;
  job: string;
  jobId: number;
  tenant: string;
  status: ExecutionStatus;
  started: string;
  itemsDone: number;
  itemsTotal: number;
  failures: number;
  elapsedSec: number;
  correlationId: string;
  triggerSource: ExecutionTriggerSource;
  coreEvent: string;
  workerInstance: string;
  jobVersion: number;
  idempotencyKey: string;
  hasBranches: boolean;
  branches?: BranchProgress[];
  join?: JoinProgress;
}