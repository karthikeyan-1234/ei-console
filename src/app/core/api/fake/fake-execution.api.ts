import { Injectable } from '@angular/core';
import { ExecutionApi } from '../execution.api';
import { Execution } from '../../models';
import { SEED_EXECUTIONS } from './seed.data';

@Injectable()
export class FakeExecutionApi extends ExecutionApi {
  private rows: Execution[] = SEED_EXECUTIONS.map(e => JSON.parse(JSON.stringify(e)));

  async list(): Promise<Execution[]> {
    return this.rows.map(e => JSON.parse(JSON.stringify(e)));
  }

  async get(id: string): Promise<Execution | undefined> {
    const e = this.rows.find(x => x.id === id);
    return e ? JSON.parse(JSON.stringify(e)) : undefined;
  }

  async replayScatterItem(execId: string, _itemId: string): Promise<void> {
    const e = this.rows.find(x => x.id === execId);
    if (!e) throw new Error(`Execution not found: ${execId}`);
    // Simulated network latency — the .NET 10 backend will enqueue a real work unit.
    await new Promise(r => setTimeout(r, 1200));
    e.itemsDone = Math.min(e.itemsTotal, e.itemsDone + 1);
    e.failures = Math.max(0, e.failures - 1);
  }
}