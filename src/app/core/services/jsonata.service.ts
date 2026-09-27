import { Injectable } from '@angular/core';
import jsonata from 'jsonata';

export interface JsonataResult {
  ok: boolean;
  value?: unknown;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class JsonataService {
  /** Validates syntax without evaluating. Returns null when the expression is valid. */
  validate(expression: string): string | null {
    if (!expression || !expression.trim()) return 'JSONata expression is empty';
    try {
      jsonata(expression);
      return null;
    } catch (e) {
      return `JSONata syntax error: ${(e as Error).message}`;
    }
  }

  /** Evaluates an expression against an input, returning a discriminated result. */
  async evaluate(expression: string, input: unknown): Promise<JsonataResult> {
    if (!expression || !expression.trim()) {
      return { ok: false, error: 'JSONata expression is empty' };
    }
    try {
      const compiled = jsonata(expression);
      const value = await compiled.evaluate(input ?? {});
      return { ok: true, value };
    } catch (e) {
      return { ok: false, error: `JSONata error: ${(e as Error).message}` };
    }
  }

  /** Synchronous evaluation for the flow computation — no await needed. */
  evaluateSync(expression: string, input: unknown): JsonataResult {
    if (!expression || !expression.trim()) {
      return { ok: false, error: 'JSONata expression is empty' };
    }
    try {
      const value = jsonata(expression).evaluate(input ?? {});
      return { ok: true, value };
    } catch (e) {
      return { ok: false, error: `JSONata error: ${(e as Error).message}` };
    }
  }
}