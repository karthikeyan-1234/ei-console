import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutionService } from '../../../../core/services/execution.service';
import { ScatterItemService } from '../../../../core/services/scatter-item.service';
import { DlqService } from '../../../../core/services/dlq.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  StatusBadgeComponent,
  StatusVariant,
} from '../../../../shared/components/status-badge/status-badge';
import { nowStamp } from '../../../../core/utils/date.util';

@Component({
  selector: 'ei-scatter-detail-table',
  imports: [StatusBadgeComponent],
  templateUrl: './scatter-detail-table.html',
})
export class ScatterDetailTableComponent {
  private readonly scatterItems = inject(ScatterItemService);
  private readonly executions = inject(ExecutionService);
  private readonly dlq = inject(DlqService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  readonly executionId = input.required<string>();

  readonly rows = computed(() => this.scatterItems.forExecution(this.executionId()));

  statusVariant(status: string): StatusVariant {
    switch (status) {
      case 'Completed':  return 'success';
      case 'Failed':     return 'failed';
      case 'Dispatched': return 'dispatched';
      default:           return 'queued';
    }
  }

  async onReplay(itemId: string): Promise<void> {
    const execId = this.executionId();
    await this.scatterItems.replay(execId, itemId);
    this.toasts.success(`Replaying ${itemId}`);

    // Simulate the item completing after a short delay, then reconcile the
    // execution counters and DLQ status locally. The real backend replaces
    // this with a SignalR push.
    setTimeout(async () => {
      await this.executions.replayScatterItem(execId, itemId);

      const pending = this.dlq.items().find(d => d.item === itemId && d.status === 'Pending');
      if (pending) await this.dlq.replay(pending.id);

      // Nudge the scatter table so the change is visible even before SignalR.
      // (The API call above already updated the row locally.)
      this.toasts.success(`${itemId} replayed successfully`);
    }, 1200);
  }

  onOpenScatterView(): void {
    void this.router.navigate(['/console/scatter']);
  }

  nowStamp = nowStamp;
}