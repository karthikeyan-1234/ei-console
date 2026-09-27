import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Job } from '../../../../core/models';
import { JobService } from '../../../../core/services/job.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { ToastService } from '../../../../core/services/toast.service';
import { JobsToolbarComponent, JobStatusFilter } from '../../components/jobs-toolbar/jobs-toolbar';
import { JobsTableComponent } from '../../components/jobs-table/jobs-table';
import { CreateJobModalComponent } from '../../dialogs/create-job-modal/create-job-modal';

@Component({
  selector: 'ei-jobs-view',
  imports: [JobsToolbarComponent, JobsTableComponent, CreateJobModalComponent],
  templateUrl: './jobs-view.html',
})
export class JobsViewComponent {
  private readonly jobs = inject(JobService);
  private readonly tenants = inject(TenantService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  readonly searchQuery = signal('');
  readonly statusFilter = signal<JobStatusFilter>('');
  readonly createModalOpen = signal(false);

  readonly filteredJobs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    return this.jobs.scopedJobs().filter(job => {
      if (query && !(`${job.name} ${job.slug}`.toLowerCase().includes(query))) return false;
      if (status && job.status !== status) return false;
      return true;
    });
  });

  readonly subtitle = computed(() => {
    const count = this.filteredJobs().length;
    const label = this.tenants.labelFor(this.tenants.activeTenantId());
    return `${count} job${count === 1 ? '' : 's'} for ${label}`;
  });

  onRefresh(): void {
    this.toasts.success('Jobs refreshed');
  }

  onCreate(): void {
    this.createModalOpen.set(true);
  }

  onJobCreated(_job: Job): void {
    this.createModalOpen.set(false);
  }

  onCreateCancelled(): void {
    this.createModalOpen.set(false);
  }

  onOpenJob(id: number): void {
    this.toasts.info('Opening in Job Builder…');
    void this.router.navigate(['/console/builder'], {
      queryParams: { jobId: id },
    });
  }
}