import { Component, model } from '@angular/core';

export type JobStatusFilter = '' | 'Active' | 'Running' | 'Paused' | 'Draft';

@Component({
  selector: 'ei-jobs-toolbar',
  imports: [],
  templateUrl: './jobs-toolbar.html',
})
export class JobsToolbarComponent {
  readonly search = model<string>('');
  readonly status = model<JobStatusFilter>('');
}