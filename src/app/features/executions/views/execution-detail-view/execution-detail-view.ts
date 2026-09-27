import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Execution } from '../../../../core/models';
import { ExecutionService } from '../../../../core/services/execution.service';
import { TaskLogService } from '../../../../core/services/task-log.service';
import { ScatterItemService } from '../../../../core/services/scatter-item.service';
import { TenantService } from '../../../../core/services/tenant.service';
import {
  StatusBadgeComponent,
  StatusVariant,
} from '../../../../shared/components/status-badge/status-badge';

import { fmtHMS } from '../../../../core/utils/date.util';
import { shortId } from '../../../../core/utils/string.util';
import { ExecutionTracingPanelComponent } from '../../components/execution-tracing-panel/execution-tracing-panel';
import { BranchProgressPanelComponent } from '../../components/branch-progress-panel/branch-progress-panel';
import { TaskLogTableComponent } from '../../components/task-log-table/task-log-table';
import { ScatterDetailTableComponent } from '../../components/scatter-detail-table/scatter-detail-table';

@Component({
  selector: 'ei-execution-detail-view',
  imports: [
    StatusBadgeComponent,
    ExecutionTracingPanelComponent,
    BranchProgressPanelComponent,
    TaskLogTableComponent,
    ScatterDetailTableComponent,
  ],
  templateUrl: './execution-detail-view.html',
})
export class ExecutionDetailViewComponent {
  private readonly executions = inject(ExecutionService);
  private readonly taskLog = inject(TaskLogService);
  private readonly scatterItems = inject(ScatterItemService);
  private readonly tenants = inject(TenantService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly execution = computed(() => this.executions.selected());

  readonly tenantLabel = computed(() =>
    this.execution() ? this.tenants.labelFor(this.execution()!.tenant) : '',
  );

  readonly itemsLabel = computed(() => {
    const ex = this.execution();
    return ex && ex.itemsTotal ? `${ex.itemsDone} / ${ex.itemsTotal}` : '— / —';
  });

  readonly progressPct = computed(() => {
    const ex = this.execution();
    return ex && ex.itemsTotal ? (ex.itemsDone / ex.itemsTotal) * 100 : 0;
  });

  readonly progressLabel = computed(() => {
    const ex = this.execution();
    return ex && ex.itemsTotal ? `${this.progressPct().toFixed(1)}%` : '—';
  });

  fmtHMS = fmtHMS;
  shortId = shortId;

  constructor() {
    effect(() => {
      const id = this.id();
      this.executions.select(id);
      void this.taskLog.loadFor(id);
      void this.scatterItems.loadFor(id);
    });
  }

  statusVariant(ex: Execution): StatusVariant {
    switch (ex.status) {
      case 'Running': return 'running';
      case 'Failed':  return 'failed';
      default:        return 'success';
    }
  }

  statusLabel(ex: Execution): string {
    switch (ex.status) {
      case 'Running': return 'RUNNING';
      case 'Failed':  return 'FAILED';
      default:        return 'COMPLETED';
    }
  }

  onBack(): void {
    void this.router.navigate(['/console/executions']);
  }
}