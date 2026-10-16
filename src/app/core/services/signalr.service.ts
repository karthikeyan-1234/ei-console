import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

interface TaskStartedPayload {
  executionId: string;
  tenantId: number;
  taskId: number;
  taskName: string;
}

interface TaskCompletedPayload extends TaskStartedPayload {
  status: string;
  durationMs: number;
}

interface ExecutionCompletedPayload {
  executionId: string;
  tenantId: number;
  status: string;
  successCount: number;
  failureCount: number;
}

/**
 * Live push channel from the API. Owns the HubConnection lifecycle and
 * exposes signals for the state the console needs:
 *
 *   connected      — whether the WebSocket is open
 *   runningTaskIds — task ids (string) currently executing, across any
 *                    execution visible to this tenant
 *
 * The canvas reads runningTaskIds to highlight tasks in flight. The
 * executions list keeps its polling loop — SignalR is not yet the
 * authoritative source for aggregate execution state, just for task
 * granularity.
 */
@Injectable({ providedIn: 'root' })
export class SignalrService implements OnDestroy {
  private readonly _connected = signal(false);
  readonly connected = this._connected.asReadonly();

  private readonly _runningTaskIds = signal<ReadonlySet<string>>(new Set());
  readonly runningTaskIds = this._runningTaskIds.asReadonly();

  private connection: HubConnection | null = null;
  private started = false;

  /** Call once during app boot (or lazily on first use). Idempotent. */
  start(): void {
    if (this.started) return;
    this.started = true;

    const conn = new HubConnectionBuilder()
      .withUrl(environment.signalrHubUrl)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection = conn;
    this.registerHandlers(conn);
    void this.connect(conn);
  }

  ngOnDestroy(): void {
    void this.connection?.stop();
  }

  /**
   * Template helper. Returns true when the given task is currently running.
   * Reads the runningTaskIds signal, so the caller's template recomputes
   * when the set changes.
   */
  isTaskRunning(taskId: string | number | null | undefined): boolean {
    if (taskId == null) return false;
    return this._runningTaskIds().has(String(taskId));
  }

  // ---------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------

  private registerHandlers(conn: HubConnection): void {
    conn.on('taskStarted', (p: TaskStartedPayload) => {
      this._runningTaskIds.update(set => {
        const next = new Set(set);
        next.add(String(p.taskId));
        return next;
      });
    });

    conn.on('taskCompleted', (p: TaskCompletedPayload) => {
      this._runningTaskIds.update(set => {
        const next = new Set(set);
        next.delete(String(p.taskId));
        return next;
      });
    });

    conn.on('executionCompleted', (_p: ExecutionCompletedPayload) => {
      // We don't remove ids here because multiple executions can run at
      // once and their task ids are globally unique — each task removes
      // itself on its own taskCompleted event. This handler exists as a
      // safety net if events get dropped: it does not clear, but we
      // could log a diagnostic here later.
    });

    conn.onreconnecting(() => this._connected.set(false));
    conn.onreconnected(() => {
      this._connected.set(true);
      // Events missed during the outage are unknown — clearing is the
      // safe move so stale highlights don't linger.
      this._runningTaskIds.set(new Set());
    });
    conn.onclose(() => {
      this._connected.set(false);
      this._runningTaskIds.set(new Set());
    });
  }

  private async connect(conn: HubConnection): Promise<void> {
    try {
      await conn.start();
      this._connected.set(true);
    } catch (err) {
      this._connected.set(false);
      // eslint-disable-next-line no-console
      console.warn('[SignalrService] initial connect failed', err);
      // Retry once after a short delay so a transient backend restart
      // doesn't leave the console dark for the rest of the session.
      setTimeout(() => {
        if (conn.state === HubConnectionState.Disconnected) {
          void this.connect(conn);
        }
      }, 5000);
    }
  }
}