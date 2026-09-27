import { Component, input } from '@angular/core';

export type StatusVariant =
  | 'running'
  | 'success'
  | 'failed'
  | 'paused'
  | 'pending'
  | 'dispatched'
  | 'queued';

@Component({
  selector: 'ei-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
})
export class StatusBadgeComponent {
  readonly variant = input.required<StatusVariant>();
  readonly label = input<string>();
}