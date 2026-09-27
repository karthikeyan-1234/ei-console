import { Component, computed, inject, input, output } from '@angular/core';
import { PipelineBlock } from '../../../../core/models';
import { DragStateService } from '../../../../shared/services/drag-state.service';
import { BranchLaneComponent, ChildDropEvent } from '../branch-lane/branch-lane';

@Component({
  selector: 'ei-fork-block',
  imports: [BranchLaneComponent],
  templateUrl: './fork-block.html',
})
export class ForkBlockComponent {
  private readonly dragState = inject(DragStateService);

  readonly block = input.required<PipelineBlock>();

  readonly childDropped = output<ChildDropEvent>();

  readonly branches = computed(() => this.block().branches ?? []);

  readonly laneCount = computed(() => this.branches().length);

  readonly laneCountLabel = computed(() => {
    const n = this.laneCount();
    return `${n} lane${n === 1 ? '' : 's'}`;
  });

  /**
 * Fixed-width columns. Using `minmax(220px, 1fr)` let the grid shrink below
 * the intended lane width when the fork was a flex item in a wide pipeline.
 * A definite 260px per lane makes the fork's intrinsic width unambiguous, so
 * the flex layout gives it exactly the space it needs and the pipeline tree
 * scrolls horizontally to reveal it.
 */
readonly lanesGridStyle = computed(
  () => `repeat(${this.laneCount()}, 260px)`,
);

  readonly isDragging = computed(() => {
    const b = this.block();
    return this.dragState.active()
      && this.dragState.kind() === 'fork'
      && this.dragState.sourceTopIdx() === b.startIdx;
  });

  readonly jobId = input.required<number>();

  onDragStart(event: DragEvent): void {
    try {
      event.dataTransfer?.setData('text/plain', `fork-${this.block().startIdx}`);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    } catch {
      /* Firefox occasionally throws on setData during same-page drags. */
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
}