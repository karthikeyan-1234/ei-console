import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  ApiPullTask,
  ApiPushTask,
  BranchTask,
  JoinPointTask,
  NotifyTask,
  TaskType,
  TransformTask,
} from '../../../../core/models';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell';
import { TaskEditorService } from '../../services/task-editor.service';
import { ApiPullFieldsComponent } from './fields/api-pull-fields';
import { ApiPushFieldsComponent } from './fields/api-push-fields';
import { PlaceholderFieldsComponent } from './fields/placeholder-fields';


@Component({
  selector: 'ei-task-editor',
  imports: [
    ModalShellComponent,
    ApiPullFieldsComponent,
    ApiPushFieldsComponent,
    PlaceholderFieldsComponent,
  ],
  templateUrl: './task-editor.html',
})
export class TaskEditorComponent {
  private readonly editor = inject(TaskEditorService);

  readonly context = this.editor.context;

  readonly type = signal<TaskType>('ApiPull');

  readonly title = computed(() => {
    const ctx = this.context();
    if (!ctx) return 'Edit Task';
    const prefix =
      ctx.path.level === 'sub'
        ? 'Sub-task'
        : ctx.path.level === 'branch-child'
          ? 'Branch child'
          : 'Task';
    return `${prefix}: ${ctx.task.name || ctx.task.type}`;
  });

  readonly subtitle = computed(() => {
    const ctx = this.context();
    if (!ctx) return '';
    if (ctx.path.level === 'sub') return 'Runs once per item of the parent iterator';
    if (ctx.path.level === 'branch-child') {
      return 'Every child of a fork sees the same parent — the task before the fork';
    }
    if (ctx.task.type === 'JoinPoint') {
      return 'Barrier that awaits the preceding sibling branches';
    }
    return 'Top-level pipeline task';
  });

  readonly typeOptions = computed<TaskType[]>(() => {
    const ctx = this.context();
    if (!ctx) return [];
    if (ctx.path.level === 'sub') return ['ApiPush', 'Notify'];
    if (ctx.path.level === 'branch-child') {
      return ['ApiPull', 'Transform', 'ApiPush', 'Notify'];
    }
    return ['ApiPull', 'Transform', 'ApiPush', 'Notify', 'Branch', 'JoinPoint'];
  });

  readonly asApiPull = computed<ApiPullTask | null>(() => {
    const ctx = this.context();
    return ctx && ctx.task.type === 'ApiPull' ? (ctx.task as ApiPullTask) : null;
  });

  readonly asApiPush = computed<ApiPushTask | null>(() => {
    const ctx = this.context();
    return ctx && ctx.task.type === 'ApiPush' ? (ctx.task as ApiPushTask) : null;
  });

  readonly asTransform = computed<TransformTask | null>(() => {
    const ctx = this.context();
    return ctx && ctx.task.type === 'Transform' ? (ctx.task as TransformTask) : null;
  });

  readonly asNotify = computed<NotifyTask | null>(() => {
    const ctx = this.context();
    return ctx && ctx.task.type === 'Notify' ? (ctx.task as NotifyTask) : null;
  });

  readonly asBranch = computed<BranchTask | null>(() => {
    const ctx = this.context();
    return ctx && ctx.task.type === 'Branch' ? (ctx.task as BranchTask) : null;
  });

  readonly asJoinPoint = computed<JoinPointTask | null>(() => {
    const ctx = this.context();
    return ctx && ctx.task.type === 'JoinPoint' ? (ctx.task as JoinPointTask) : null;
  });

  constructor() {
    effect(() => {
      const ctx = this.context();
      if (ctx) this.type.set(ctx.task.type);
    });
  }

  typeLabel(t: TaskType): string {
    return t === 'JoinPoint' ? 'Await (JoinPoint)' : t;
  }

  onTypeChange(v: string): void {
    const ctx = this.context();
    if (!ctx) return;
    const next = v as TaskType;
    this.type.set(next);
    ctx.task.type = next;
  }

  onNameChange(v: string): void {
    const ctx = this.context();
    if (ctx) ctx.task.name = v;
  }

  onSave(): void {
    const ctx = this.context();
    if (ctx) this.cleanupForType(ctx.task as any, this.type());
    this.editor.save();
  }

  onCancel(): void {
    this.editor.cancel();
  }

  /**
   * Removes fields that don't apply to the task's current type. Mirrors the
   * original console's post-save cleanup: switching a Transform to an ApiPull
   * shouldn't leave the JSONata expression and sub-tasks behind.
   */
  private cleanupForType(t: Record<string, unknown>, type: TaskType): void {
    if (type !== 'Transform') {
      delete t['iterate'];
      delete t['subtasks'];
      delete t['jsonata'];
      delete t['sampleInput'];
      delete t['inputSource'];
      delete t['useSampleInput'];
    }
    if (type !== 'Branch') {
      delete t['children'];
      delete t['condition'];
      delete t['executionMode'];
    }
    if (type !== 'JoinPoint') {
      delete t['joinMode'];
      delete t['joinThreshold'];
      delete t['joinTimeoutSeconds'];
      delete t['joinTimeoutAction'];
    }
    if (type !== 'Notify') {
      delete t['kafkaTopic'];
    }
  }
}