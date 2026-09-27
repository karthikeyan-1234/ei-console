import {
  Component,
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
import { ToastService } from '../../../../core/services/toast.service';
import { DragStateService } from '../../../../shared/services/drag-state.service';
import { PipelineNodeComponent } from '../pipeline-node/pipeline-node';
import { ForkBlockComponent } from '../fork-block/fork-block';

@Component({
  selector: 'ei-pipeline-canvas',
  imports: [PipelineNodeComponent, ForkBlockComponent],
  templateUrl: './pipeline-canvas.html',
})
export class PipelineCanvasComponent {
  private readonly dragState = inject(DragStateService);
  private readonly jobs = inject(JobService);
  private readonly toasts = inject(ToastService);

  readonly job = input.required<Job>();

  readonly pipeline = computed<PipelineTask[]>(() => this.job().pipeline);

  readonly blocks = computed<PipelineBlock[]>(() =>
    groupPipelineIntoBlocks(this.pipeline()),
  );

  readonly lastSlotIdx = computed(() => this.blocks().length);

  readonly dropTargetsVisible = this.dragState.dropTargetsVisible;

  readonly treeRef = viewChild<ElementRef<HTMLElement>>('pipelineTree');

  constructor() {
    // Attach a window-level dragover listener only while a drag is active.
    // HTML5 DnD fires dragover continuously during a drag but suppresses
    // mousemove on the source, so this is the only place we can read the
    // cursor position to drive auto-scroll.
    effect((onCleanup) => {
      if (!this.dragState.active()) return;

      const handler = (event: DragEvent) => this.handleGlobalDragOver(event);
      window.addEventListener('dragover', handler, true);
      onCleanup(() => window.removeEventListener('dragover', handler, true));
    });
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
      if (sourceIdx === null) return;
      this.applyTopLevelMove(sourceIdx, slotIdx);
      return;
    }

    if (kind === 'fork') {
      const startIdx = this.dragState.sourceTopIdx();
      const endIdx = this.dragState.sourceEndIdx();
      if (startIdx === null || endIdx === null) return;
      this.applyForkMove(startIdx, endIdx, slotIdx);
      return;
    }
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
}