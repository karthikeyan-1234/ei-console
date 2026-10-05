import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Execution, Job } from '../../../../core/models';
import { JobService } from '../../../../core/services/job.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { ExecutionService } from '../../../../core/services/execution.service';
import { PipelineMutationService } from '../../services/pipeline-mutation.service';
import { InsertPointService } from '../../services/insert-point.service';
import { PipelineCanvasComponent } from '../pipeline-canvas/pipeline-canvas';
import { TaskEditorComponent } from '../../dialogs/task-editor/task-editor';
import { fmtHMS } from '../../../../core/utils/date.util';

interface ValidationResult {
  jobId: number;
  errors: string[];
}

@Component({
  selector: 'ei-builder-detail',
  imports: [PipelineCanvasComponent, TaskEditorComponent],
  templateUrl: './builder-detail.html',
})
export class BuilderDetailComponent {
  private readonly jobs = inject(JobService);
  private readonly tenants = inject(TenantService);
  private readonly executions = inject(ExecutionService);
  private readonly mutations = inject(PipelineMutationService);
  private readonly insertPoint = inject(InsertPointService);
  private readonly validationSvc = inject(ValidationService);
  private readonly toasts = inject(ToastService);

  readonly jobId = input<number | null>(null);

  readonly job = computed<Job | null>(() => {
    const id = this.jobId();
    return id == null ? null : this.jobs.byId(id) ?? null;
  });

  readonly tenantLabel = computed(() => {
    const j = this.job();
    return j ? this.tenants.labelFor(j.tenant) : '';
  });

  readonly versionLabel = computed(() => {
    const j = this.job();
    if (!j) return '';
    return j.version ? `v${j.version}` : 'draft';
  });

  readonly taskCount = computed(() => {
    const j = this.job();
    return j ? this.jobs.taskCount(j) : 0;
  });

  readonly branchCount = computed(() => {
    const j = this.job();
    return j ? this.jobs.branchCount(j) : 0;
  });

  readonly joinCount = computed(() => {
    const j = this.job();
    if (!j) return 0;
    return j.pipeline.filter(t => t.type === 'JoinPoint').length;
  });

  readonly arrowSelected = computed(() => this.insertPoint.arrowIdx() !== null);

  /**
   * The running execution for the currently-selected job, if any. Its
   * elapsed timer updates live as the demo ticks.
   */
  readonly runningExecution = computed<Execution | null>(() => {
    const j = this.job();
    if (!j) return null;
    return this.executions.runningForJob(j.id) ?? null;
  });

  readonly runningElapsedLabel = computed(() => {
    const e = this.runningExecution();
    return e ? fmtHMS(e.elapsedSec) : '';
  });

  private readonly _validation = signal<ValidationResult | null>(null);

  readonly validation = computed<ValidationResult | null>(() => {
    const j = this.job();
    const v = this._validation();
    if (!j || !v) return null;
    return v.jobId === j.id ? v : null;
  });

  readonly publishVersionLabel = computed(() => {
    const j = this.job();
    return j ? `Publish v${(j.version || 0) + 1}` : 'Publish';
  });

  constructor() {
    effect(() => {
      this.job();
      this._validation.set(null);
    });
  }

  onAddTask(): void {
    const j = this.job();
    if (!j) return;
    void this.mutations.addTaskAtArrow(j.id, this.insertPoint.arrowIdx());
    this.insertPoint.clear();
  }

  onAddFork(): void {
    const j = this.job();
    if (!j) return;
    void this.mutations.addForkAtArrow(j.id, this.insertPoint.arrowIdx());
    this.insertPoint.clear();
  }

  onAddAwait(): void {
    const j = this.job();
    if (!j) return;
    void this.mutations.addAwaitAtArrow(j.id, this.insertPoint.arrowIdx());
    this.insertPoint.clear();
  }

  onClearArrow(): void {
    this.insertPoint.clear();
  }

  onValidate(): void {
    const j = this.job();
    if (!j) return;

    const errors = this.validationSvc.validateJob(j);
    this._validation.set({ jobId: j.id, errors });

    if (errors.length) {
      this.toasts.error(
        `${errors.length} validation issue${errors.length === 1 ? '' : 's'}`,
      );
    } else {
      this.toasts.success('Validation passed');
    }
  }

  async onPublish(): Promise<void> {
    const j = this.job();
    if (!j) return;

    const errors = this.validationSvc.validateJob(j);
    if (errors.length) {
      this._validation.set({ jobId: j.id, errors });
      this.toasts.error(
        `Cannot publish — ${errors.length} validation issue${errors.length === 1 ? '' : 's'}`,
      );
      return;
    }

    const wasDraft = !j.version;
    const updated = await this.jobs.publish(j.id);

    this.toasts.success(
      `Published v${updated.version}${wasDraft ? ' — job is now Active' : ''}`,
    );
  }
}