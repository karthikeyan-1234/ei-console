import { InjectionToken } from '@angular/core';
import { Connection } from '../models';

export interface ConnectionTestResult {
  ok: boolean;
  latencyMs: number;
  status: number;
}

export abstract class ConnectionApi {
  abstract list(): Promise<Connection[]>;
  abstract get(id: string): Promise<Connection | undefined>;
  abstract create(input: Omit<Connection, 'id'>): Promise<Connection>;
  abstract update(id: string, patch: Partial<Connection>): Promise<Connection>;
  abstract remove(id: string): Promise<void>;
  abstract test(id: string): Promise<ConnectionTestResult>;
}

export const CONNECTION_API = new InjectionToken<ConnectionApi>('CONNECTION_API');