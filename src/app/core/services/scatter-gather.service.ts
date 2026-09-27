import { Injectable, computed, signal } from '@angular/core';
import { ScatterItem, ScatterState } from '../models';

@Injectable({ providedIn: 'root' })
export class ScatterGatherService {
  private readonly _state = signal<ScatterState>(this.emptyState());
  readonly state = this._state.asReadonly();

  // Convenience computed signals used by the view template
  readonly running = computed(() => this._state().running);
  readonly completed = computed(() => this._state().completed);
  readonly dispatched = computed(() => this._state().dispatched);
  readonly failed = computed(() => this._state().failed);
  readonly queued = computed(() => this._state().queued);
  readonly tokens = computed(() => this._state().tokens);
  readonly tokensMax = computed(() => this._state().tokensMax);
  readonly maxConcurrent = computed(() => this._state().maxConcurrent);
  readonly rps = computed(() => this._state().rps);
  readonly rpsThisSecond = computed(() => this._state().rpsThisSecond);
  readonly avgLatency = computed(() => this._state().avgLatency);
  readonly p95 = computed(() => this._state().p95);
  readonly filter = computed(() => this._state().filter);

  readonly totalUnits = computed(() =>
    this._state().total * this._state().subTaskCount,
  );

  readonly filteredItems = computed(() => {
    const { items, filter } = this._state();
    const filtered = filter === 'all'
      ? items
      : items.filter(i => i.status.toLowerCase() === filter);

    if (filter !== 'all') return filtered.slice(0, 100);

    // In "all" mode, order by urgency: Failed → Dispatched → Queued → Completed
    const rank: Record<string, number> = { Failed: 0, Dispatched: 1, Queued: 2, Completed: 3 };
    return [...filtered]
      .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9))
      .slice(0, 100);
  });

  private timerId: ReturnType<typeof setInterval> | null = null;

  private emptyState(): ScatterState {
    return {
      running: false,
      total: 500,
      subTaskCount: 2,
      completed: 0,
      dispatched: 0,
      failed: 0,
      queued: 500,
      maxConcurrent: 20,
      rps: 50,
      tokens: 1000,
      tokensMax: 1000,
      rpsThisSecond: 0,
      avgLatency: 142,
      p95: 320,
      items: [],
      filter: 'all',
    };
  }

  /** Rebuilds the item list with the demo's 412 / 8 / 3 split. */
  reset(): void {
    this.stop();
    const total = 500;
    const subTaskCount = 2;
    const subTasks = ['ApiPush', 'Notify'] as const;
    const items: ScatterItem[] = [];

    for (let i = 0; i < total; i++) {
      const key = `POL-${String(i + 1).padStart(6, '0')}`;
      for (let j = 0; j < subTaskCount; j++) {
        items.push({
          executionId: '9e1bc82',
          id: key,
          task: subTasks[j],
          taskId: 's1',
          status: 'Queued',
          http: '—',
          attempts: 0,
          completed: '—',
        });
      }
    }

    const seededCompleted = 412 * subTaskCount;
    const seededDispatched = 8 * subTaskCount;
    const seededFailed = 3 * subTaskCount;

    let idx = 0;
    for (let c = 0; c < seededCompleted && idx < items.length; c++, idx++) {
      items[idx].status = 'Completed';
      items[idx].http = Math.random() > 0.9 ? 201 : 200;
      items[idx].attempts = 1;
    }
    for (let d = 0; d < seededDispatched && idx < items.length; d++, idx++) {
      items[idx].status = 'Dispatched';
      items[idx].attempts = 1;
    }
    for (let f = 0; f < seededFailed && idx < items.length; f++, idx++) {
      items[idx].status = 'Failed';
      items[idx].http = 503;
      items[idx].attempts = 3;
    }

    this._state.set({
      ...this.emptyState(),
      items,
      completed: seededCompleted,
      dispatched: seededDispatched,
      failed: seededFailed,
      queued: items.filter(i => i.status === 'Queued').length,
    });
  }

  start(): void {
    if (this.timerId) return;
    this._state.update(s => ({ ...s, running: true }));

    this.timerId = setInterval(() => {
      this.tick();
    }, 250);
  }

  pause(): void {
    this.stop();
  }

  private stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this._state.update(s => ({ ...s, running: false }));
  }

  setFilter(filter: ScatterState['filter']): void {
    this._state.update(s => ({ ...s, filter }));
  }

  private tick(): void {
    this._state.update(s => {
      const next: ScatterState = {
        ...s,
        items: s.items.map(i => ({ ...i })),
      };

      // Token bucket refill
      next.tokens = Math.min(next.tokensMax, next.tokens + Math.ceil(next.rps / 4));
      next.rpsThisSecond = Math.min(next.rps, next.rpsThisSecond + Math.ceil(Math.random() * 5));

      // Complete some in-flight items
      let toComplete = Math.min(next.dispatched, 1 + Math.floor(Math.random() * 4));
      for (const it of next.items) {
        if (toComplete <= 0) break;
        if (it.status !== 'Dispatched') continue;

        if (Math.random() < 0.03) {
          it.status = 'Failed';
          it.http = [500, 502, 503, 429][Math.floor(Math.random() * 4)];
          it.attempts += 1;
          next.failed++;
        } else {
          it.status = 'Completed';
          it.http = Math.random() > 0.85 ? 201 : 200;
          it.attempts = Math.max(1, it.attempts);
          next.completed++;
        }
        next.dispatched--;
        toComplete--;
      }

      // Dispatch new items
      const budget = Math.min(
        next.maxConcurrent - next.dispatched,
        Math.floor(next.tokens / 5),
        8,
      );
      let toDispatch = budget;
      for (const it of next.items) {
        if (toDispatch <= 0) break;
        if (it.status !== 'Queued') continue;
        it.status = 'Dispatched';
        it.attempts = 1;
        next.dispatched++;
        next.queued--;
        next.tokens = Math.max(0, next.tokens - 5);
        toDispatch--;
      }

      // Latency stats from completed items (approximate — no live durations stored)
      if (next.completed > 0) {
        next.avgLatency = 142;
        next.p95 = 320;
      }

      return next;
    });

    const s = this._state();
    if (s.completed + s.failed >= s.items.length) this.pause();
  }

  /** Replays a single failed item by flipping it back to Dispatched. */
  replayItem(key: string, subTask: string): void {
    this._state.update(s => {
      const items = s.items.map(i => ({ ...i }));
      const it = items.find(i => i.id === key && i.task === subTask);
      if (!it || it.status !== 'Failed') return s;

      it.http = '—';
      if (s.dispatched >= s.maxConcurrent) {
        it.status = 'Queued';
        return { ...s, items, failed: Math.max(0, s.failed - 1), queued: s.queued + 1 };
      }
      it.status = 'Dispatched';
      it.attempts += 1;
      return {
        ...s,
        items,
        failed: Math.max(0, s.failed - 1),
        dispatched: s.dispatched + 1,
      };
    });

    // Complete it after a short delay
    setTimeout(() => {
      this._state.update(s => {
        const items = s.items.map(i => ({ ...i }));
        const it = items.find(i => i.id === key && i.task === subTask);
        if (!it || it.status !== 'Dispatched') return s;
        it.status = 'Completed';
        it.http = 200;
        return {
          ...s,
          items,
          dispatched: Math.max(0, s.dispatched - 1),
          completed: s.completed + 1,
        };
      });
    }, 1200);
  }
}