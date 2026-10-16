import { PipelineTask } from './pipeline-task.model';

export type JobStatus = 'Active' | 'Running' | 'Paused' | 'Draft';
export type TriggerType = 'Scheduled' | 'Webhook' | 'Manual';

export interface Job {
  id: number;
  name: string;
  slug: string;
  tenant: string;
  status: JobStatus;
  trigger: TriggerType;
  cron: string;
  created: string;
  lastRun: string;
  next: string;
  description: string;
  version: number;              // working — highest version
  publishedVersion?: number;    // latest published, absent if never
  publishedAt: string;
  publishedBy: string;
  pipeline: PipelineTask[];

  taskCount?: number;
  subTaskCount?: number;
  branchCount?: number;
  iteratorCount?: number;
}