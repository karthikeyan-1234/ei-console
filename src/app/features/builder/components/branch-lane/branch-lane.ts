import { Component, computed, inject, input } from '@angular/core';
import { BranchTask } from '../../../../core/models';
import { DragStateService } from '../../../../shared/services/drag-state.service';
import { PipelineNodeComponent } from '../pipeline-node/pipeline-node';

@Component({
  selector: 'ei-branch-lane',
  imports: [PipelineNodeComponent],
  templateUrl: './branch-lane.html',
})
export class BranchLaneComponent {
  private readonly dragState = inject(DragStateService);

  readonly branch = input.required<BranchTask>();
  readonly idx = input.required<number>();

  readonly childTargetsVisible = this.dragState.childTargetsVisible;

  readonly children = computed(() => this.branch().children ?? []);

  readonly childrenCount = computed(() => this.children().length);

  readonly name = computed(() =>
    this.branch().name || `Branch ${String.fromCharCode(65 + this.idx())}`,
  );
}