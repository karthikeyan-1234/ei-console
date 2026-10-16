import { Component, computed, input, signal } from '@angular/core';

export interface HeaderEntry {
  key: string;
  value: string;
}

/**
 * Key/value row editor for HTTP headers. The component mutates the array it
 * receives in place and bumps a local version signal so the template
 * recomputes — Angular does not observe mutations to plain arrays.
 *
 * The parent field component is responsible for ensuring `headers` exists
 * on the underlying task object before passing it in.
 */
@Component({
  selector: 'ei-headers-table',
  imports: [],
  templateUrl: './headers-table.html',
})
export class HeadersTableComponent {
  readonly headers = input.required<HeaderEntry[]>();

  private readonly _version = signal(0);

  readonly visible = computed(() => {
    this._version();          // subscribe to bumps
    return this.headers();
  });

  private bump(): void { this._version.update(v => v + 1); }

  onKeyChange(index: number, value: string): void {
    this.headers()[index].key = value;
    this.bump();
  }

  onValueChange(index: number, value: string): void {
    this.headers()[index].value = value;
    this.bump();
  }

  onRemove(index: number): void {
    this.headers().splice(index, 1);
    this.bump();
  }

  onAdd(): void {
    this.headers().push({ key: '', value: '' });
    this.bump();
  }
}