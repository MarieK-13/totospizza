import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { LineaCarrito } from '../../../../core/services/cart.service';
import { formatearSoles } from '../../../../core/utils/money';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummary {
  readonly lineas = input.required<readonly LineaCarrito[]>();
  readonly subtotal = input.required<number>();
  readonly descuento = input(0);
  /** null: aún no se sabe (falta elegir la entrega). */
  readonly envio = input<number | null>(null);
  readonly esRecojo = input(false);
  readonly total = input.required<number>();
  readonly aviso = input<string | null>(null);

  protected readonly soles = formatearSoles;
}
