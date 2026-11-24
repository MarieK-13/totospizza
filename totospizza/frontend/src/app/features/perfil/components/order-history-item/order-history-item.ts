import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bike, ChevronRight, LucideAngularModule, Store } from 'lucide-angular';
import type { PedidoResumenResponse } from '../../../../core/models/api';
import { infoEstado, pedidoEnCurso } from '../../../../core/utils/estado-pedido';
import { formatearFechaHora } from '../../../../core/utils/fechas';
import { formatearSoles } from '../../../../core/utils/money';

/** Una fila del historial: toda la fila lleva al detalle del pedido. */
@Component({
  selector: 'app-order-history-item',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './order-history-item.html',
  styleUrl: './order-history-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryItem {
  readonly pedido = input.required<PedidoResumenResponse>();

  protected readonly estado = computed(() => infoEstado(this.pedido().estado));
  protected readonly enCurso = computed(() => pedidoEnCurso(this.pedido().estado));
  protected readonly fecha = computed(() => formatearFechaHora(this.pedido().creadoEn));
  protected readonly total = computed(() => formatearSoles(this.pedido().total));
  protected readonly delivery = computed(() => this.pedido().tipoEntrega === 'DELIVERY');

  protected readonly BikeIcon = Bike;
  protected readonly StoreIcon = Store;
  protected readonly ChevronIcon = ChevronRight;
}
