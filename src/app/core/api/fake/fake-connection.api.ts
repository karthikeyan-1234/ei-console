import { Injectable } from '@angular/core';
import { ConnectionApi, ConnectionTestResult } from '../connection.api';
import { Connection } from '../../models';
import { SEED_CONNECTIONS } from './seed.data';

@Injectable()
export class FakeConnectionApi extends ConnectionApi {
  private rows: Connection[] = SEED_CONNECTIONS.map(c => ({ ...c }));

  async list(): Promise<Connection[]> {
    return this.rows.map(c => ({ ...c }));
  }

  async get(id: string): Promise<Connection | undefined> {
    const c = this.rows.find(r => r.id === id);
    return c ? { ...c } : undefined;
  }

  async create(input: Omit<Connection, 'id'>): Promise<Connection> {
    const created: Connection = { ...input, id: 'conn-' + Math.random().toString(36).slice(2, 9) };
    this.rows.push(created);
    return { ...created };
  }

  async update(id: string, patch: Partial<Connection>): Promise<Connection> {
    const c = this.rows.find(r => r.id === id);
    if (!c) throw new Error(`Connection not found: ${id}`);
    Object.assign(c, patch);
    return { ...c };
  }

  async remove(id: string): Promise<void> {
    this.rows = this.rows.filter(c => c.id !== id);
  }

  async test(_id: string): Promise<ConnectionTestResult> {
    await new Promise(r => setTimeout(r, 320));
    return { ok: true, latencyMs: 142, status: 200 };
  }
}