import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Bike, LucideAngularModule, MapPin, Minus, Pizza, Plus, ShoppingBag, Store, Trash2, X } from 'lucide-angular';
import { catchError, finalize, of } from 'rxjs';
import { peticionSilenciosa } from '../../../../core/interceptors/http-context';
import { PublicoApi } from '../../../../core/services/api/publico.api';
import { AuthService } from '../../../../core/services/auth.service';
import { CatalogoService } from '../../../../core/services/catalogo.service';
import { CANTIDAD_MAXIMA_ITEM, CartService, type LineaCarrito } from '../../../../core/services/cart.service';
import { EntregaService } from '../../../../core/services/entrega.service';
import { COSTO_DELIVERY_BASE_DEFECTO, ENVIO_GRATIS_DESDE_DEFECTO, calcularEnvio, redondear } from '../../../../core/utils/envio';
import { formatearSoles } from '../../../../core/utils/money';
import { EntregaDialog, type AccionEntrega } from '../../../../shared/components/entrega-dialog/entrega-dialog';
import { ProductCard } from '../../../../shared/components/product-card/product-card';

const MAX_ACOMPANANTES = 8;

@Component({
  selector: 'app-cart-page',
  imports: [NgTemplateOutlet, RouterLink, LucideAngularModule, EntregaDialog, ProductCard],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  private readonly api = inject(PublicoApi);
  private readonly catalogo = inject(CatalogoService);
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);
  private readonly entregaService = inject(EntregaService);

  private readonly configuracion = rxResource({
    stream: () => this.api.configuracion({ context: peticionSilenciosa() }).pipe(catchError(() => of(null))),
  });

  private readonly menu = rxResource({
    stream: () => this.catalogo.menu({ tamano: 100 }, { context: peticionSilenciosa() }).pipe(catchError(() => of(null))),
  });
  private readonly slugPorNombre = computed(
    () => new Map((this.menu.value()?.contenido ?? []).map((p) => [p.nombre.toLowerCase(), p.slug] as const)),
  );

  protected readonly lineas = computed(() =>
    this.cart.lineas().map((l) => ({ ...l, slug: l.slug ?? this.slugPorNombre().get(l.nombre.toLowerCase()) ?? null })),
  );

  protected readonly acompanantes = computed(() => {
    const enCarrito = new Set(this.cart.lineas().map((l) => l.nombre.toLowerCase()));
    return (this.menu.value()?.contenido ?? [])
      .filter((p) => p.disponible && !/pizza/i.test(p.categoria) && !enCarrito.has(p.nombre.toLowerCase()))
      .slice(0, MAX_ACOMPANANTES);
  });
  protected readonly entrega = this.entregaService.actual;
  protected readonly ocupado = signal<string | null>(null);
  protected readonly accionEntrega = signal<AccionEntrega | null>(null);

  protected readonly subtotal = this.cart.subtotal;
  private readonly envioGratisDesde = computed(
    () => this.cart.carrito()?.montos.envioGratisDesde ?? this.configuracion.value()?.envioGratisDesde ?? ENVIO_GRATIS_DESDE_DEFECTO,
  );

  protected readonly envio = computed(() =>
    calcularEnvio(this.entrega(), this.subtotal(), this.envioGratisDesde(), this.configuracion.value()?.costoDeliveryBase ?? COSTO_DELIVERY_BASE_DEFECTO),
  );
  protected readonly total = computed(() => redondear(this.subtotal() + (this.envio() ?? 0)));

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

  private ejecutar(clave: string, accion$: ReturnType<CartService['vaciarTodo']>): void {
    if (this.ocupado()) return;
    this.ocupado.set(clave);
    accion$.pipe(finalize(() => this.ocupado.set(null))).subscribe({ error: () => undefined });
  }
}
