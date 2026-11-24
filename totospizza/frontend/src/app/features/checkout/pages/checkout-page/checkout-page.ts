import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { ArrowLeft, BadgeCheck, Bike, Check, CircleAlert, Clock, Flame, LockKeyhole, LucideAngularModule, MapPin, ShieldCheck, Store, Truck } from 'lucide-angular';
import { peticionSilenciosa } from '../../../../core/interceptors/http-context';
import type { DireccionClienteResponse } from '../../../../core/models/api';
import { ClienteApi } from '../../../../core/services/api/cliente.api';
import { PublicoApi } from '../../../../core/services/api/publico.api';
import { CartService } from '../../../../core/services/cart.service';
import { EntregaService } from '../../../../core/services/entrega.service';
import { ToastService } from '../../../../core/services/toast.service';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';
import { COSTO_DELIVERY_BASE_DEFECTO, ENVIO_GRATIS_DESDE_DEFECTO, calcularEnvio, redondear } from '../../../../core/utils/envio';
import { formatearSoles } from '../../../../core/utils/money';
import { EntregaDialog, type AccionEntrega } from '../../../../shared/components/entrega-dialog/entrega-dialog';
import { OrderSummary } from '../../components/order-summary/order-summary';
import { PaymentMethods } from '../../components/payment-methods/payment-methods';

const MAX_INSTRUCCIONES = 250;

const ERRORES_DE_ENTREGA = new Set(['SUCURSAL_CERRADA', 'SUCURSAL_INACTIVA', 'FUERA_DE_COBERTURA', 'DIRECCION_REQUERIDA']);

@Component({
  selector: 'app-checkout-page',
  imports: [RouterLink, LucideAngularModule, EntregaDialog, OrderSummary, PaymentMethods],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly clienteApi = inject(ClienteApi);
  private readonly publicoApi = inject(PublicoApi);
  private readonly entregaService = inject(EntregaService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly cart = inject(CartService);
  private readonly pagos = viewChild(PaymentMethods);

  protected readonly carrito = rxResource({
    stream: () => this.cart.refrescar().pipe(catchError(() => of(null))),
  });
  private readonly configuracion = rxResource({
    stream: () => this.publicoApi.configuracion({ context: peticionSilenciosa() }).pipe(catchError(() => of(null))),
  });
  private readonly guardadas = rxResource({
    stream: () => this.clienteApi.direcciones().pipe(catchError(() => of([] as readonly DireccionClienteResponse[]))),
  });

  protected readonly entrega = this.entregaService.actual;
  protected readonly esRecojo = computed(() => this.entrega()?.tipo === 'RECOJO');
  protected readonly direcciones = computed(() =>
    [...(this.guardadas.value() ?? [])].sort((a, b) => Number(b.favorita) - Number(a.favorita)),
  );
  protected readonly metodosPago = computed(() => this.configuracion.value()?.metodosPago ?? null);

  protected readonly subtotal = this.cart.subtotal;
  protected readonly descuento = computed(() => this.cart.carrito()?.montos.descuento ?? 0);
  private readonly envioGratisDesde = computed(
    () => this.cart.carrito()?.montos.envioGratisDesde ?? this.configuracion.value()?.envioGratisDesde ?? ENVIO_GRATIS_DESDE_DEFECTO,
  );
  protected readonly envio = computed(() =>
    calcularEnvio(this.entrega(), this.subtotal(), this.envioGratisDesde(), this.configuracion.value()?.costoDeliveryBase ?? COSTO_DELIVERY_BASE_DEFECTO),
  );
  protected readonly faltaEnvioGratis = computed(() =>
    this.esRecojo() ? null : Math.max(0, redondear(this.envioGratisDesde() - this.subtotal())),
  );
  protected readonly minutos = computed(() => {
    const e = this.entrega();
    return e?.tipo === 'DELIVERY' ? e.minutosEstimados : null;
  });
  protected readonly total = computed(() => redondear(Math.max(this.subtotal() - this.descuento(), 0) + (this.envio() ?? 0)));
  protected readonly aviso = computed(() => (this.cart.carrito()?.montosReferenciales ? this.cart.carrito()?.avisoMontos ?? null : null));
  protected readonly cargando = computed(() => this.carrito.isLoading() && !this.cart.carrito());

  protected readonly accionEntrega = signal<AccionEntrega | null>(null);
  protected readonly validando = signal<number | null>(null);
  protected readonly errorDireccion = signal<string | null>(null);
  protected readonly instrucciones = signal('');
  protected readonly pagando = signal(false);
  protected readonly error = signal<{ readonly mensaje: string; readonly deEntrega: boolean } | null>(null);
  protected readonly maxInstrucciones = MAX_INSTRUCCIONES;

  protected readonly soles = formatearSoles;
  protected readonly BackIcon = ArrowLeft;
  protected readonly BikeIcon = Bike;
  protected readonly StoreIcon = Store;
  protected readonly PinIcon = MapPin;
  protected readonly ClockIcon = Clock;
  protected readonly LockIcon = LockKeyhole;
  protected readonly AlertIcon = CircleAlert;
  protected readonly CheckIcon = Check;
  protected readonly ShieldIcon = ShieldCheck;
  protected readonly FlameIcon = Flame;
  protected readonly BadgeIcon = BadgeCheck;
  protected readonly TruckIcon = Truck;

  protected esActual(d: DireccionClienteResponse): boolean {
    const e = this.entrega();
    return (
      e?.tipo === 'DELIVERY' &&
      e.direccion.direccion === d.direccion.direccion &&
      Number(e.direccion.latitud) === Number(d.direccion.latitud) &&
      Number(e.direccion.longitud) === Number(d.direccion.longitud)
    );
  }

  protected usarDireccion(d: DireccionClienteResponse): void {
    if (this.validando() !== null || this.esActual(d)) return;
    this.validando.set(d.id);
    this.errorDireccion.set(null);
    this.publicoApi
      .cobertura({ latitud: Number(d.direccion.latitud), longitud: Number(d.direccion.longitud) }, { context: peticionSilenciosa() })
      .pipe(finalize(() => this.validando.set(null)))
      .subscribe({
        next: (c) => {
          if (!c.dentroCobertura || c.sucursalId === null) {
            this.errorDireccion.set(`"${d.etiqueta}" está fuera de la zona de reparto. ${c.mensaje}`);
            return;
          }
          this.entregaService.guardar({
            tipo: 'DELIVERY',
            sucursalId: c.sucursalId,
            sucursalNombre: c.sucursalNombre,
            costoEnvio: c.costoEnvio,
            minutosEstimados: c.minutosEstimados,
            direccion: { ...d.direccion, latitud: Number(d.direccion.latitud), longitud: Number(d.direccion.longitud) },
          });
          this.error.set(null);
        },
        error: (e: unknown) => this.errorDireccion.set(mensajeDeError(e, 'No pudimos validar esa dirección. Intenta de nuevo.')),
      });
  }

  protected escribirInstrucciones(evento: Event): void {
    this.instrucciones.set((evento.target as HTMLTextAreaElement).value);
  }

  protected pagar(): void {
    if (this.pagando()) return;
    const entrega = this.entrega();
    if (!entrega) {
      this.accionEntrega.set('elegir');
      return;
    }
    const pago = this.pagos()?.construirPago();
    if (!pago) {
      this.error.set({ mensaje: 'Completa los datos del medio de pago.', deEntrega: false });
      return;
    }

    this.pagando.set(true);
    this.error.set(null);
    this.clienteApi
      .checkout(
        {
          tipoEntrega: entrega.tipo,
          sucursalId: entrega.sucursalId,
          direccionEntrega: entrega.tipo === 'DELIVERY' ? entrega.direccion : null,
          instrucciones: this.instrucciones().trim() || null,
          pago,
        },
        { context: peticionSilenciosa() },
      )
      .pipe(finalize(() => this.pagando.set(false)))
      .subscribe({
        next: (respuesta) => {
          this.cart.refrescar().subscribe({ error: () => undefined });
          void this.router.navigate(['/pedido-confirmado', respuesta.numero]);
        },
        error: (e: unknown) => this.alFallar(e),
      });
  }

  private alFallar(e: unknown): void {
    if (esApiException(e) && e.codigo === 'PAGO_PENDIENTE_CONFIRMACION') {
      this.cart.refrescar().subscribe({ error: () => undefined });
      this.toast.info('Confirmando tu pago', e.message);
      void this.router.navigateByUrl('/mis-pedidos');
      return;
    }
    if (esApiException(e) && e.codigo === 'CARRITO_VACIO') {
      this.carrito.reload();
    }
    const deEntrega = esApiException(e) && ERRORES_DE_ENTREGA.has(e.codigo);
    this.error.set({ mensaje: mensajeDeError(e, 'No pudimos procesar el pago. Intenta de nuevo.'), deEntrega });
  }
}
