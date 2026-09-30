import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DlqService } from '../../../../core/services/dlq.service';
import { ExecutionService } from '../../../../core/services/execution.service';
import { ScatterGatherService } from '../../../../core/services/scatter-gather.service';

@Component({
  selector: 'ei-console-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './console-sidebar.html',
})
export class ConsoleSidebarComponent {
  private readonly dlq = inject(DlqService);
  private readonly scatter = inject(ScatterGatherService);
  private readonly executions = inject(ExecutionService);

  readonly dlqCount = this.dlq.pendingCount;
  readonly scatterCount = computed(() =>
    this.scatter.queued() + this.scatter.dispatched(),
  );
  readonly runningExecutions = this.executions.runningCount;
}