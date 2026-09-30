import { Injectable, computed, inject, signal } from '@angular/core';
import { Job, PipelineTask, SubTask } from '../../../core/models';
import { JobService } from '../../../core/services/job.service';
import { ModalService } from '../../../core/services/modal.service';

export type TaskEditorPath =
  | { level: 'top'; topIdx: number }
  | { level: 'sub'; topIdx: number; subIdx: number }
  | { level: 'branch-child'; topIdx: number; childIdx: number };

export type EditorTask = PipelineTask | SubTask;

export interface TaskEditorContext {
  jobId: number;
  path: TaskEditorPath;
  /** The task object as it lives in the pipeline — mutated in place. */
  task: EditorTask;
  /** True when the caller just inserted the task and it must be removed on cancel. */
  isNew: boolean;
}

@Injectable({ providedIn: 'root' })
export class TaskEditorService {
  private readonly jobs = inject(JobService);
  private readonly modal = inject(ModalService);

  private readonly _context = signal<TaskEditorContext | null>(null);
  readonly context = this._context.asReadonly();
  readonly isOpen = computed(() => this._context() !== null);

  /** Opens the editor for a task already present in the job's pipeline. */
  openForTask(jobId: number, task: EditorTask, isNew = false): void {
    const job = this.jobs.byId(jobId);
    if (!job) return;

    const path = this.findPath(job, task);
    if (!path) return;

    this._context.set({ jobId, path, task, isNew });
    this.modal.open('modalTask');
  }

  /**
 * Opens the editor for a task identified by its path. Used after an Add
 * operation, when the object the caller just inserted has been replaced by
 * a deep clone in the store — so reference-based lookup would fail.
 */
openForPath(jobId: number, path: TaskEditorPath, isNew = false): void {
  const job = this.jobs.byId(jobId);
  if (!job) return;

  const task = this.resolveTask(job, path);
  if (!task) return;

  this._context.set({ jobId, path, task, isNew });
  this.modal.open('modalTask');
}

  /** Called on Save. Forces a signal update so downstream views see the mutated task. */
  save(): void {
    const ctx = this._context();
    if (!ctx) return;
    this.forceUpdate(ctx.jobId);
    this._context.set(null);
    this.modal.close();
  }

  /** Called on Cancel. For a new task, removes it from the pipeline. */
  cancel(): void {
    const ctx = this._context();
    if (ctx?.isNew) {
      this.spliceOut(ctx);
    }
    this._context.set(null);
    this.modal.close();
  }

  /**
   * Locates the task within the job's pipeline by reference. Uses referential
   * equality, which is safe because the task object is the one we hand to the
   * field components and the same one that lives in the pipeline.
   */
  private findPath(job: Job, task: EditorTask): TaskEditorPath | null {
    const pipeline = job.pipeline;

    for (let i = 0; i < pipeline.length; i++) {
      if (pipeline[i] === task) return { level: 'top', topIdx: i };

      const t = pipeline[i];
      if (t.type === 'Transform' && t.subtasks) {
        for (let j = 0; j < t.subtasks.length; j++) {
          if (t.subtasks[j] === task) return { level: 'sub', topIdx: i, subIdx: j };
        }
      }
      if (t.type === 'Branch' && t.children) {
        for (let j = 0; j < t.children.length; j++) {
          if (t.children[j] === task) return { level: 'branch-child', topIdx: i, childIdx: j };
        }
      }
    }
    return null;
  }

  private resolveTask(job: Job, path: TaskEditorPath): EditorTask | null {
  if (path.level === 'top') {
    return job.pipeline[path.topIdx] ?? null;
  }
  if (path.level === 'sub') {
    const parent = job.pipeline[path.topIdx];
    if (!parent || parent.type !== 'Transform') return null;
    return parent.subtasks?.[path.subIdx] ?? null;
  }
  const parent = job.pipeline[path.topIdx];
  if (!parent || parent.type !== 'Branch') return null;
  return parent.children?.[path.childIdx] ?? null;
}

  private forceUpdate(jobId: number): void {
    const job = this.jobs.byId(jobId);
    if (!job) return;
    // The pipeline array is shallow-copied so the signal emits; the task
    // objects inside are the same references the field components mutated.
    void this.jobs.update(jobId, { pipeline: [...job.pipeline] });
  }

  private spliceOut(ctx: TaskEditorContext): void {
    const job = this.jobs.byId(ctx.jobId);
    if (!job) return;

    const pipeline = [...job.pipeline];
    const path = ctx.path;

    if (path.level === 'top') {
      pipeline.splice(path.topIdx, 1);
    } else if (path.level === 'sub') {
      const parent = pipeline[path.topIdx];
      if (parent && parent.type === 'Transform' && parent.subtasks) {
        const subtasks = [...parent.subtasks];
        subtasks.splice(path.subIdx, 1);
        pipeline[path.topIdx] = { ...parent, subtasks };
      }
    } else {
      const parent = pipeline[path.topIdx];
      if (parent && parent.type === 'Branch') {
        const children = [...parent.children];
        children.splice(path.childIdx, 1);
        pipeline[path.topIdx] = { ...parent, children };
      }
    }

    void this.jobs.update(ctx.jobId, { pipeline });
  }
}