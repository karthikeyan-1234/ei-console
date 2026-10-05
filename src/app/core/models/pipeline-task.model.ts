export type TaskType =
  | 'ApiPull'
  | 'SqlQuery'
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

  connectionId?: string;
  authId?: string;
  url?: string;
  method?: HttpMethod;
  body?: string;
  timeout?: number;

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

/**
 * A SQL Server query executed against a `SqlServer`-protocol connection.
 * The connection's auth profile supplies the credentials — either from a
 * Key Vault reference or from the inline connection string, depending on
 * the profile's `credentialStorageMode`.
 *
 * The result set is a JSON array of row objects, which feeds the pipeline
 * context under `outputKey` and can be transformed, filtered, or iterated
 * by any downstream task.
 */
export interface SqlQueryTask extends BaseTask {
  type: 'SqlQuery';
  connectionId: string;
  authId?: string;
  /** T-SQL statement. Row-returning queries only. */
  query: string;
  /** Query timeout in seconds. Overrides the connection's default. */
  queryTimeout?: number;
  /** Where the result set is stored in the pipeline context. */
  outputKey?: string;
  /** Sample result set (JSON array) for the demo. Real execution uses the connection. */
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
  | SqlQueryTask
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
  | SqlQueryTask
  | TransformTask
  | ApiPushTask
  | NotifyTask
  | BranchTask
  | JoinPointTask;

export interface PipelineBlock {
  type: 'node' | 'fork';
  task?: PipelineTask;
  idx?: number;
  isLoneBranch?: boolean;
  branches?: { branch: BranchTask; idx: number }[];
  startIdx: number;
  endIdx: number;
}