import { Injectable, signal } from '@angular/core';
import { JsonFlow } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class JsonOverlayService {
  private readonly _visible = signal<boolean>(false);
  private readonly _flow = signal<JsonFlow | null>(null);
  private readonly _position = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  /**
   * Increments on every `show()` call. The overlay component uses this as a
   * `@for` track key for the countdown timer bar, which restarts the CSS
   * animation every time a new task is hovered.
   */
  private readonly _showCount = signal<number>(0);

  readonly visible = this._visible.asReadonly();
  readonly flow = this._flow.asReadonly();
  readonly position = this._position.asReadonly();
  readonly showCount = this._showCount.asReadonly();

  private autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly autoCloseMs = 5000;

  /** Shows the overlay for the given flow and restarts the 5-second auto-close timer. */
  show(flow: JsonFlow): void {
    this._flow.set(flow);
    this._visible.set(true);
    this._showCount.update(n => n + 1);
    this.startAutoClose();
  }

  /** Hides the overlay and clears the timer. Idempotent. */
  hide(): void {
    this._visible.set(false);
    this._flow.set(null);
    this.clearAutoClose();
  }

  /** Updates the anchor position. Called on every mousemove while the overlay is visible. */
  moveTo(x: number, y: number): void {
    this._position.set({ x, y });
  }

  /**
   * Called from a task node's `mouseout`. Hides the overlay unless the cursor
   * is moving (a) into another child of the same node — e.g. one of its
   * buttons — or (b) onto the overlay itself, so the ✕ stays clickable.
   */
  handleMouseOut(node: HTMLElement, related: EventTarget | null): void {
    if (!this._visible()) return;
    if (related instanceof Node) {
      if (node.contains(related)) return;
      const target = related as HTMLElement;
      if (target.closest && target.closest('.json-overlay')) return;
    }
    this.hide();
  }

  private startAutoClose(): void {
    this.clearAutoClose();
    this.autoCloseTimer = setTimeout(() => this.hide(), this.autoCloseMs);
  }

  private clearAutoClose(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }
}