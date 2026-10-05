import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Job } from '../../../../core/models';
import { JobService } from '../../../../core/services/job.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { ToastService } from '../../../../core/services/toast.service';
import { WatermarkService } from '../../../../core/services/watermark.service';
import { ExecutionService } from '../../../../core/services/execution.service';
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
  private readonly watermarks = inject(WatermarkService);
  private readonly executions = inject(ExecutionService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  readonly searchQuery = signal('');
  readonly statusFilter = signal<JobStatusFilter>('');

  readonly modalOpen = signal(false);
  readonly modalEditing = signal<Job | null>(null);

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
    this.modalEditing.set(null);
    this.modalOpen.set(true);
  }

  onEditJob(job: Job): void {
    this.modalEditing.set(job);
    this.modalOpen.set(true);
  }

  onModalSaved(_job: Job): void {
    this.modalOpen.set(false);
    this.modalEditing.set(null);
  }

  onModalCancelled(): void {
    this.modalOpen.set(false);
    this.modalEditing.set(null);
  }

  onOpenJob(id: number): void {
    this.toasts.info('Opening in Job Builder…');
    void this.router.navigate(['/console/builder'], {
      queryParams: { jobId: id },
    });
  }

  async onRemoveJob(job: Job): Promise<void> {
    // Guard 1 — active watermarks. Deleting a job with cursor state would
    // leave the source system believing we have processed past a point we
    // will never resume from.
    const wm = this.watermarks.watermarks().filter(w => w.jobId === job.id);
    if (wm.length) {
      this.toasts.error(
        `Cannot delete "${job.name}" — it has ${wm.length} active watermark${wm.length === 1 ? '' : 's'}. `
        + `Clear them first.`,
      );
      return;
    }

    // Guard 2 — historical executions. Orphaning those rows loses the audit
    // trail the executions dashboard depends on.
    const execs = this.executions.executions().filter(e => e.jobId === job.id);
    if (execs.length) {
      this.toasts.error(
        `Cannot delete "${job.name}" — it has ${execs.length} historical execution${execs.length === 1 ? '' : 's'}. `
        + `Archive it instead.`,
      );
      return;
    }

    if (!confirm(`Delete "${job.name}"?`)) return;

    await this.jobs.remove(job.id);
    this.toasts.warn('Job removed');
  }
}