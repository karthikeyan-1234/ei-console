import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { TaskLogService } from '../../../../core/services/task-log.service';
import { fmtMs } from '../../../../core/utils/date.util';
import {
  StatusBadgeComponent,
  StatusVariant,
} from '../../../../shared/components/status-badge/status-badge';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { paginate } from '../../../../core/utils/paginate.util';

@Component({
  selector: 'ei-task-log-table',
  imports: [StatusBadgeComponent, PaginationComponent],
  templateUrl: './task-log-table.html',
})
export class TaskLogTableComponent {
  private readonly taskLog = inject(TaskLogService);

  readonly executionId = input.required<string>();

  readonly rows = computed(() => this.taskLog.forExecution(this.executionId()));

  readonly page = signal(1);
  readonly pageSize = 20;

  readonly pagedRows = computed(() =>
    paginate(this.rows(), this.page(), this.pageSize),
  );

  fmtMs = fmtMs;

  constructor() {
    // Reset page when the execution id changes — the operator is looking at
    // a different run, so paging back to the beginning is the right move.
    effect(() => {
      this.executionId();
      this.page.set(1);
    });
  }

  onPageChanged(p: number): void {
    this.page.set(p);
  }

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