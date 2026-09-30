import { Component, computed, inject, input, output } from '@angular/core';
import { PipelineBlock } from '../../../../core/models';
import { DragStateService } from '../../../../shared/services/drag-state.service';
import { PipelineMutationService } from '../../services/pipeline-mutation.service';
import { BranchLaneComponent, ChildDropEvent } from '../branch-lane/branch-lane';

@Component({
  selector: 'ei-fork-block',
  imports: [BranchLaneComponent],
  templateUrl: './fork-block.html',
})
export class ForkBlockComponent {
  private readonly dragState = inject(DragStateService);
  private readonly mutations = inject(PipelineMutationService);

  readonly block = input.required<PipelineBlock>();
  readonly jobId = input.required<number>();

  readonly childDropped = output<ChildDropEvent>();

  readonly branches = computed(() => this.block().branches ?? []);
  readonly laneCount = computed(() => this.branches().length);
  readonly laneCountLabel = computed(() => {
    const n = this.laneCount();
    return `${n} lane${n === 1 ? '' : 's'}`;
  });

  readonly lanesGridStyle = computed(
    () => `repeat(${this.laneCount()}, 260px)`,
  );

  readonly isDragging = computed(() => {
    const b = this.block();
    return this.dragState.active()
      && this.dragState.kind() === 'fork'
      && this.dragState.sourceTopIdx() === b.startIdx;
  });

onDragStart(event: DragEvent): void {
  try {
    event.dataTransfer?.setData('text/plain', `fork-${this.block().startIdx}`);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  } catch {
    /* Firefox occasionally throws on setData during same-page drags. */
  }

  // Custom drag image — a styled card instead of the tiny handle glyph.
  // The ghost element must be attached to the DOM at the moment
  // setDragImage is called, and can be removed on the next frame.
  const dt = event.dataTransfer;
  if (dt) {
    const ghost = document.createElement('div');
    ghost.textContent = `⑂ PARALLEL FORK · ${this.laneCountLabel()}`;
    ghost.style.position = 'fixed';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    ghost.style.padding = '8px 14px';
    ghost.style.background = '#ede9fe';
    ghost.style.color = '#6d28d9';
    ghost.style.border = '1.5px solid #a78bfa';
    ghost.style.borderRadius = '8px';
    ghost.style.fontFamily = "'Inter', sans-serif";
    ghost.style.fontSize = '11px';
    ghost.style.fontWeight = '800';
    ghost.style.textTransform = 'uppercase';
    ghost.style.letterSpacing = '.05em';
    ghost.style.boxShadow = '0 8px 24px rgba(124,58,237,.35)';
    document.body.appendChild(ghost);
    dt.setDragImage(ghost, 20, 20);
    setTimeout(() => ghost.remove(), 0);
  }

  this.dragState.begin('fork', {
    topIdx: this.block().startIdx,
    endIdx: this.block().endIdx,
  });
}

  onDragEnd(): void {
    this.dragState.end();
  }

  onLaneChildDropped(event: ChildDropEvent): void {
    this.childDropped.emit(event);
  }

  onAddLane(): void {
    void this.mutations.addLane(this.jobId(), this.block().startIdx);
  }

  onRemoveFork(): void {
    void this.mutations.removeFork(
      this.jobId(),
      this.block().startIdx,
      this.block().endIdx,
    );
  }
}