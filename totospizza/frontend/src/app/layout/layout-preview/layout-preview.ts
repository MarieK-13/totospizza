import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ClipboardList, Pizza, Truck, Wallet } from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { PageHeader } from '../page-header/page-header';

/**
 * TEMPORAL: contenido de ejemplo para ver los layouts de admin y cocina.
 * Se elimina junto con las rutas `dev/*` cuando existan las páginas reales.
 */
@Component({
  selector: 'app-layout-preview',
  imports: [PageHeader, KpiCard],
  templateUrl: './layout-preview.html',
  styleUrl: './layout-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutPreview {
  protected readonly toast = inject(ToastService);

  protected readonly WalletIcon = Wallet;
  protected readonly OrdersIcon = ClipboardList;
  protected readonly PizzaIcon = Pizza;
  protected readonly TruckIcon = Truck;
}
