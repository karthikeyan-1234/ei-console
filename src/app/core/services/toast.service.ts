import { Injectable, signal } from '@angular/core';
import { Toast, ToastKind } from '../models';
import { uid } from '../utils/string.util';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private readonly lifetimeMs = 3000;

  show(message: string, kind: ToastKind = 'info'): void {
    const toast: Toast = { id: uid('toast'), message, kind };
    this._toasts.update(list => [...list, toast]);

    setTimeout(() => this.dismiss(toast.id), this.lifetimeMs);
  }

  success(message: string): void { this.show(message, 'success'); }
  warn(message: string): void { this.show(message, 'warn'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }

  dismiss(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}