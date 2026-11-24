import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowLeft, Bike, Check, Info, LucideAngularModule, MapPin, Minus, Pizza, Plus, Star, Store } from 'lucide-angular';
import { finalize, map, timeout } from 'rxjs';
import { peticionSilenciosa } from '../../core/interceptors/http-context';
import type { IngredienteResponse, TipoIngrediente } from '../../core/models/api';
import { CatalogoService } from '../../core/services/catalogo.service';
import { CartService } from '../../core/services/cart.service';
import { EntregaService } from '../../core/services/entrega.service';
import { ToastService } from '../../core/services/toast.service';
import { esApiException } from '../../core/utils/api-exception';
import { separarEtiquetas } from '../../core/utils/etiquetas';
import { formatearSoles } from '../../core/utils/money';
import { imagenDeProducto } from '../../core/utils/producto-imagen';
import { precioUnitario } from '../../core/utils/precio-producto';
import { EntregaDialog, type AccionEntrega } from '../../shared/components/entrega-dialog/entrega-dialog';
import { ProductInfoDialog, type FichaProducto } from '../../shared/components/product-info-dialog/product-info-dialog';

const CANTIDAD_MAXIMA = 20;
const ES_MASA_DE_STOCK = /^masa(\s+de\s+pizza)?$/i;
const EXTRA_MAXIMO = 5;
const EXTRAS_DISTINTOS_MAXIMOS = 10;

const GRUPOS_ADICIONALES: readonly { readonly tipo: TipoIngrediente; readonly titulo: string }[] = [
  { tipo: 'QUESO', titulo: 'Quesos' },
  { tipo: 'SALSA', titulo: 'Salsas' },
  { tipo: 'CARNE', titulo: 'Carnes' },
  { tipo: 'OTRO', titulo: 'Otros' },
];

@Component({
  selector: 'app-producto',
  imports: [RouterLink, LucideAngularModule, ProductInfoDialog, EntregaDialog],
  templateUrl: './producto.html',
  styleUrl: './producto.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Producto {
  private readonly api = inject(CatalogoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly cart = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly entrega = inject(EntregaService);

  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), { initialValue: '' });

  protected readonly recurso = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.api.producto(params, { context: peticionSilenciosa() }).pipe(timeout(15_000)),
  });
  protected readonly producto = computed(() => {
    const p = this.recurso.error() ? undefined : this.recurso.value();
    if (!p) return undefined;
    const precios = p.precios.filter((x, i, todos) => todos.findIndex((y) => y.tamanoId === x.tamanoId) === i);
    const adicionales = p.adicionales.filter((a) => !ES_MASA_DE_STOCK.test(a.nombre.trim()));
    return { ...p, precios, adicionales };
  });
  protected readonly noEncontrado = computed(() => {
    const error = this.recurso.error();
    return esApiException(error) && error.estado === 404;
  });
  protected readonly falloCarga = computed(() => !!this.recurso.error() && !this.noEncontrado());

  protected readonly tamanoId = signal<number | null>(null);
  protected readonly tipoMasaId = signal<number | null>(null);
  protected readonly extras = signal<Readonly<Record<number, number>>>({});
  protected readonly cantidad = signal(1);
  protected readonly notas = signal('');

  protected readonly infoAbierta = signal(false);
  protected readonly enviando = signal(false);
  protected readonly agregado = signal(false);
  protected readonly accionEntrega = signal<AccionEntrega | null>(null);

  protected readonly unitario = computed(() => {
    const p = this.producto();
    return p ? precioUnitario(p, { tamanoId: this.tamanoId(), tipoMasaId: this.tipoMasaId(), extras: this.extras() }) : null;
  });
  protected readonly total = computed(() => {
    const u = this.unitario();
    return u === null ? null : Math.round(u * this.cantidad() * 100) / 100;
  });
  protected readonly opcionesCompletas = computed(() => this.unitario() !== null);
  protected readonly extrasDistintos = computed(() => Object.values(this.extras()).filter((c) => c > 0).length);

  protected readonly gruposAdicionales = computed(() => {
    const todos = this.producto()?.adicionales ?? [];
    return GRUPOS_ADICIONALES.map((g) => ({ titulo: g.titulo, items: todos.filter((i) => i.tipo === g.tipo && i.disponible) })).filter((g) => g.items.length > 0);
  });

  protected readonly insignias = computed(() => separarEtiquetas(this.producto()?.etiquetas ?? []).otras);

  protected readonly ficha = computed<FichaProducto | null>(() => {
    const p = this.producto();
    if (!p) return null;
    const precios = p.precios.map((x) => x.precio);
    return { ...p, precioDesde: precios.length > 0 ? Math.min(...precios) : p.precioBase };
  });

  protected readonly imagen = computed(() => {
    const p = this.producto();
    return p ? imagenDeProducto(p) : null;
  });
  protected readonly calificacion = computed(() => (this.producto()?.calificacionPromedio ?? 0).toFixed(1));
  protected readonly tieneCalificacion = computed(() => (this.producto()?.totalResenas ?? 0) > 0);
  protected readonly puedeComprar = this.cart.puedeComprar;

  private readonly detalleSeleccion = computed(() => {
    const p = this.producto();
    if (!p?.requiereTamano) return '';
    const tamano = p.precios.find((x) => x.tamanoId === this.tamanoId())?.tamanoNombre;
    const masa = p.tiposMasa.find((m) => m.id === this.tipoMasaId())?.nombre;
    const extras = p.adicionales
      .filter((i) => this.cantidadExtra(i) > 0)
      .map((i) => (this.cantidadExtra(i) > 1 ? `${i.nombre} ×${this.cantidadExtra(i)}` : i.nombre));
    return [tamano, masa, ...extras].filter(Boolean).join(', ');
  });
  protected readonly tieneEntrega = computed(() => this.entrega.actual() !== null);

  protected readonly resumenEntrega = computed(() => {
    const e = this.entrega.actual();
    if (!e) return null;
    if (e.tipo === 'RECOJO') return { titulo: `Recojo en ${e.sucursalNombre}`, detalle: 'Sin costo de envío' };
    const costo = e.costoEnvio === null ? null : e.costoEnvio === 0 ? 'Envío gratis' : `Envío ${formatearSoles(e.costoEnvio)}`;
    const tiempo = e.minutosEstimados ? `llega en ${e.minutosEstimados} min aprox.` : null;
    return { titulo: `Delivery a ${e.direccion.direccion}`, detalle: [costo, tiempo].filter(Boolean).join(', ') };
  });

  protected readonly formatear = formatearSoles;
  protected readonly CANTIDAD_MAXIMA = CANTIDAD_MAXIMA;
  protected readonly EXTRA_MAXIMO = EXTRA_MAXIMO;

  protected readonly BackIcon = ArrowLeft;
  protected readonly PizzaIcon = Pizza;
  protected readonly StarIcon = Star;
  protected readonly PlusIcon = Plus;
  protected readonly MinusIcon = Minus;
  protected readonly InfoIcon = Info;
  protected readonly CheckIcon = Check;
  protected readonly StoreIcon = Store;
  protected readonly BikeIcon = Bike;
  protected readonly PinIcon = MapPin;

  constructor() {
    const body = inject(DOCUMENT).body;
    body.classList.add('vista-fija');
    this.destroyRef.onDestroy(() => body.classList.remove('vista-fija'));

    effect(() => {
      const p = this.producto();
      untracked(() => {
        const sugerido = Number(this.route.snapshot.queryParamMap.get('tamano'));
        const tamanoInicial = p?.precios.find((x) => x.tamanoId === sugerido) ?? p?.precios[0];
        this.tamanoId.set(p?.requiereTamano ? (tamanoInicial?.tamanoId ?? null) : null);
        this.tipoMasaId.set(p?.requiereTamano ? (p.tiposMasa[0]?.id ?? null) : null);
        this.extras.set({});
        this.cantidad.set(1);
        this.notas.set('');
        this.agregado.set(false);
      });
    });
  }

  protected elegirTamano(id: number): void {
    this.tamanoId.set(id);
  }

  protected elegirMasa(id: number): void {
    this.tipoMasaId.set(id);
  }

  protected cantidadExtra(ingrediente: IngredienteResponse): number {
    return this.extras()[ingrediente.id] ?? 0;
  }

  protected cambiarExtra(ingrediente: IngredienteResponse, delta: number): void {
    const actual = this.cantidadExtra(ingrediente);
    const nueva = Math.min(EXTRA_MAXIMO, Math.max(0, actual + delta));
    if (nueva === actual) return;
    if (actual === 0 && this.extrasDistintos() >= EXTRAS_DISTINTOS_MAXIMOS) return;
    this.extras.update((e) => ({ ...e, [ingrediente.id]: nueva }));
  }

  protected puedeSumarExtra(ingrediente: IngredienteResponse): boolean {
    const actual = this.cantidadExtra(ingrediente);
    if (actual >= EXTRA_MAXIMO) return false;
    return actual > 0 || this.extrasDistintos() < EXTRAS_DISTINTOS_MAXIMOS;
  }

  protected cambiarCantidad(delta: number): void {
    this.cantidad.update((c) => Math.min(CANTIDAD_MAXIMA, Math.max(1, c + delta)));
  }

  protected alEscribirNotas(evento: Event): void {
    this.notas.set((evento.target as HTMLTextAreaElement).value);
  }

  protected agregar(evento: Event): void {
    evento.preventDefault();
    this.continuar('agregar');
  }

  protected comprarAhora(): void {
    this.continuar('comprar');
  }

  private continuar(accion: Exclude<AccionEntrega, 'elegir'>): void {
    if (!this.producto() || this.enviando() || !this.puedeComprar() || !this.opcionesCompletas()) return;
    if (this.entrega.actual()) this.enviar(accion === 'comprar');
    else this.accionEntrega.set(accion);
  }

  protected elegirEntrega(): void {
    this.accionEntrega.set('elegir');
  }

  protected alConfirmarEntrega(): void {
    const accion = this.accionEntrega();
    this.accionEntrega.set(null);
    if (accion === 'agregar' || accion === 'comprar') this.enviar(accion === 'comprar');
  }


  private enviar(irAlCarrito: boolean): void {
    const p = this.producto();
    const unitario = this.unitario();
    if (!p || unitario === null || this.enviando()) return;

    const adicionales = Object.entries(this.extras())
      .filter(([, cantidad]) => cantidad > 0)
      .map(([id, cantidad]) => ({ ingredienteId: Number(id), cantidad }));

    this.enviando.set(true);
    this.cart
      .agregar({
        productoId: p.id,
        tamanoId: p.requiereTamano ? this.tamanoId() : null,
        tipoMasaId: p.requiereTamano ? this.tipoMasaId() : null,
        cantidad: this.cantidad(),
        notas: this.notas().trim() || null,
        adicionales,
      }, { nombre: p.nombre, slug: p.slug, precioUnitario: unitario, imagenUrl: this.imagen(), detalle: this.detalleSeleccion() })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          if (irAlCarrito) {
            void this.router.navigate(['/carrito']);
            return;
          }
          this.agregado.set(true);
          this.toast.success('Agregado al carrito', `${this.cantidad()} × ${p.nombre}`);
          const espera = setTimeout(() => this.agregado.set(false), 2500);
          this.destroyRef.onDestroy(() => clearTimeout(espera));
        },
        error: () => undefined,
      });
  }
}
