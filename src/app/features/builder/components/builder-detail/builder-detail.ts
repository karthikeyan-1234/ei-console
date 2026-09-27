import { Component, computed, inject, input } from '@angular/core';
import { Job } from '../../../../core/models';
import { JobService } from '../../../../core/services/job.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { PipelineCanvasComponent } from '../pipeline-canvas/pipeline-canvas';

import { TaskEditorComponent } from '../../dialogs/task-editor/task-editor';

@Component({
  selector: 'ei-builder-detail',
  imports: [PipelineCanvasComponent, TaskEditorComponent],
  templateUrl: './builder-detail.html',
})
export class BuilderDetailComponent {
  private readonly jobs = inject(JobService);
  private readonly tenants = inject(TenantService);

  

  readonly jobId = input<number | null>(null);

  readonly job = computed<Job | null>(() => {
    const id = this.jobId();
    return id == null ? null : this.jobs.byId(id) ?? null;
  });

  readonly tenantLabel = computed(() => {
    const j = this.job();
    return j ? this.tenants.labelFor(j.tenant) : '';
  });

  readonly versionLabel = computed(() => {
    const j = this.job();
    if (!j) return '';
    return j.version ? `v${j.version}` : 'draft';
  });

  readonly taskCount = computed(() => {
    const j = this.job();
    return j ? this.jobs.taskCount(j) : 0;
  });

  readonly branchCount = computed(() => {
    const j = this.job();
    return j ? this.jobs.branchCount(j) : 0;
  });

  readonly joinCount = computed(() => {
    const j = this.job();
    if (!j) return 0;
    return j.pipeline.filter(t => t.type === 'JoinPoint').length;
  });
}