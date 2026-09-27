export type DlqStatus = 'Pending' | 'Replayed' | 'Discarded';

export interface DlqItem {
  id: string;
  item: string;
  source: string;
  job: string;
  status: DlqStatus;
  error: string;
  firstFailed: string;
  attempts: number;
}