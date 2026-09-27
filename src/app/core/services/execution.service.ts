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

  readonly executions = this._executions.asReadonly();
  readonly selectedId = this._selectedId.asReadonly();

  readonly scopedExecutions = computed(() =>
    this._executions().filter(e => this.tenants.inScope(e.tenant)),
  );

  readonly selected = computed(() =>
    this._executions().find(e => e.id === this._selectedId()) ?? null,
  );

  async load(): Promise<void> {
    this._executions.set(await this.api.list());
  }

  select(id: string | null): void {
    this._selectedId.set(id);
  }

  /** Called by the demo ticker in DemoService — advances the elapsed timer. */
  tickRunning(deltaSeconds = 2): void {
    this._executions.update(list =>
      list.map(e =>
        e.status === 'Running'
          ? { ...e, elapsedSec: e.elapsedSec + deltaSeconds }
          : e,
      ),
    );
  }

  async replayScatterItem(execId: string, itemId: string): Promise<void> {
    await this.api.replayScatterItem(execId, itemId);
    // Optimistic local update — the backend will eventually push the real state.
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
}