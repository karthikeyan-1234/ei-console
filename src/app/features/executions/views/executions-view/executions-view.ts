import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Execution } from '../../../../core/models';
import { ExecutionService } from '../../../../core/services/execution.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  StatusBadgeComponent,
  StatusVariant,
} from '../../../../shared/components/status-badge/status-badge';
import {
  StatusDotComponent,
  DotColor,
} from '../../../../shared/components/status-dot/status-dot';
import { fmtHMS } from '../../../../core/utils/date.util';
import { shortId } from '../../../../core/utils/string.util';

@Component({
  selector: 'ei-executions-view',
  imports: [StatusBadgeComponent, StatusDotComponent],
  templateUrl: './executions-view.html',
})
export class ExecutionsViewComponent {
  private readonly executions = inject(ExecutionService);
  private readonly tenants = inject(TenantService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  readonly rows = this.executions.scopedExecutions;

  readonly subtitle = computed(() => {
    const count = this.rows().length;
    const label = this.tenants.labelFor(this.tenants.activeTenantId());
    return `${count} execution${count === 1 ? '' : 's'} for ${label}`;
  });

  onRefresh(): void {
    this.toasts.success('Executions refreshed');
  }

  onView(id: string): void {
    void this.router.navigate(['/console/executions', id]);
  }

  onViewScatter(id: string): void {
    this.executions.select(id);
    void this.router.navigate(['/console/scatter']);
  }

  statusVariant(ex: Execution): StatusVariant {
    switch (ex.status) {
      case 'Running': return 'running';
      case 'Failed':  return 'failed';
      default:        return 'success';
    }
  }

  dotColor(ex: Execution): DotColor {
    switch (ex.status) {
      case 'Running': return 'blue';
      case 'Failed':  return 'red';
      default:        return 'green';
    }
  }

  itemsLabel(ex: Execution): string {
    return ex.itemsTotal ? `${ex.itemsDone} / ${ex.itemsTotal}` : '— / —';
  }

  fmtHMS = fmtHMS;
  shortId = shortId;

  correlationPreview(ex: Execution): string {
    const id = ex.correlationId || '—';
    return id.length > 13 ? `${id.substring(0, 13)}…` : id;
  }

  canShowScatterShortcut(ex: Execution): boolean {
    return ex.status === 'Running' && !ex.hasBranches;
  }
}