export type BranchStatus = 'Running' | 'Completed' | 'Failed' | 'Pending';
export type BranchChildStatus = 'Success' | 'Running' | 'Failed' | 'Pending';

export interface BranchProgressChild {
  id: string;
  type: string;
  name: string;
  status: BranchChildStatus;
  duration: number;
}

export interface BranchProgress {
  id: string;
  name: string;
  condition: string;
  status: BranchStatus;
  children: BranchProgressChild[];
}

export interface JoinProgress {
  id: string;
  name: string;
  joinMode: 'WaitAll' | 'WaitAny' | 'WaitN';
  joinThreshold: number;
  joinTimeoutSeconds: number;
  status: 'Waiting' | 'Completed' | 'Failed';
  branchesSettled: number;
  branchesTotal: number;
}