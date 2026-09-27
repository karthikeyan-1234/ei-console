export type TaskType =
  | 'ApiPull'
  | 'Transform'
  | 'ApiPush'
  | 'Notify'
  | 'Branch'
  | 'JoinPoint';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface SubTask {
  id: string;
  type: 'ApiPush' | 'Notify';
  name: string;

  // ApiPush fields
  connectionId?: string;
  authId?: string;
  url?: string;
  method?: HttpMethod;
  body?: string;
  timeout?: number;

  // Notify fields
  kafkaTopic?: string;
}

export interface BaseTask {
  id: string;
  type: TaskType;
  name: string;
  timeout?: number;
}

export interface ApiPullTask extends BaseTask {
  type: 'ApiPull';
  connectionId: string;
  authId?: string;
  url: string;
  method: HttpMethod;
  outputKey?: string;
  sampleResponse?: string;
}

export interface TransformTask extends BaseTask {
  type: 'Transform';
  inputSource?: string;
  jsonata: string;
  sampleInput?: string;
  useSampleInput?: boolean;
  iterate?: boolean;
  outputKey?: string;
  subtasks?: SubTask[];
}

export interface ApiPushTask extends BaseTask {
  type: 'ApiPush';
  connectionId: string;
  authId?: string;
  url: string;
  method: HttpMethod;
  body?: string;
}

export interface NotifyTask extends BaseTask {
  type: 'Notify';
  kafkaTopic?: string;
  url?: string;
  body?: string;
}

export type BranchChildTask =
  | ApiPullTask
  | TransformTask
  | ApiPushTask
  | NotifyTask;

export interface BranchTask extends BaseTask {
  type: 'Branch';
  condition?: string;
  executionMode?: 'Sequential' | 'Parallel';
  children: BranchChildTask[];
}

export type JoinMode = 'WaitAll' | 'WaitAny' | 'WaitN';
export type JoinTimeoutAction = 'Fail' | 'ContinueWithSettled';

export interface JoinPointTask extends BaseTask {
  type: 'JoinPoint';
  joinMode: JoinMode;
  joinThreshold?: number;
  joinTimeoutSeconds?: number;
  joinTimeoutAction?: JoinTimeoutAction;
}

export type PipelineTask =
  | ApiPullTask
  | TransformTask
  | ApiPushTask
  | NotifyTask
  | BranchTask
  | JoinPointTask;

/** Block grouping used by the pipeline canvas renderer. */
export interface PipelineBlock {
  type: 'node' | 'fork';
  task?: PipelineTask;
  idx?: number;
  isLoneBranch?: boolean;
  branches?: { branch: BranchTask; idx: number }[];
  startIdx: number;
  endIdx: number;
}