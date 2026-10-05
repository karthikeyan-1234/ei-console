import { Component, computed, inject, input } from '@angular/core';
import {
  ApiPullTask,
  ApiPushTask,
  BranchTask,
  JoinPointTask,
  NotifyTask,
  PipelineTask,
  SqlQueryTask,
  SubTask,
  TransformTask,
} from '../../../../core/models';
import { ConnectionService } from '../../../../core/services/connection.service';

import { DragKind, DragStateService } from '../../../../shared/services/drag-state.service';

import { JsonFlowService } from '../../../../core/services/json-flow.service';
import { JsonOverlayService } from '../../../../shared/services/json-overlay.service';

import { TaskEditorService } from '../../services/task-editor.service';

import {
  NodePath,
  PipelineMutationService,
} from '../../services/pipeline-mutation.service';

@Component({
  selector: 'ei-pipeline-node',
  imports: [],
  templateUrl: './pipeline-node.html',
})
export class PipelineNodeComponent {
  private readonly connections = inject(ConnectionService);
  private readonly dragState = inject(DragStateService);

  private readonly jsonFlow = inject(JsonFlowService);
private readonly jsonOverlay = inject(JsonOverlayService);

  readonly task = input.required<PipelineTask>();

  private readonly taskEditor = inject(TaskEditorService);

  private readonly mutations = inject(PipelineMutationService);

  /**
 * When true, the branch's own children list is not rendered inside the card.
 * Used by the fork-lane layout, where children are rendered as siblings of
 * the branch card rather than as a sub-block inside it.
 */
  readonly suppressChildren = input<boolean>(false);

  readonly jobId = input.required<number>();

  /**
 * The node's location in the job's pipeline. Null when the node has no
 * identifying path (rare; sub-task rows inherit their parent's path).
 */
readonly nodePath = input<NodePath | null>(null);

/**
 * Whether to render the Remove button. Defaults to true. The lane passes
 * false for its branch card — the lane header's ✕ handles removal there.
 */
readonly showRemove = input<boolean>(true);


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

    readonly asSqlQuery = computed<SqlQueryTask | null>(() => {
    const t = this.task();
    return t.type === 'SqlQuery' ? t : null;
  });

  readonly sqlConnection = computed(() => {
    const t = this.asSqlQuery();
    return t ? this.connections.byId(t.connectionId) ?? null : null;
  });

  readonly queryFirstLine = computed(() => {
    const t = this.asSqlQuery();
    if (!t) return '';
    const first = (t.query ?? '').split('\n')[0] || '—';
    return first.length > 44 ? first.substring(0, 44) + '…' : first;
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
      case 'SqlQuery':   classes.push('sql'); break;
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
            case 'SqlQuery':  return 'S';
      default:          return '•';
    }
  });

  readonly chip = computed<{ text: string; cls: string } | null>(() => {
    const t = this.task();
    if (t.type === 'Transform' && t.iterate) return { text: 'FOR-EACH', cls: 'iterator-chip' };
    if (t.type === 'JoinPoint') return { text: 'AWAIT', cls: 'join-chip' };
    if (t.type === 'Branch')    return { text: 'BRANCH', cls: 'branch-chip' };
        if (t.type === 'SqlQuery')    return { text: 'SQL', cls: 'iterator-chip' };
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


readonly showRemoveButton = computed(
  () => this.showRemove() && this.nodePath() !== null,
);

readonly showAddChild = computed(
  () => this.task().type === 'Branch' && this.nodePath() !== null,
);

readonly showAddSubTask = computed(
  () => this.task().type === 'Transform' && this.nodePath() !== null,
);

readonly hasSubTasks = computed(
  () => this.task().type === 'Transform' && (this.task() as TransformTask).subtasks?.length ? true : false,
);

readonly hasChildren = computed(
  () => this.task().type === 'Branch' && (this.task() as BranchTask).children?.length ? true : false,
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

/**
 * Fires when the cursor enters any element with a `data-task-id` inside
 * this node. That includes the node's own card and, for iterator transforms,
 * each sub-task row inside the card. The closest match wins, so hovering a
 * sub-task row shows the sub-task's flow, not the parent transform's.
 */
onHoverStart(event: MouseEvent): void {
  const el = (event.target as HTMLElement | null)?.closest('[data-task-id]');
  if (!el) return;

  const id = el.getAttribute('data-task-id');
  if (!id) return;

  const flow = this.jsonFlow.flowFor(id);
  if (!flow) return;

  // Position before showing so the overlay appears at the cursor, not at
  // wherever it was left after the previous hover.
  this.jsonOverlay.moveTo(event.clientX, event.clientY);
  this.jsonOverlay.show(flow);
}

/** Tracks the cursor while the overlay is visible. */
onHoverMove(event: MouseEvent): void {
  if (!this.jsonOverlay.visible()) return;
  this.jsonOverlay.moveTo(event.clientX, event.clientY);
}

/**
 * Hides the overlay when the cursor truly leaves the hovered task. Two
 * cases keep it open:
 *   1. The cursor moved into a descendant of the same task — e.g. onto one
 *      of the node's action buttons. `el.contains(related)` catches this.
 *   2. The cursor moved onto the overlay itself, so the ✕ stays clickable.
 *      We test `related.closest('.json-overlay')` for this.
 * Any other destination hides the overlay. Moving from one task to another
 * triggers this handler, then the destination task's `mouseover` fires and
 * re-shows the overlay with the new flow in the same frame.
 */
onHoverEnd(event: MouseEvent): void {
  const el = (event.target as HTMLElement | null)?.closest('[data-task-id]');
  if (!el) return;

  const related = event.relatedTarget;

  if (related instanceof Node && el.contains(related)) return;
  if (related instanceof HTMLElement && related.closest('.json-overlay')) return;

  this.jsonOverlay.hide();
}

onEdit(): void {
  this.taskEditor.openForTask(this.jobId(), this.task());
}

onEditSubTask(event: MouseEvent, subTaskId: string): void {
  event.stopPropagation();
  const t = this.task();
  if (t.type !== 'Transform') return;
  const sub = (t.subtasks ?? []).find(s => s.id === subTaskId);
  if (sub) this.taskEditor.openForTask(this.jobId(), sub);
}

onEditBranchChild(event: MouseEvent, childId: string): void {
  event.stopPropagation();
  const t = this.task();
  if (t.type !== 'Branch') return;
  const child = (t.children ?? []).find(c => c.id === childId);
  if (child) this.taskEditor.openForTask(this.jobId(), child);
}

onRemove(): void {
  const path = this.nodePath();
  if (!path) return;
  void this.mutations.removeTask(this.jobId(), path);
}

onAddSubTask(): void {
  const path = this.nodePath();
  if (!path || path.level !== 'top') return;
  void this.mutations.addSubTask(this.jobId(), path.topIdx);
}

onRemoveSubTask(event: MouseEvent, subIdx: number): void {
  event.stopPropagation();
  const path = this.nodePath();
  if (!path || path.level !== 'top') return;
  void this.mutations.removeTask(this.jobId(), {
    level: 'sub',
    topIdx: path.topIdx,
    subIdx,
  });
}

onAddChild(): void {
  const path = this.nodePath();
  if (!path || path.level !== 'top') return;
  void this.mutations.addChild(this.jobId(), path.topIdx);
}

onRemoveChild(event: MouseEvent, childIdx: number): void {
  event.stopPropagation();
  const path = this.nodePath();
  if (!path || path.level !== 'top') return;
  void this.mutations.removeTask(this.jobId(), {
    level: 'branch-child',
    topIdx: path.topIdx,
    childIdx,
  });
}
}