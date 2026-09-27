import { Injectable, computed, inject, signal } from '@angular/core';
import { DLQ_API, DlqApi } from '../api/dlq.api';
import { DlqItem } from '../models';

@Injectable({ providedIn: 'root' })
export class DlqService {
  private api = inject<DlqApi>(DLQ_API);

  private readonly _items = signal<DlqItem[]>([]);
  readonly items = this._items.asReadonly();

  readonly pendingCount = computed(() =>
    this._items().filter(i => i.status === 'Pending').length,
  );

  async load(): Promise<void> {
    this._items.set(await this.api.list());
  }

  byId(id: string): DlqItem | undefined {
    return this._items().find(i => i.id === id);
  }

  async replay(id: string): Promise<DlqItem> {
    const updated = await this.api.replay(id);
    this._items.update(list => list.map(i => (i.id === id ? updated : i)));
    return updated;
  }

  async discard(id: string): Promise<DlqItem> {
    const updated = await this.api.discard(id);
    this._items.update(list => list.map(i => (i.id === id ? updated : i)));
    return updated;
  }
}