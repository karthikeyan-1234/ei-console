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

  readonly closed = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}