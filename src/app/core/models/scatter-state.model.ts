import { ScatterItem, ScatterItemStatus } from './scatter-item.model';

export interface ScatterState {
  running: boolean;
  total: number;
  subTaskCount: number;

  completed: number;
  dispatched: number;
  failed: number;
  queued: number;

  maxConcurrent: number;
  rps: number;
  tokens: number;
  tokensMax: number;
  rpsThisSecond: number;

  avgLatency: number;
  p95: number;

  items: ScatterItem[];
  filter: 'all' | ScatterItemStatus | Lowercase<ScatterItemStatus>;
}