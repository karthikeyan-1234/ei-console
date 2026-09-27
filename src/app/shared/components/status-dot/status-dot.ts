import { Component, input } from '@angular/core';

export type DotColor = 'green' | 'blue' | 'amber' | 'red' | 'purple';

@Component({
  selector: 'ei-status-dot',
  imports: [],
  templateUrl: './status-dot.html',
})
export class StatusDotComponent {
  readonly color = input.required<DotColor>();
}