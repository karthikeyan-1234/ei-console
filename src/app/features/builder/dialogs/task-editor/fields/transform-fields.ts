import { Component, computed, inject, input, signal } from '@angular/core';
import { SubTask, TransformTask } from '../../../../../core/models';
import { JsonataService } from '../../../../../core/services/jsonata.service';

type PreviewState =
  | { kind: 'idle' }
  | { kind: 'error'; text: string }
  | { kind: 'success'; text: string; count: number | null };

@Component({
  selector: 'ei-transform-fields',
  imports: [],
  templateUrl: './transform-fields.html',
})
export class TransformFieldsComponent {
  private readonly jsonata = inject(JsonataService);

  readonly task = input.required<TransformTask>();

  readonly preview = signal<PreviewState>({ kind: 'idle' });
  readonly diagnostic = signal<string>('Click to preview output');

  /** Template-safe mirror of task fields (avoids literals in bindings). */
  readonly inputSource = computed(() => this.task().inputSource ?? '');
  readonly jsonataText = computed(() => this.task().jsonata ?? '');
  readonly sampleInputText = computed(() => this.task().sampleInput ?? '');
  readonly useSample = computed(() => !!this.task().useSampleInput);
  readonly iterate = computed(() => !!this.task().iterate);
  readonly subtasks = computed<SubTask[]>(() => this.task().subtasks ?? []);
  readonly subtaskCount = computed(() => this.subtasks().length);

  onInputSourceChange(v: string): void { this.task().inputSource = v; }
  onJsonataChange(v: string): void { this.task().jsonata = v; }
  onSampleInputChange(v: string): void { this.task().sampleInput = v; }
  onUseSampleChange(v: boolean): void { this.task().useSampleInput = v; }

  /**
   * Toggling iterate off when sub-tasks exist asks for confirmation.
   * `preventDefault()` on the click keeps the checkbox from flipping
   * before the user has agreed.
   */
  onIterateToggle(event: MouseEvent): void {
    const t = this.task();
    const willBe = !t.iterate;
    if (!willBe && (t.subtasks ?? []).length > 0) {
      const count = t.subtasks!.length;
      const ok = confirm(
        `Turning off iteration will hide this task's ${count} sub-task(s). They will be preserved but not executed. Continue?`,
      );
      if (!ok) {
        event.preventDefault();
        return;
      }
    }
    t.iterate = willBe;
  }

  async onRunTest(): Promise<void> {
    const expr = this.task().jsonata ?? '';
    const rawSample = (this.task().sampleInput ?? '').trim();

    let parsed: unknown = {};
    if (rawSample) {
      try {
        parsed = JSON.parse(rawSample);
      } catch (e) {
        this.preview.set({ kind: 'error', text: `Invalid sample JSON: ${(e as Error).message}` });
        this.diagnostic.set('Fix sample input');
        return;
      }
    }

    const result = await this.jsonata.evaluate(expr, parsed);
    if (!result.ok) {
      this.preview.set({ kind: 'error', text: result.error ?? 'JSONata error' });
      this.diagnostic.set('Failed');
      return;
    }

    const value = result.value;
    const pretty = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    const count = Array.isArray(value) ? value.length : null;

    this.preview.set({
      kind: 'success',
      text: pretty ?? 'null',
      count,
    });
    this.diagnostic.set(
      count !== null ? `✓ ${count} item(s)` : '✓ 1 result',
    );
  }
}