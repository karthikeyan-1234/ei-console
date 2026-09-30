import { Injectable, signal } from '@angular/core';

/**
 * Holds the index of the currently selected insert-point arrow. Null means
 * no arrow is selected, in which case `+ Add task` and `⊧ Add await` append
 * to the end of the pipeline.
 *
 * The arrow index refers to the position of the arrow in the block list,
 * not the pipeline array. Arrow N sits between block N and block N+1.
 * There are always `blocks.length - 1` arrows for N blocks — a trailing
 * arrow after the last block is not rendered.
 */
@Injectable({ providedIn: 'root' })
export class InsertPointService {
  private readonly _arrowIdx = signal<number | null>(null);
  readonly arrowIdx = this._arrowIdx.asReadonly();

  set(idx: number): void {
    this._arrowIdx.set(idx);
  }

  clear(): void {
    this._arrowIdx.set(null);
  }

  toggle(idx: number): void {
    this._arrowIdx.update(cur => (cur === idx ? null : idx));
  }
}