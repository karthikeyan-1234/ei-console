import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ei-modal-shell',
  imports: [],
  templateUrl: './modal-shell.html',
})
export class ModalShellComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly wide = input<boolean>(false);

  /** When true, a small "back" link is rendered above the title. */
  readonly showBack = input<boolean>(false);

  /** Label for the back link. Callers typically pass "Back to <task name>". */
  readonly backLabel = input<string>('Back');

  readonly closed = output<void>();
  readonly wentBack = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }

  onBack(): void {
    this.wentBack.emit();
  }
}