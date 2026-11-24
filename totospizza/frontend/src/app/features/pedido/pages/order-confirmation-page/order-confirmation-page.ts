import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Bike, Clock, CreditCard, LucideAngularModule, Store } from 'lucide-angular';
import { ClienteApi } from '../../../../core/services/api/cliente.api';
import { NOMBRE_METODO_PAGO } from '../../../../core/utils/estado-pedido';
import { formatearHora } from '../../../../core/utils/fechas';
import { formatearSoles } from '../../../../core/utils/money';

@Component({
  selector: 'app-order-confirmation-page',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './order-confirmation-page.html',
  styleUrl: './order-confirmation-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationPage {
  private readonly api = inject(ClienteApi);

  protected readonly numero = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('numero') ?? '')), { initialValue: '' });
  protected readonly recurso = rxResource({
    params: () => this.numero() || undefined,
    stream: ({ params }) => this.api.pedido(params),
  });
  protected readonly pedido = computed(() => (this.recurso.hasValue() ? this.recurso.value() : undefined));
  protected readonly delivery = computed(() => this.pedido()?.tipoEntrega === 'DELIVERY');

  protected readonly horaEstimada = computed(() => {
    const p = this.pedido();
    if (!p?.minutosEstimados) return null;
    const base = new Date(p.confirmadoEn ?? p.creadoEn).getTime();
    return formatearHora(new Date(base + p.minutosEstimados * 60_000).toISOString());
  });

  protected readonly soles = formatearSoles;
  protected readonly metodos = NOMBRE_METODO_PAGO;
  protected readonly BikeIcon = Bike;
  protected readonly StoreIcon = Store;
  protected readonly ClockIcon = Clock;
  protected readonly CardIcon = CreditCard;
}
