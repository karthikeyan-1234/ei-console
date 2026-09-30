import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Job, PipelineBlock, PipelineTask } from '../../../../core/models';
import { groupPipelineIntoBlocks } from '../../../../core/utils/pipeline.util';
import { JobService } from '../../../../core/services/job.service';
import { JsonFlowService } from '../../../../core/services/json-flow.service';
import { ToastService } from '../../../../core/services/toast.service';
import { DragStateService } from '../../../../shared/services/drag-state.service';
import { JsonOverlayService } from '../../../../shared/services/json-overlay.service';
import { PipelineNodeComponent } from '../pipeline-node/pipeline-node';
import { ForkBlockComponent } from '../fork-block/fork-block';
import { ChildDropEvent } from '../branch-lane/branch-lane';
import { InsertPointService } from '../../services/insert-point.service';

@Component({
  selector: 'ei-pipeline-canvas',
  imports: [PipelineNodeComponent, ForkBlockComponent],
  templateUrl: './pipeline-canvas.html',
})
export class PipelineCanvasComponent {
  private readonly dragState = inject(DragStateService);
  private readonly jobs = inject(JobService);
  private readonly toasts = inject(ToastService);
  private readonly jsonFlow = inject(JsonFlowService);
  private readonly jsonOverlay = inject(JsonOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly insertPoint = inject(InsertPointService);

  readonly job = input.required<Job>();

  readonly pipeline = computed<PipelineTask[]>(() => this.job().pipeline);
  readonly blocks = computed<PipelineBlock[]>(() =>
    groupPipelineIntoBlocks(this.pipeline()),
  );
  readonly lastSlotIdx = computed(() => this.blocks().length);
  readonly dropTargetsVisible = this.dragState.dropTargetsVisible;
  readonly treeRef = viewChild<ElementRef<HTMLElement>>('pipelineTree');
  readonly arrowIdx = this.insertPoint.arrowIdx;

constructor() {
  // Recompute the JSON flow whenever the selected job changes, and hide
  // any visible hover overlay while we swap jobs.
  effect(() => {
    const j = this.job();
    this.jsonOverlay.hide();
    this.jsonFlow.recompute(j);
  });

  // Attach a window-level dragover listener only while a drag is active.
  // HTML5 DnD fires dragover continuously during a drag but suppresses
  // mousemove on the source, so this is the only place we can read the
  // cursor position to drive auto-scroll.
  effect((onCleanup) => {
    if (!this.dragState.active()) return;

    const scrollHandler = (event: DragEvent) =>
      this.handleGlobalDragOver(event);

    window.addEventListener('dragover', scrollHandler, true);
    onCleanup(() => window.removeEventListener('dragover', scrollHandler, true));
  });

  // Safety net for drags that end without a drop — for example, the user
  // releases the mouse outside any drop target, or Angular re-renders the
  // source mid-drag so its own `dragend` binding never fires. The document-
  // level listener is registered for the duration of the drag and clears
  // the state unconditionally.
  effect((onCleanup) => {
    if (!this.dragState.active()) return;

    const endHandler = () => this.dragState.end();

    document.addEventListener('dragend', endHandler, true);
    onCleanup(() => document.removeEventListener('dragend', endHandler, true));
  });

  // Hide the hover overlay the moment a drag begins — the overlay would
  // otherwise hang in place following neither the cursor nor the drag.
  effect(() => {
    if (this.dragState.active()) this.jsonOverlay.hide();
  });

  // Hide the overlay if the canvas unmounts (route change, job deletion).
  this.destroyRef.onDestroy(() => this.jsonOverlay.hide());
}

  private handleGlobalDragOver(event: DragEvent): void {
    const tree = this.treeRef()?.nativeElement;
    if (!tree) return;

    const treeRect = tree.getBoundingClientRect();
    const hEdge = 90;
    const hSpeed = 22;

    if (event.clientX < treeRect.left + hEdge) {
      tree.scrollLeft -= hSpeed;
    } else if (event.clientX > treeRect.right - hEdge) {
      tree.scrollLeft += hSpeed;
    }

    const vScroller = tree.closest('.builder-detail') as HTMLElement | null;
    if (vScroller) {
      const vRect = vScroller.getBoundingClientRect();
      const vEdge = 70;
      const vSpeed = 16;

      if (event.clientY < vRect.top + vEdge) {
        vScroller.scrollTop -= vSpeed;
      } else if (event.clientY > vRect.bottom - vEdge) {
        vScroller.scrollTop += vSpeed;
      }
    }
  }

  onSlotDragOver(event: DragEvent): void {
    if (!this.dragState.active()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onSlotDrop(event: DragEvent, slotIdx: number): void {
    event.preventDefault();

    const kind = this.dragState.kind();

    if (kind === 'top') {
      const sourceIdx = this.dragState.sourceTopIdx();
      if (sourceIdx !== null) this.applyTopLevelMove(sourceIdx, slotIdx);
    } else if (kind === 'fork') {
      const startIdx = this.dragState.sourceTopIdx();
      const endIdx = this.dragState.sourceEndIdx();
      if (startIdx !== null && endIdx !== null) {
        this.applyForkMove(startIdx, endIdx, slotIdx);
      }
    }

    // The drop marks the end of this drag. Clearing the state here means we
    // don't depend on the source element's `dragend` firing — which it won't
    // if Angular has already re-rendered and destroyed the source.
    this.dragState.end();
  }

  onArrowClick(idx: number): void {
  this.insertPoint.toggle(idx);
}

  private applyTopLevelMove(sourceIdx: number, slotIdx: number): void {
    const job = this.job();
    const pipeline = [...job.pipeline];
    const blocks = this.blocks();

    let targetIdx = slotIdx >= blocks.length
      ? pipeline.length
      : blocks[slotIdx].startIdx;

    if (sourceIdx < targetIdx) targetIdx -= 1;
    if (sourceIdx === targetIdx) return;

    const moved = pipeline[sourceIdx];
    if (moved.type === 'Branch') {
      this.toasts.warn('Branches cannot be moved individually — drag the fork header');
      return;
    }

    pipeline.splice(sourceIdx, 1);
    pipeline.splice(targetIdx, 0, moved);

    void this.jobs.update(job.id, { pipeline });
    this.toasts.success('Task moved');
  }

  private applyForkMove(startIdx: number, endIdx: number, slotIdx: number): void {
    const job = this.job();
    const pipeline = [...job.pipeline];
    const blocks = this.blocks();
    const count = endIdx - startIdx + 1;

    let targetIdx = slotIdx >= blocks.length
      ? pipeline.length
      : blocks[slotIdx].startIdx;

    if (startIdx < targetIdx) targetIdx -= count;
    if (targetIdx === startIdx) return;

    const group = pipeline.splice(startIdx, count);
    const insertAt = Math.max(0, Math.min(pipeline.length, targetIdx));
    for (let i = group.length - 1; i >= 0; i--) {
      pipeline.splice(insertAt, 0, group[i]);
    }

    void this.jobs.update(job.id, { pipeline });
    this.toasts.success('Fork moved');
  }

  onChildDrop(event: ChildDropEvent): void {
    const srcBranchIdx = this.dragState.sourceTopIdx();
    const srcChildIdx = this.dragState.sourceChildIdx();

    if (srcBranchIdx !== null && srcChildIdx !== null) {
      this.applyChildMove(
        srcBranchIdx,
        srcChildIdx,
        event.targetBranchIdx,
        event.targetChildIdx,
      );
    }

    this.dragState.end();
  }

private applyChildMove(
  srcBranchIdx: number,
  srcChildIdx: number,
  tgtBranchIdx: number,
  tgtChildIdx: number,
): void {
  const job = this.job();
  const pipeline = [...job.pipeline];

  const srcBranch = pipeline[srcBranchIdx];
  if (!srcBranch || srcBranch.type !== 'Branch') return;

  if (srcBranchIdx === tgtBranchIdx) {
    // Same-lane reorder.
    const children = [...(srcBranch.children ?? [])];
    let adjustedTarget = tgtChildIdx;
    if (srcChildIdx < adjustedTarget) adjustedTarget -= 1;
    if (srcChildIdx === adjustedTarget) return;

    const moved = children.splice(srcChildIdx, 1)[0];
    children.splice(adjustedTarget, 0, moved);

    pipeline[srcBranchIdx] = { ...srcBranch, children };
  } else {
    // Cross-lane move.
    const tgtBranch = pipeline[tgtBranchIdx];
    if (!tgtBranch || tgtBranch.type !== 'Branch') return;

    const srcChildren = [...(srcBranch.children ?? [])];
    const tgtChildren = [...(tgtBranch.children ?? [])];

    const moved = srcChildren.splice(srcChildIdx, 1)[0];
    const insertAt = Math.min(tgtChildIdx, tgtChildren.length);
    tgtChildren.splice(insertAt, 0, moved);

    pipeline[srcBranchIdx] = { ...srcBranch, children: srcChildren };
    pipeline[tgtBranchIdx] = { ...tgtBranch, children: tgtChildren };
  }

  void this.jobs.update(job.id, { pipeline });
  this.toasts.success(
    srcBranchIdx === tgtBranchIdx ? 'Child reordered' : 'Child moved to lane',
  );
}
}