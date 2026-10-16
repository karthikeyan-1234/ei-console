import { Component, computed, input, signal } from '@angular/core';
import { FormField } from '../../../core/models';

/**
 * Key / value editor for multipart form-data and url-encoded bodies.
 * Mutates the array it receives in place; a local version signal drives
 * re-rendering because Angular doesn't observe array mutations.
 */
@Component({
  selector: 'ei-form-fields-table',
  imports: [],
  templateUrl: './form-fields-table.html',
})
export class FormFieldsTableComponent {
  readonly fields = input.required<FormField[]>();
  readonly allowFile = input<boolean>(true);

  private readonly _version = signal(0);
  readonly visible = computed(() => {
    this._version();
    return this.fields();
  });

  private bump(): void { this._version.update(v => v + 1); }

  onKeyChange(i: number, v: string): void { this.fields()[i].key = v; this.bump(); }
  onValueChange(i: number, v: string): void { this.fields()[i].value = v; this.bump(); }
  onTypeChange(i: number, v: string): void {
    this.fields()[i].valueType = v as FormField['valueType'];
    if (v !== 'File') {
      delete this.fields()[i].fileName;
      delete this.fields()[i].contentType;
    }
    this.bump();
  }
  onFileNameChange(i: number, v: string): void {
    this.fields()[i].fileName = v || undefined;
    this.bump();
  }
  onContentTypeChange(i: number, v: string): void {
    this.fields()[i].contentType = v || undefined;
    this.bump();
  }
  onRemove(i: number): void { this.fields().splice(i, 1); this.bump(); }
  onAdd(): void {
    this.fields().push({ key: '', valueType: 'Text', value: '' });
    this.bump();
  }
}