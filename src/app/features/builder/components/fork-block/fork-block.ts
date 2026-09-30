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