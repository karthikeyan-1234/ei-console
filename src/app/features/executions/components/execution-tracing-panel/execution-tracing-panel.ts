import { Component, input } from '@angular/core';
import { Execution } from '../../../../core/models';

@Component({
  selector: 'ei-execution-tracing-panel',
  imports: [],
  templateUrl: './execution-tracing-panel.html',
})
export class ExecutionTracingPanelComponent {
  readonly execution = input.required<Execution>();
}