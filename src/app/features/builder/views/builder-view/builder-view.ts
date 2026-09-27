import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '../../../../core/services/job.service';
import { DragStateService } from '../../../../shared/services/drag-state.service';
import { BuilderJobsListComponent } from '../../components/builder-jobs-list/builder-jobs-list';
import { BuilderDetailComponent } from '../../components/builder-detail/builder-detail';

@Component({
  selector: 'ei-builder-view',
  imports: [BuilderJobsListComponent, BuilderDetailComponent],
  templateUrl: './builder-view.html',
})
export class BuilderViewComponent {
  private readonly jobs = inject(JobService);
  private readonly router = inject(Router);
  private readonly dragState = inject(DragStateService);

  readonly jobId = input<string | undefined>();

  readonly selectedJobId = computed<number | null>(() => {
    const raw = this.jobId();
    const scoped = this.jobs.scopedJobs();

    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && scoped.some(j => j.id === parsed)) return parsed;
    }

    return scoped[0]?.id ?? null;
  });

  readonly jobsListCollapsed = signal(false);
  readonly dragPreviewActive = this.dragState.preview;

  toggleJobsList(): void {
    this.jobsListCollapsed.update(v => !v);
  }

  toggleDragPreview(): void {
    this.dragState.togglePreview();
  }

  onJobSelected(id: number): void {
    void this.router.navigate([], {
      queryParams: { jobId: id },
      queryParamsHandling: 'merge',
    });
  }
}