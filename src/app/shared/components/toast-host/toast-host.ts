import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { ToastKind } from '../../../core/models';

@Component({
  selector: 'ei-toast-host',
  imports: [],
  templateUrl: './toast-host.html',
})
export class ToastHostComponent {
  private readonly toasts = inject(ToastService);
  readonly items = this.toasts.toasts;

  icon(kind: ToastKind): string {
    switch (kind) {
      case 'success': return '✓';
      case 'warn':    return '⚠';
      case 'error':   return '✕';
      default:        return 'ℹ';
    }
  }
}