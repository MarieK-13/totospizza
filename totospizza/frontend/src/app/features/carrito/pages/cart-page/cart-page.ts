import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Bike, LucideAngularModule, MapPin, Minus, Pizza, Plus, ShoppingBag, Store, Trash2, X } from 'lucide-angular';
import { catchError, finalize, of } from 'rxjs';
import { peticionSilenciosa } from '../../../../core/interceptors/http-context';
import { PublicoApi } from '../../../../core/services/api/publico.api';
import { AuthService } from '../../../../core/services/auth.service';
import { CANTIDAD_MAXIMA_ITEM, CartService, type LineaCarrito } from '../../../../core/services/cart.service';
import { EntregaService } from '../../../../core/services/entrega.service';
import { formatearSoles } from '../../../../core/utils/money';
import { EntregaDialog, type AccionEntrega } from '../../../../shared/components/entrega-dialog/entrega-dialog';

/** Respaldo si /publico/configuracion no responde (mismos valores por defecto del backend). */
const ENVIO_GRATIS_DESDE = 49;
const COSTO_DELIVERY_BASE = 5;

/**
 * Carrito. Funciona con y sin sesión:
 * - Invitado: muestra lo guardado en el navegador y pide iniciar sesión para pagar (el carrito se sube solo).
 * - Cliente: muestra el carrito del backend y continúa al pago.
 * El envío es referencial; el backend recalcula todo al confirmar el pedido.
 */
@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, LucideAngularModule, EntregaDialog],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  private readonly api = inject(PublicoApi);
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);
  private readonly entregaService = inject(EntregaService);

  private readonly configuracion = rxResource({
    stream: () => this.api.configuracion({ context: peticionSilenciosa() }).pipe(catchError(() => of(null))),
  });

  protected readonly lineas = this.cart.lineas;
  protected readonly entrega = this.entregaService.actual;
  protected readonly ocupado = signal<string | null>(null);
  protected readonly accionEntrega = signal<AccionEntrega | null>(null);

  protected readonly subtotal = this.cart.subtotal;
  private readonly envioGratisDesde = computed(
    () => this.cart.carrito()?.montos.envioGratisDesde ?? this.configuracion.value()?.envioGratisDesde ?? ENVIO_GRATIS_DESDE,
  );

  /** null = aún no se eligió cómo recibirlo. */
  protected readonly envio = computed<number | null>(() => {
    const e = this.entrega();
    if (!e) return null;
    if (e.tipo === 'RECOJO' || this.subtotal() >= this.envioGratisDesde()) return 0;
    return e.costoEnvio ?? this.configuracion.value()?.costoDeliveryBase ?? COSTO_DELIVERY_BASE;
  });
  protected readonly total = computed(() => Math.round((this.subtotal() + (this.envio() ?? 0)) * 100) / 100);

  /** Barra de envío gratis: solo tiene sentido en delivery. */
  protected readonly faltaEnvioGratis = computed(() => Math.max(0, Math.round((this.envioGratisDesde() - this.subtotal()) * 100) / 100));
  protected readonly avanceEnvioGratis = computed(() => Math.min(100, Math.round((this.subtotal() / this.envioGratisDesde()) * 100)));
  protected readonly mostrarEnvioGratis = computed(() => this.entrega()?.tipo !== 'RECOJO');

  protected readonly aviso = computed(() => (this.cart.carrito()?.montosReferenciales ? this.cart.carrito()?.avisoMontos : null));
  protected readonly esPersonal = computed(() => !!this.auth.usuario() && !this.auth.esCliente());

  protected readonly soles = formatearSoles;
  protected readonly CANTIDAD_MAXIMA = CANTIDAD_MAXIMA_ITEM;

  protected readonly PizzaIcon = Pizza;
  protected readonly MinusIcon = Minus;
  protected readonly PlusIcon = Plus;
  protected readonly RemoveIcon = X;
  protected readonly TrashIcon = Trash2;
  protected readonly BagIcon = ShoppingBag;
  protected readonly StoreIcon = Store;
  protected readonly BikeIcon = Bike;
  protected readonly PinIcon = MapPin;

  protected cambiarCantidad(linea: LineaCarrito, delta: number): void {
    this.ejecutar(linea.clave, this.cart.cambiarCantidad(linea, linea.cantidad + delta));
  }

  protected quitar(linea: LineaCarrito): void {
    this.ejecutar(linea.clave, this.cart.quitarLinea(linea));
  }

  protected vaciar(): void {
    this.ejecutar('todo', this.cart.vaciarTodo());
  }

  protected elegirEntrega(): void {
    this.accionEntrega.set('elegir');
  }

  /** Evita doble clic mientras responde el backend; los errores los muestra el interceptor. */
  private ejecutar(clave: string, accion$: ReturnType<CartService['vaciarTodo']>): void {
    if (this.ocupado()) return;
    this.ocupado.set(clave);
    accion$.pipe(finalize(() => this.ocupado.set(null))).subscribe({ error: () => undefined });
  }
}
