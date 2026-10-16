import { Injectable, computed, inject, signal } from '@angular/core';
import { EXECUTION_API, ExecutionApi } from '../api/execution.api';
import { Execution } from '../models';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class ExecutionService {
  private api = inject<ExecutionApi>(EXECUTION_API);
  private tenants = inject(TenantService);

  private readonly _executions = signal<Execution[]>([]);
  private readonly _selectedId = signal<string | null>(null);
  private readonly _tick = signal(0);

  readonly executions = this._executions.asReadonly();
  readonly selectedId = this._selectedId.asReadonly();
  readonly tick = this._tick.asReadonly();

  readonly scopedExecutions = computed(() => this._executions());

  readonly selected = computed(() =>
    this._executions().find(e => e.id === this._selectedId()) ?? null,
  );

  readonly runningCount = computed(
    () => this._executions().filter(e => e.status === 'Running').length,
  );

  /** Timestamp of the last successful server fetch. Used to compute
   *  wall-clock elapsed for Running executions. */
  private lastFetchAt = Date.now();

  /** Polling timer. Only alive while a Running execution is present. */
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private static readonly POLL_INTERVAL_MS = 3000;

  constructor() {
    // Ticker drives live elapsed values. Only fires while there is a
    // Running execution, so the idle cost is zero.
    setInterval(() => {
      if (this._executions().some(e => e.status === 'Running')) {
        this._tick.update(v => v + 1);
      }
    }, 1000);
  }

  async load(): Promise<void> {
    const rows = await this.api.list();
    this._executions.set(rows);
    this.lastFetchAt = Date.now();
    this.updatePolling();
  }

  select(id: string | null): void {
    this._selectedId.set(id);
  }

  runningForJob(jobId: number): Execution | undefined {
    return this._executions().find(
      e => e.jobId === jobId && e.status === 'Running',
    );
  }

  async trigger(jobId: number): Promise<string> {
    const result = await this.api.trigger(jobId);
    // Refresh immediately so the badge and timer show up without waiting
    // for the next poll cycle.
    await this.load();
    return result.executionId;
  }

  async replayScatterItem(execId: string, itemId: string): Promise<void> {
    await this.api.replayScatterItem(execId, itemId);
    this._executions.update(list =>
      list.map(e => {
        if (e.id !== execId) return e;
        return {
          ...e,
          itemsDone: Math.min(e.itemsTotal, e.itemsDone + 1),
          failures: Math.max(0, e.failures - 1),
        };
      }),
    );
  }

  /**
   * Elapsed seconds for an execution, adjusted for wall-clock time since
   * the last server fetch. For Running executions the value keeps counting
   * even while the tab is backgrounded because it derives from Date.now().
   *
   * Reading _tick() here subscribes the caller (typically a computed) to
   * the ticker so the value recomputes every second.
   */
  elapsedFor(executionId: string): number {
    this._tick(); // signal dependency for enclosing computed
    const e = this._executions().find(x => x.id === executionId);
    if (!e) return 0;
    if (e.status !== 'Running') return e.elapsedSec;
    const sinceFetchSec = Math.floor((Date.now() - this.lastFetchAt) / 1000);
    return e.elapsedSec + sinceFetchSec;
  }

  /**
 * Legacy hook retained for DemoService compatibility. With the new
 * wall-clock elapsed computation, real executions don't need a client-side
 * tick — but the demo service still calls this, so we accept the argument
 * and trigger a recomputation by bumping the ticker.
 */
tickRunning(_deltaSeconds = 2): void {
  this._tick.update(v => v + 1);
}

  private updatePolling(): void {
    const hasRunning = this._executions().some(e => e.status === 'Running');

    if (hasRunning && !this.pollingTimer) {
      this.pollingTimer = setInterval(
        () => void this.pollOnce(),
        ExecutionService.POLL_INTERVAL_MS,
      );
    } else if (!hasRunning && this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private async pollOnce(): Promise<void> {
    try {
      const rows = await this.api.list();
      this._executions.set(rows);
      this.lastFetchAt = Date.now();

      if (!rows.some(e => e.status === 'Running') && this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    } catch (e) {
      console.warn('[ExecutionService] poll failed', e);
    }
  }
}