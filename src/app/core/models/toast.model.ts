export type ToastKind = 'info' | 'success' | 'warn' | 'error';

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}