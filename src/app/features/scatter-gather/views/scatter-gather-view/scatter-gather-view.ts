import { Component, computed, inject } from '@angular/core';
import { ScatterGatherService } from '../../../../core/services/scatter-gather.service';
import { ScatterItemStatus } from '../../../../core/models';
import {
  StatusBadgeComponent,
  StatusVariant,
} from '../../../../shared/components/status-badge/status-badge';

type FilterValue = 'all' | 'dispatched' | 'failed' | 'queued';

@Component({
  selector: 'ei-scatter-gather-view',
  imports: [StatusBadgeComponent],
  templateUrl: './scatter-gather-view.html',
})  
export class ScatterGatherViewComponent {
  private readonly sg = inject(ScatterGatherService);

  // Direct passthroughs from the service
  readonly running = this.sg.running;
  readonly completed = this.sg.completed;
  readonly dispatched = this.sg.dispatched;
  readonly failed = this.sg.failed;
  readonly queued = this.sg.queued;
  readonly tokens = this.sg.tokens;
  readonly tokensMax = this.sg.tokensMax;
  readonly maxConcurrent = this.sg.maxConcurrent;
  readonly rps = this.sg.rps;
  readonly rpsThisSecond = this.sg.rpsThisSecond;
  readonly avgLatency = this.sg.avgLatency;
  readonly p95 = this.sg.p95;
  readonly filter = this.sg.filter;
  readonly totalUnits = this.sg.totalUnits;
  readonly filteredItems = this.sg.filteredItems;

  // Limiter bar widths
  readonly tokensPct = computed(() =>
    this.tokensMax() ? (this.tokens() / this.tokensMax()) * 100 : 0,
  );
  readonly concurrencyPct = computed(() =>
    this.maxConcurrent() ? (this.dispatched() / this.maxConcurrent()) * 100 : 0,
  );
  readonly rpsPct = computed(() =>
    this.rps() ? Math.min(100, (this.rpsThisSecond() / this.rps()) * 100) : 0,
  );

  // Fan-out bar segment widths
  readonly completedPct = computed(() => this.pctOf(this.completed()));
  readonly dispatchedPct = computed(() => this.pctOf(this.dispatched()));
  readonly failedPct = computed(() => this.pctOf(this.failed()));
  readonly queuedPct = computed(() => this.pctOf(this.queued()));

  // Throttle indicators on the limiter cards
  readonly tokensThrottled = computed(() => this.tokens() < 20);
  readonly concurrencyThrottled = computed(() => this.dispatched() >= this.maxConcurrent());
  readonly rpsThrottled = computed(() => this.rpsThisSecond() >= this.rps());

  // Header pill
  readonly allLabel = computed(() => `All (${this.totalUnits()})`);

  onStart(): void {
    this.sg.start();
  }

  onPause(): void {
    this.sg.pause();
  }

  onReset(): void {
    this.sg.reset();
  }

  setFilter(f: FilterValue): void {
    this.sg.setFilter(f);
  }

  replay(key: string, subTask: string): void {
    this.sg.replayItem(key, subTask);
  }

  statusVariant(status: ScatterItemStatus): StatusVariant {
    switch (status) {
      case 'Completed':  return 'success';
      case 'Failed':     return 'failed';
      case 'Dispatched': return 'dispatched';
      default:           return 'queued';
    }
  }

  private pctOf(value: number): number {
    const total = this.totalUnits();
    return total ? (value / total) * 100 : 0;
  }
}