import { InjectionToken } from '@angular/core';
import { DlqItem } from '../models';

export abstract class DlqApi {
  abstract list(): Promise<DlqItem[]>;
  abstract get(id: string): Promise<DlqItem | undefined>;
  /** Marks the row as Replayed. A real backend enqueues a fresh execution. */
  abstract replay(id: string): Promise<DlqItem>;
  abstract discard(id: string): Promise<DlqItem>;
}

export const DLQ_API = new InjectionToken<DlqApi>('DLQ_API');