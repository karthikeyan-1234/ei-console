import { Component, input } from '@angular/core';
import {
  BranchProgressChild,
  Execution,
} from '../../../../core/models';
import { fmtMs } from '../../../../core/utils/date.util';

@Component({
  selector: 'ei-branch-progress-panel',
  imports: [],
  templateUrl: './branch-progress-panel.html',
})
export class BranchProgressPanelComponent {
  readonly execution = input.required<Execution>();

  fmtMs = fmtMs;

  childColor(status: BranchProgressChild['status']): string {
    switch (status) {
      case 'Success': return 'var(--green)';
      case 'Failed':  return 'var(--red)';
      case 'Running': return 'var(--blue)';
      default:        return 'var(--muted)';
    }
  }

  branchCardClass(status: string): string {
    switch (status) {
      case 'Completed': return 'completed';
      case 'Failed':    return 'failed';
      case 'Running':   return 'running';
      default:          return 'pending';
    }
  }

  branchStatusPillClass(status: string): string {
    switch (status) {
      case 'Completed': return 'success';
      case 'Failed':    return 'failed';
      case 'Running':   return 'running';
      default:          return 'pending';
    }
  }

  joinCardClass(status: string): string {
    switch (status) {
      case 'Completed': return 'completed';
      case 'Failed':    return 'failed';
      case 'Waiting':   return 'waiting';
      default:          return 'pending';
    }
  }

  joinStatusPillClass(status: string): string {
    switch (status) {
      case 'Completed': return 'success';
      case 'Failed':    return 'failed';
      case 'Waiting':   return 'paused';
      default:          return 'pending';
    }
  }
}