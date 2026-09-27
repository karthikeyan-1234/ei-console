import { Injectable, computed, signal } from '@angular/core';

export type DragKind = 'top' | 'fork' | 'child';

@Injectable({ providedIn: 'root' })
export class DragStateService {
  private readonly _active = signal(false);
  private readonly _kind = signal<DragKind | null>(null);
  private readonly _sourceTopIdx = signal<number | null>(null);
  private readonly _sourceChildIdx = signal<number | null>(null);
  private readonly _sourceTaskId = signal<string | null>(null);
  private readonly _preview = signal(false);

  readonly active = this._active.asReadonly();
  readonly kind = this._kind.asReadonly();
  readonly sourceTopIdx = this._sourceTopIdx.asReadonly();
  readonly sourceChildIdx = this._sourceChildIdx.asReadonly();
  readonly sourceTaskId = this._sourceTaskId.asReadonly();
  readonly preview = this._preview.asReadonly();

  private readonly _sourceEndIdx = signal<number | null>(null);
readonly sourceEndIdx = this._sourceEndIdx.asReadonly();

  /**
   * True when drop slots should be visible — either a real drag is in progress
   * or the preview toggle is on. Top-level `.drop-slot` elements bind to this.
   */
  readonly dropTargetsVisible = computed(() => this._active() || this._preview());

  /**
   * True when lane-level `.lane-child-drop` slots should be visible. These
   * only light up for child drags (or the preview), because top-level and
   * fork drags move things around between blocks, not inside lanes.
   */
  readonly childTargetsVisible = computed(() => {
    if (this._preview()) return true;
    return this._active() && this._kind() === 'child';
  });

  /** Called from a drag source when a drag begins. */
begin(
  kind: DragKind,
  source: { topIdx: number; endIdx?: number; childIdx?: number; taskId?: string },
): void {
  this._active.set(true);
  this._kind.set(kind);
  this._sourceTopIdx.set(source.topIdx);
  this._sourceEndIdx.set(source.endIdx ?? null);
  this._sourceChildIdx.set(source.childIdx ?? null);
  this._sourceTaskId.set(source.taskId ?? null);
}

  /** Called from dragend or after a successful drop. */
end(): void {
  this._active.set(false);
  this._kind.set(null);
  this._sourceTopIdx.set(null);
  this._sourceEndIdx.set(null);
  this._sourceChildIdx.set(null);
  this._sourceTaskId.set(null);
}

  /** Toggles the "preview drop slots" mode used during testing. */
  togglePreview(): void {
    this._preview.update(v => !v);
  }
}