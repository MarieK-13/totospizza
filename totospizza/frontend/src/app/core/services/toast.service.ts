import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  readonly id: number;
  readonly kind: ToastKind;
  readonly title: string;
  readonly message?: string;
  readonly duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly state = signal<readonly Toast[]>([]);

  readonly toasts = this.state.asReadonly();

  success(title: string, message?: string, duration = 4500): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration = 6000): void {
    this.show('error', title, message, duration);
  }

  warning(title: string, message?: string, duration = 5500): void {
    this.show('warning', title, message, duration);
  }

  info(title: string, message?: string, duration = 4500): void {
    this.show('info', title, message, duration);
  }

  dismiss(id: number): void {
    this.state.update((list) => list.filter((toast) => toast.id !== id));
  }

  private show(kind: ToastKind, title: string, message: string | undefined, duration: number): void {
    const toast: Toast = { id: ++this.nextId, kind, title, message, duration };
    this.state.update((list) => [...list, toast].slice(-4));
  }
}
