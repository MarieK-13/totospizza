import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, map } from 'rxjs';
import { ArrowLeft, Bike, CreditCard, LucideAngularModule, MapPin, ShieldCheck, Star, Store } from 'lucide-angular';
import type { EtapaSeguimientoResponse, PedidoResponse } from '../../../../core/models/api';
import { ClienteApi } from '../../../../core/services/api/cliente.api';
import { ToastService } from '../../../../core/services/toast.service';
import { mensajeDeError } from '../../../../core/utils/api-exception';
import { NOMBRE_METODO_PAGO, infoEstado, pedidoCancelable, pedidoEnCurso } from '../../../../core/utils/estado-pedido';
import { formatearFechaHora, formatearHora } from '../../../../core/utils/fechas';
import { formatearSoles } from '../../../../core/utils/money';
import { AccountShell } from '../../../../shared/components/account-shell/account-shell';
import { DeliveryCode } from '../../components/delivery-code/delivery-code';
import { EtaCountdown } from '../../components/eta-countdown/eta-countdown';
import { OrderRating } from '../../components/order-rating/order-rating';
import { TrackingTimeline } from '../../components/tracking-timeline/tracking-timeline';

const INTERVALO_SEGUIMIENTO_MS = 30_000;
const MAX_MOTIVO = 250;

const MENSAJE_ESTADO: Readonly<Record<PedidoResponse['estado'], string>> = {
  PENDIENTE_PAGO: 'Esperando la confirmación del pago.',
  CONFIRMADO: 'Recibimos tu pedido. La cocina ya lo tiene en pantalla.',
  EN_PREPARACION: 'Estamos armando tu pizza.',
  EN_HORNO: 'Tu pizza está en el horno.',
  LISTO: 'Tu pedido está listo.',
  EN_CAMINO: 'Tu pedido va en camino.',
  ENTREGADO: 'Pedido entregado. ¡Buen provecho!',
  CANCELADO: 'Este pedido fue cancelado.',
  NO_RECOGIDO: 'El pedido no se recogió a tiempo.',
};

@Component({
  selector: 'app-order-tracking-page',
  imports: [RouterLink, LucideAngularModule, AccountShell, EtaCountdown, TrackingTimeline, DeliveryCode, OrderRating],
  templateUrl: './order-tracking-page.html',
  styleUrl: './order-tracking-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTrackingPage {
  private readonly api = inject(ClienteApi);
  private readonly toast = inject(ToastService);
  private readonly dialogoCancelar = viewChild<ElementRef<HTMLDialogElement>>('cancelar');

  protected readonly numero = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('numero') ?? '')), {
    initialValue: '',
  });

  protected readonly recurso = rxResource({
    params: () => this.numero() || undefined,
    stream: ({ params }) => this.api.pedido(params),
  });
  protected readonly pedido = linkedSignal<PedidoResponse | undefined>(() => (this.recurso.hasValue() ? this.recurso.value() : undefined));

  protected readonly enCurso = computed(() => {
    const p = this.pedido();
    return !!p && pedidoEnCurso(p.estado);
  });

  protected readonly seguimiento = rxResource({
    params: () => (this.enCurso() ? this.numero() : undefined),
    stream: ({ params }) => this.api.seguimiento(params),
  });

  protected readonly estado = computed(() => {
    const p = this.pedido();
    return p ? infoEstado(this.seguimiento.value()?.estado ?? p.estado) : null;
  });
  protected readonly estadoActual = computed(() => {
    const p = this.pedido();
    return p ? (this.seguimiento.value()?.estado ?? p.estado) : null;
  });
  protected readonly mensaje = computed(() => {
    const p = this.pedido();
    const estado = this.estadoActual();
    if (!p || !estado) return '';
    if (estado === 'LISTO') {
      return p.tipoEntrega === 'RECOJO' ? '¡Tu pedido está listo! Ya puedes recogerlo.' : 'Tu pedido está listo y sale en breve con el motorizado.';
    }
    return MENSAJE_ESTADO[estado];
  });
  /** Productos del catálogo del pedido (sin repetir), para calificarlos uno por uno. */
  protected readonly productosCalificables = computed(() => {
    const vistos = new Map<number, string>();
    for (const d of this.pedido()?.detalles ?? []) {
      if (d.productoId !== null && !vistos.has(d.productoId)) vistos.set(d.productoId, d.nombre);
    }
    return [...vistos.entries()].map(([productoId, nombre]) => ({ productoId, nombre }));
  });

  protected readonly etapas = computed<readonly EtapaSeguimientoResponse[]>(() => {
    const desdeServidor = this.seguimiento.value()?.etapas;
    if (desdeServidor?.length) return desdeServidor;
    const p = this.pedido();
    return p ? etapasDesdeHistorial(p) : [];
  });

  protected readonly delivery = computed(() => this.pedido()?.tipoEntrega === 'DELIVERY');
  protected readonly cancelable = computed(() => {
    const p = this.pedido();
    return !!p && pedidoCancelable(p.estado);
  });
  protected readonly calificable = computed(() => {
    const p = this.pedido();
    return !!p && p.estado === 'ENTREGADO' && !p.resenado && !this.calificado();
  });
  protected readonly yaCalificado = computed(() => this.calificado() || !!this.pedido()?.resenado);
  protected readonly garantia = computed(() => this.seguimiento.value()?.garantiaAplicada ?? this.pedido()?.garantiaAplicada ?? false);

  protected readonly calificando = signal(false);
  protected readonly calificado = signal(false);
  protected readonly motivo = signal('');
  protected readonly cancelando = signal(false);
  protected readonly maxMotivo = MAX_MOTIVO;

  protected readonly soles = formatearSoles;
  protected readonly fechaHora = formatearFechaHora;
  protected readonly horaDe = formatearHora;
  protected readonly metodos = NOMBRE_METODO_PAGO;

  protected readonly BackIcon = ArrowLeft;
  protected readonly BikeIcon = Bike;
  protected readonly StoreIcon = Store;
  protected readonly PinIcon = MapPin;
  protected readonly CardIcon = CreditCard;
  protected readonly ShieldIcon = ShieldCheck;
  protected readonly StarIcon = Star;

  constructor() {
    const id = setInterval(() => {
      if (!this.enCurso() || document.hidden) return;
      const antes = this.seguimiento.value()?.estado;
      this.seguimiento.reload();
      if (antes && antes !== this.pedido()?.estado) this.recurso.reload();
    }, INTERVALO_SEGUIMIENTO_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }

  protected abrirCancelar(): void {
    this.motivo.set('');
    this.dialogoCancelar()?.nativeElement.showModal();
  }

  protected cerrarCancelar(): void {
    if (!this.cancelando()) this.dialogoCancelar()?.nativeElement.close();
  }

  protected escribirMotivo(evento: Event): void {
    this.motivo.set((evento.target as HTMLTextAreaElement).value);
  }

  protected confirmarCancelacion(): void {
    const p = this.pedido();
    if (!p || this.cancelando()) return;
    this.cancelando.set(true);
    this.api
      .cancelarPedido(p.numero, { motivo: this.motivo().trim() || null })
      .pipe(finalize(() => this.cancelando.set(false)))
      .subscribe({
        next: (actualizado) => {
          this.pedido.set(actualizado);
          this.dialogoCancelar()?.nativeElement.close();
          this.toast.success('Pedido cancelado', 'Si ya pagaste, el reembolso se procesa automáticamente.');
        },
        error: (error: unknown) => {
          this.dialogoCancelar()?.nativeElement.close();
          this.toast.error('No se pudo cancelar', mensajeDeError(error));
          this.recurso.reload();
        },
      });
  }

  protected alCalificar(): void {
    this.calificando.set(false);
    this.calificado.set(true);
    this.toast.success('¡Gracias por tu opinión!', 'La cocina la leerá hoy mismo.');
  }
}

function etapasDesdeHistorial(p: PedidoResponse): readonly EtapaSeguimientoResponse[] {
  const fecha = (...estados: PedidoResponse['estado'][]) => p.historial.find((h) => estados.includes(h.estado))?.fecha ?? null;
  const orden: PedidoResponse['estado'][] = ['CONFIRMADO', 'EN_PREPARACION', 'EN_HORNO', 'LISTO', 'EN_CAMINO', 'ENTREGADO'];
  const nivel = orden.indexOf(p.estado);
  const delivery = p.tipoEntrega === 'DELIVERY';
  // Mismo criterio que el backend (CalculadoraSeguimiento): las etapas que son un hecho quedan completas
  // al alcanzarse; "En preparación" se completa al pasar a la siguiente.
  const pasos = [
    { nombre: 'Pedido confirmado', desde: 0, fecha: p.confirmadoEn ?? fecha('CONFIRMADO'), hecho: true },
    { nombre: 'En preparación', desde: 1, fecha: fecha('EN_PREPARACION', 'EN_HORNO'), hecho: false },
    {
      nombre: !delivery ? 'Listo para recoger' : p.estado === 'LISTO' ? 'Esperando motorizado' : 'En camino',
      desde: 3,
      fecha: delivery ? fecha('EN_CAMINO') : fecha('LISTO'),
      hecho: delivery ? !!fecha('EN_CAMINO') : true,
    },
    { nombre: 'Entregado', desde: 5, fecha: p.entregadoEn ?? fecha('ENTREGADO'), hecho: true },
  ];
  return pasos.map((paso, i) => {
    const siguiente = pasos[i + 1]?.desde ?? Infinity;
    const alcanzada = nivel >= paso.desde;
    const actual = alcanzada && nivel < siguiente && p.estado !== 'ENTREGADO';
    return { nombre: paso.nombre, fecha: paso.fecha, completada: alcanzada && (!actual || paso.hecho), actual };
  });
}
