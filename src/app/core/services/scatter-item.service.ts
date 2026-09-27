import { Injectable, inject, signal } from '@angular/core';
import { SCATTER_ITEM_API, ScatterItemApi } from '../api/scatter-item.api';
import { ScatterItem } from '../models';

@Injectable({ providedIn: 'root' })
export class ScatterItemService {
  private api = inject<ScatterItemApi>(SCATTER_ITEM_API);

  private readonly _items = signal<ScatterItem[]>([]);
  readonly items = this._items.asReadonly();

  async loadFor(executionId: string): Promise<void> {
    this._items.set(await this.api.list(executionId));
  }

  forExecution(executionId: string): ScatterItem[] {
    return this._items().filter(i => i.executionId === executionId);
  }

  async replay(executionId: string, itemId: string): Promise<ScatterItem> {
    const updated = await this.api.replay(executionId, itemId);
    this._items.update(list =>
      list.map(i =>
        i.executionId === executionId && i.id === itemId ? updated : i,
      ),
    );
    return updated;
  }
}