import { Component, computed, inject, input, output } from '@angular/core';
import { Job } from '../../../../core/models';
import { JobService } from '../../../../core/services/job.service';
import { TenantService } from '../../../../core/services/tenant.service';

@Component({
  selector: 'ei-builder-jobs-list',
  imports: [],
  templateUrl: './builder-jobs-list.html',
})
export class BuilderJobsListComponent {
  private readonly jobs = inject(JobService);
  private readonly tenants = inject(TenantService);

  readonly selectedJobId = input<number | null>(null);
  readonly jobSelected = output<number>();

  readonly rows = this.jobs.scopedJobs;

  readonly rowCount = computed(() => this.rows().length);

  versionLabel(job: Job): string {
    return job.version ? `v${job.version}` : 'draft';
  }

  tenantLabel(job: Job): string {
    return this.tenants.labelFor(job.tenant);
  }

  taskCount(job: Job): number {
    return this.jobs.taskCount(job);
  }

  branchCount(job: Job): number {
    return this.jobs.branchCount(job);
  }

  badgeText(job: Job): string {
    const tasks = this.taskCount(job);
    if (tasks === 0) return 'Needs tasks';
    const branches = this.branchCount(job);
    return `${tasks} task${tasks === 1 ? '' : 's'}${branches ? ` · ${branches} branch` : ''}`;
  }

  isPlaceholder(job: Job): boolean {
    return this.taskCount(job) === 0;
  }

  onSelect(job: Job): void {
    this.jobSelected.emit(job.id);
  }
}