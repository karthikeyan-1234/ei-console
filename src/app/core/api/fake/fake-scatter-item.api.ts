import { Injectable } from '@angular/core';
import { ScatterItemApi } from '../scatter-item.api';
import { ScatterItem } from '../../models';
import { SEED_SCATTER_ITEMS } from './seed.data';

@Injectable()
export class FakeScatterItemApi extends ScatterItemApi {
  private rows: ScatterItem[] = SEED_SCATTER_ITEMS.map(s => ({ ...s }));

  async list(executionId: string): Promise<ScatterItem[]> {
    return this.rows.filter(s => s.executionId === executionId).map(s => ({ ...s }));
  }

  async replay(executionId: string, itemId: string): Promise<ScatterItem> {
    const s = this.rows.find(x => x.executionId === executionId && x.id === itemId);
    if (!s) throw new Error(`Scatter item not found: ${executionId}/${itemId}`);
    s.status = 'Dispatched';
    s.http = '—';
    s.attempts += 1;
    s.completed = '—';
    return { ...s };
  }
}