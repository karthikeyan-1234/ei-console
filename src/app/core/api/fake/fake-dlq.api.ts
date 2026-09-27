import { Injectable } from '@angular/core';
import { DlqApi } from '../dlq.api';
import { DlqItem } from '../../models';
import { SEED_DLQ } from './seed.data';

@Injectable()
export class FakeDlqApi extends DlqApi {
  private rows: DlqItem[] = SEED_DLQ.map(d => ({ ...d }));

  async list(): Promise<DlqItem[]> {
    return this.rows.map(d => ({ ...d }));
  }

  async get(id: string): Promise<DlqItem | undefined> {
    const d = this.rows.find(x => x.id === id);
    return d ? { ...d } : undefined;
  }

  async replay(id: string): Promise<DlqItem> {
    const d = this.rows.find(x => x.id === id);
    if (!d) throw new Error(`DLQ item not found: ${id}`);
    d.status = 'Replayed';
    return { ...d };
  }

  async discard(id: string): Promise<DlqItem> {
    const d = this.rows.find(x => x.id === id);
    if (!d) throw new Error(`DLQ item not found: ${id}`);
    d.status = 'Discarded';
    return { ...d };
  }
}