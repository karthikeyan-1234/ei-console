import { Component, computed, inject, input, output } from '@angular/core';
import { BranchTask } from '../../../../core/models';
import { DragStateService } from '../../../../shared/services/drag-state.service';
import { PipelineNodeComponent } from '../pipeline-node/pipeline-node';

export interface ChildDropEvent {
  /** Index of the branch (in the top-level pipeline) that received the drop. */
  targetBranchIdx: number;
  /** Position within the target branch's children array where the child should land. */
  targetChildIdx: number;
}

@Component({
  selector: 'ei-branch-lane',
  imports: [PipelineNodeComponent],
  templateUrl: './branch-lane.html',
})
export class BranchLaneComponent {
  private readonly dragState = inject(DragStateService);

  readonly branch = input.required<BranchTask>();
  readonly idx = input.required<number>();

  readonly childDropped = output<ChildDropEvent>();

  readonly childTargetsVisible = this.dragState.childTargetsVisible;

  readonly children = computed(() => this.branch().children ?? []);

  readonly childrenCount = computed(() => this.children().length);

  readonly name = computed(() =>
    this.branch().name || `Branch ${String.fromCharCode(65 + this.idx())}`,
  );

  readonly jobId = input.required<number>();

  onSlotDragOver(event: DragEvent): void {
    if (!this.childTargetsVisible()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onSlotDrop(event: DragEvent, position: number): void {
    event.preventDefault();
    this.childDropped.emit({
      targetBranchIdx: this.idx(),
      targetChildIdx: position,
    });
  }
}