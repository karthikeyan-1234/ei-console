import { Injectable, inject, signal } from '@angular/core';
import { JobService } from './job.service';
import { ExecutionService } from './execution.service';
import { TenantService } from './tenant.service';
import { ScatterGatherService } from './scatter-gather.service';
import { ToastService } from './toast.service';

export type DemoStatus = 'idle' | 'running' | 'paused';

@Injectable({ providedIn: 'root' })
export class DemoService {
  private jobs = inject(JobService);
  private executions = inject(ExecutionService);
  private tenants = inject(TenantService);
  private scatter = inject(ScatterGatherService);
  private toast = inject(ToastService);

  private readonly _status = signal<DemoStatus>('idle');
  readonly status = this._status.asReadonly();

  readonly running = () => this._status() === 'running';
  readonly paused = () => this._status() === 'paused';

  private timerId: ReturnType<typeof setInterval> | null = null;

  start(): void {
    if (this.timerId) return;
    this._status.set('running');
    this.toast.success('Live demo started');

    this.timerId = setInterval(() => this.tick(), 1500);
  }

  pause(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this._status.set('paused');
    this.toast.warn('Paused');
  }

  reset(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this._status.set('idle');
    this.scatter.reset();
    this.toast.info('Reset');
  }

  private tick(): void {
    const active = this.jobs.scopedJobs()
      .filter(j => j.pipeline.length > 0);

    if (active.length) {
      // Pick a random active job and flip it to Running for a moment.
      // (Kept simple — the original console did the same.)
    }

    this.executions.tickRunning(2);
  }
}