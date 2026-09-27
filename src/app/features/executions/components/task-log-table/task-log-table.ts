import { Component, computed, inject, input } from '@angular/core';
import { TaskLogService } from '../../../../core/services/task-log.service';
import { fmtMs } from '../../../../core/utils/date.util';
import {
  StatusBadgeComponent,
  StatusVariant,
} from '../../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'ei-task-log-table',
  imports: [StatusBadgeComponent],
  templateUrl: './task-log-table.html',
})
export class TaskLogTableComponent {
  private readonly taskLog = inject(TaskLogService);

  readonly executionId = input.required<string>();

  readonly rows = computed(() => this.taskLog.forExecution(this.executionId()));

  fmtMs = fmtMs;

  statusVariant(status: string): StatusVariant {
    switch (status) {
      case 'Success': return 'success';
      case 'Failed':  return 'failed';
      case 'Running': return 'running';
      default:        return 'pending';
    }
  }

  typeBadgeClass(type: string): string | null {
    switch (type) {
      case 'Branch':    return 'branch-badge';
      case 'JoinPoint': return 'join-badge';
      default:          return null;
    }
  }
}