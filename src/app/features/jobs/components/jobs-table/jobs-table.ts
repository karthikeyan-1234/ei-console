import { Component, computed, inject, input, output } from '@angular/core';
import { Job } from '../../../../core/models';
import { JobService } from '../../../../core/services/job.service';
import { TenantService } from '../../../../core/services/tenant.service';
import {
  StatusBadgeComponent,
  StatusVariant,
} from '../../../../shared/components/status-badge/status-badge';
import {
  StatusDotComponent,
  DotColor,
} from '../../../../shared/components/status-dot/status-dot';

@Component({
  selector: 'ei-jobs-table',
  imports: [StatusBadgeComponent, StatusDotComponent],
  templateUrl: './jobs-table.html',
})
export class JobsTableComponent {
  private readonly jobs = inject(JobService);
  private readonly tenants = inject(TenantService);

  readonly rows = input.required<Job[]>();
  readonly jobOpened = output<number>();

  readonly tenantLabel = computed(() => this.tenants.labelFor(this.tenants.activeTenantId()));

  statusVariant(job: Job): StatusVariant {
    switch (job.status) {
      case 'Running': return 'running';
      case 'Paused':  return 'paused';
      case 'Draft':   return 'pending';
      default:        return 'success';   // 'Active'
    }
  }

  dotColor(job: Job): DotColor {
    switch (job.status) {
      case 'Running': return 'blue';
      case 'Paused':  return 'amber';
      case 'Draft':   return 'purple';
      default:        return 'green';
    }
  }

  taskInfoText(job: Job): string {
    const taskCount = this.jobs.taskCount(job);
    if (taskCount === 0) return '0 tasks · needs pipeline';

    const parts = [`${taskCount} task${taskCount === 1 ? '' : 's'}`];
    const subCount = this.jobs.subTaskCount(job);
    const branchCount = this.jobs.branchCount(job);
    const iterCount = this.jobs.iteratorCount(job);

    if (subCount) parts.push(`${subCount} sub`);
    if (branchCount) parts.push(`${branchCount} branch${branchCount === 1 ? '' : 'es'} ⑂`);
    if (iterCount) parts.push('🔀 iterator');

    return parts.join(' · ');
  }

  needsPipeline(job: Job): boolean {
    return job.pipeline.length === 0;
  }

  versionLabel(job: Job): string {
    return job.version ? `v${job.version}` : 'draft';
  }

  onRowClick(job: Job): void {
    this.jobOpened.emit(job.id);
  }
}