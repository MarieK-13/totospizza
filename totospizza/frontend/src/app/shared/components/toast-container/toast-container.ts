import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AlertTriangle, CheckCircle2, Info, LucideAngularModule, X, XCircle } from 'lucide-angular';
import { ToastKind, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [LucideAngularModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
  protected readonly CloseIcon = X;

  private readonly icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  } as const;

  protected iconFor(kind: ToastKind) {
    return this.icons[kind];
  }
}
