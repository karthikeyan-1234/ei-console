export type WatermarkType = 'Timestamp' | 'SequenceToken' | 'PageCursor';

export interface Watermark {
  id: string;
  tenant: string;
  jobId: number;
  jobName: string;
  entityName: string;
  type: WatermarkType;
  value: string;
  updatedAt: string;
}