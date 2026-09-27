import { Component, computed, inject } from '@angular/core';
import { JsonOverlayService } from '../../services/json-overlay.service';
import { JsonFlow } from '../../../core/models';

@Component({
  selector: 'ei-json-overlay',
  imports: [],
  templateUrl: './json-overlay.html',
})
export class JsonOverlayComponent {
  private readonly overlay = inject(JsonOverlayService);

  readonly visible = this.overlay.visible;
  readonly flow = this.overlay.flow;
  readonly position = this.overlay.position;

  /** A single-element array whose value changes on every `show()` call. */
  readonly timerKey = computed(() => [this.overlay.showCount()]);

  /** Left coordinate, flipping to the other side of the cursor when near the viewport edge. */
  readonly left = computed(() => {
    const { x } = this.position();
    const approxWidth = 460;
    let left = x + 16;
    if (left + approxWidth > window.innerWidth - 12) left = x - approxWidth - 16;
    return Math.max(8, left);
  });

  /** Top coordinate, flipped symmetrically. */
  readonly top = computed(() => {
    const { y } = this.position();
    const approxHeight = 300;
    let top = y + 16;
    if (top + approxHeight > window.innerHeight - 12) top = y - approxHeight - 16;
    return Math.max(8, top);
  });

  close(): void {
    this.overlay.hide();
  }

  onMouseLeave(): void {
    this.overlay.hide();
  }

  formatJson(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string') return value;
    try {
      const text = JSON.stringify(value, null, 2);
      const cap = 1800;
      return text.length > cap ? `${text.slice(0, cap)}\n…` : text;
    } catch {
      return '—';
    }
  }

  sourceLabel(f: JsonFlow): string {
    return f.sourceLabel || 'pipeline trigger';
  }
}