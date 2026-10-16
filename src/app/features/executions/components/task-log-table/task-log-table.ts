import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { TaskLogService } from '../../../../core/services/task-log.service';
import { ToastService } from '../../../../core/services/toast.service';
import { fmtMs } from '../../../../core/utils/date.util';
import {
  StatusBadgeComponent,
  StatusVariant,
} from '../../../../shared/components/status-badge/status-badge';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { paginate } from '../../../../core/utils/paginate.util';
import { formatLocalStamp } from '../../../../core/utils/date.util';
import { TaskLogEntry } from '../../../../core/models';

@Component({
  selector: 'ei-task-log-table',
  imports: [StatusBadgeComponent, PaginationComponent],
  templateUrl: './task-log-table.html',
})
export class TaskLogTableComponent {
  private readonly taskLog = inject(TaskLogService);
  private readonly toasts = inject(ToastService);

  readonly executionId = input.required<string>();

  readonly rows = computed(() => this.taskLog.forExecution(this.executionId()));

  readonly page = signal(1);
  readonly pageSize = 20;

  readonly pagedRows = computed(() =>
    paginate(this.rows(), this.page(), this.pageSize),
  );

  fmtMs = fmtMs;

  constructor() {
    effect(() => {
      this.executionId();
      this.page.set(1);
    });
  }

  onPageChanged(p: number): void {
    this.page.set(p);
  }

  /**
   * Copies the given text to the system clipboard. Prefers the async
   * Clipboard API, falls back to a hidden-textarea + execCommand for
   * older browsers or insecure contexts.
   *
   * The toast confirms success or reports a failure — without it the
   * operator has no signal that the click did anything.
   */
  async copyToClipboard(text: string | null | undefined): Promise<void> {
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        this.toasts.success('Copied to clipboard');
        return;
      }

      // Fallback for non-secure contexts (http://, older browsers).
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (ok) this.toasts.success('Copied to clipboard');
      else this.toasts.error('Clipboard unavailable');
    } catch (e) {
      this.toasts.error(`Copy failed: ${(e as Error).message ?? 'unknown error'}`);
    }
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

  startedLabel(l: TaskLogEntry): string {
  return formatLocalStamp(l.started);
}

completedLabel(l: TaskLogEntry): string {
  return formatLocalStamp(l.completed);
}
}