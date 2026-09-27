import { Component, computed, inject, input } from '@angular/core';
import {
  ApiPullTask,
  ApiPushTask,
  BranchTask,
  JoinPointTask,
  NotifyTask,
  PipelineTask,
  SubTask,
  TransformTask,
} from '../../../../core/models';
import { ConnectionService } from '../../../../core/services/connection.service';

import { DragKind, DragStateService } from '../../../../shared/services/drag-state.service';

@Component({
  selector: 'ei-pipeline-node',
  imports: [],
  templateUrl: './pipeline-node.html',
})
export class PipelineNodeComponent {
  private readonly connections = inject(ConnectionService);
  private readonly dragState = inject(DragStateService);

  readonly task = input.required<PipelineTask>();

  /**
 * When true, the branch's own children list is not rendered inside the card.
 * Used by the fork-lane layout, where children are rendered as siblings of
 * the branch card rather than as a sub-block inside it.
 */
  readonly suppressChildren = input<boolean>(false);


  /**
 * The kind of drag this node supports. `null` disables dragging entirely —
 * used for fork branches, branch children, and sub-tasks that are not
 * individually draggable in this segment.
 */
readonly dragKind = input<DragKind | null>(null);

/** The node's index in the top-level pipeline. Required for `top` and `fork` drags. */
readonly dragTopIdx = input<number | null>(null);

/** The node's index among its lane siblings. Required for `child` drags. */
readonly dragChildIdx = input<number | null>(null);

  // ------ Typed accessors (avoid `$any()` in the template) ------

  readonly asApiPull = computed<ApiPullTask | null>(() => {
    const t = this.task();
    return t.type === 'ApiPull' ? t : null;
  });

  readonly asApiPush = computed<ApiPushTask | null>(() => {
    const t = this.task();
    return t.type === 'ApiPush' ? t : null;
  });

  readonly asTransform = computed<TransformTask | null>(() => {
    const t = this.task();
    return t.type === 'Transform' ? t : null;
  });

  readonly asNotify = computed<NotifyTask | null>(() => {
    const t = this.task();
    return t.type === 'Notify' ? t : null;
  });

  readonly asBranch = computed<BranchTask | null>(() => {
    const t = this.task();
    return t.type === 'Branch' ? t : null;
  });

  readonly asJoinPoint = computed<JoinPointTask | null>(() => {
    const t = this.task();
    return t.type === 'JoinPoint' ? t : null;
  });

  // ------ Visual class & icon ------

  readonly nodeClasses = computed(() => {
    const classes = ['pipeline-node'];
    const t = this.task();

    switch (t.type) {
      case 'ApiPull':    classes.push('pull'); break;
      case 'Transform':  classes.push('transform'); break;
      case 'ApiPush':    classes.push('push'); break;
      case 'Notify':     classes.push('notify'); break;
      case 'Branch':     classes.push('branch', 'branch-node'); break;
      case 'JoinPoint':  classes.push('join', 'join-node'); break;
    }

    if (t.type === 'Transform' && t.iterate) classes.push('iterator-node');
    return classes.join(' ');
  });

  readonly icon = computed(() => {
    switch (this.task().type) {
      case 'ApiPull':   return '↓';
      case 'Transform': return 'ƒ';
      case 'ApiPush':   return '↑';
      case 'Notify':    return '✉';
      case 'Branch':    return '⑂';
      case 'JoinPoint': return '⊧';
      default:          return '•';
    }
  });

  readonly chip = computed<{ text: string; cls: string } | null>(() => {
    const t = this.task();
    if (t.type === 'Transform' && t.iterate) return { text: 'FOR-EACH', cls: 'iterator-chip' };
    if (t.type === 'JoinPoint') return { text: 'AWAIT', cls: 'join-chip' };
    if (t.type === 'Branch')    return { text: 'BRANCH', cls: 'branch-chip' };
    return null;
  });

  readonly isBranch = computed(() => this.task().type === 'Branch');
  readonly isIterator = computed(() => {
    const t = this.task();
    return t.type === 'Transform' && !!t.iterate;
  });

  // ------ ApiPull / ApiPush helpers ------

  readonly pullConnection = computed(() => {
    const t = this.asApiPull();
    return t ? this.connections.byId(t.connectionId) ?? null : null;
  });

  readonly pushConnection = computed(() => {
    const t = this.asApiPush();
    return t ? this.connections.byId(t.connectionId) ?? null : null;
  });

  // ------ Transform helpers ------

  readonly transformFirstLine = computed(() => {
    const t = this.asTransform();
    if (!t) return '';
    const first = (t.jsonata ?? '').split('\n')[0] || '—';
    return first.length > 44 ? first.substring(0, 44) + '…' : first;
  });

  readonly transformSubtasks = computed<SubTask[]>(() => {
    const t = this.asTransform();
    return t?.subtasks ?? [];
  });

  // ------ Branch helpers ------

  readonly branchChildren = computed(() => {
    const t = this.asBranch();
    return t?.children ?? [];
  });

  readonly branchConditionShort = computed(() => {
    const t = this.asBranch();
    const c = t?.condition ?? '';
    return c.length > 40 ? c.substring(0, 40) + '…' : c;
  });

  readonly branchExecutionMode = computed(() => this.asBranch()?.executionMode ?? 'Sequential');

  // ------ JoinPoint helpers ------

  readonly joinMode = computed(() => this.asJoinPoint()?.joinMode ?? 'WaitAll');
  readonly joinTimeoutSeconds = computed(() => this.asJoinPoint()?.joinTimeoutSeconds ?? 600);
  readonly joinThreshold = computed(() => this.asJoinPoint()?.joinThreshold ?? 0);

  // ------ Notify helpers ------

  readonly notifyTopic = computed(() => this.asNotify()?.kafkaTopic ?? '');
  readonly notifyUrl = computed(() => this.asNotify()?.url ?? '');

  // ------ Sub-task rendering helpers ------

  subTaskIcon(type: string): string {
    switch (type) {
      case 'ApiPull':   return '↓';
      case 'Transform': return 'ƒ';
      case 'ApiPush':   return '↑';
      case 'Notify':    return '✉';
      default:          return '•';
    }
  }

  subTaskMeta(sub: SubTask): string {
    if (sub.connectionId) {
      const conn = this.connections.byId(sub.connectionId);
      const base = conn ? conn.baseUrl : '—';
      return `${sub.method ?? 'POST'} ${base}${sub.url ?? ''}`;
    }
    if (sub.kafkaTopic) return `Kafka: ${sub.kafkaTopic}`;
    if (sub.url) return `Webhook: ${sub.url}`;
    return '—';
  }

  readonly isDraggable = computed(() => this.dragKind() !== null);

readonly isDragging = computed(
  () => this.dragState.sourceTaskId() === this.task().id,
);

onDragStart(event: DragEvent): void {
  const kind = this.dragKind();
  if (kind === null) {
    event.preventDefault();
    return;
  }

  // Firefox refuses to start a drag unless some payload is set.
  try {
    event.dataTransfer?.setData('text/plain', this.task().id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  } catch {
    /* Some browsers throw on setData with custom MIME types; ignore. */
  }

  this.dragState.begin(kind, {
    topIdx: this.dragTopIdx() ?? 0,
    childIdx: this.dragChildIdx() ?? undefined,
    taskId: this.task().id,
  });
}

onDragEnd(): void {
  this.dragState.end();
}
}