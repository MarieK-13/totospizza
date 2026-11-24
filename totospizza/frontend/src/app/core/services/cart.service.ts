import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { EMPTY, Observable, catchError, concatMap, from, map, of, switchMap, tap, toArray } from 'rxjs';
import { peticionSilenciosa } from '../interceptors/http-context';
import type { ActualizarItemCarritoRequest, AgregarProductoRequest, CarritoResponse, ItemCarritoResponse, PizzaPersonalizadaRequest } from '../models/api';
import { ClienteApi } from './api/cliente.api';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

const CLAVE_INVITADO = 'toto.carrito.invitado';

export interface ReferenciaItem {
  readonly nombre: string;
  readonly slug: string | null;
  readonly precioUnitario: number;
  readonly imagenUrl: string | null;
  readonly detalle: string;
}

export interface LineaCarrito {
  readonly clave: string;
  readonly itemId: number | null;
  readonly indice: number | null;
  readonly nombre: string;
  readonly slug: string | null;
  readonly detalle: string;
  readonly imagenUrl: string | null;
  readonly cantidad: number;
  readonly precioUnitario: number;
  readonly subtotal: number;
  readonly notas: string | null;
}

export const CANTIDAD_MAXIMA_ITEM = 20;

export interface ItemInvitado extends ReferenciaItem {
  readonly solicitud: AgregarProductoRequest;
  readonly pizza?: PizzaPersonalizadaRequest;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ClienteApi);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly _carrito = signal<CarritoResponse | null>(null);
  private readonly _invitado = signal<readonly ItemInvitado[]>(leerInvitado());

  readonly carrito = this._carrito.asReadonly();
  readonly itemsInvitado = this._invitado.asReadonly();
  readonly esInvitado = computed(() => !this.auth.usuario());
  readonly puedeComprar = computed(() => this.esInvitado() || this.auth.esCliente());

  readonly cantidad = computed(() =>
    this.esInvitado() ? this._invitado().reduce((suma, item) => suma + item.solicitud.cantidad, 0) : (this._carrito()?.totalItems ?? 0),
  );
  readonly total = computed(() =>
    this.esInvitado()
      ? redondear(this._invitado().reduce((suma, item) => suma + item.precioUnitario * item.solicitud.cantidad, 0))
      : (this._carrito()?.montos.total ?? 0),
  );
  readonly vacio = computed(() => this.cantidad() === 0);

  readonly lineas = computed<readonly LineaCarrito[]>(() =>
    this.esInvitado()
      ? this._invitado().map((item, indice) => ({
          clave: `local-${indice}`,
          itemId: null,
          indice,
          nombre: item.nombre,
          slug: item.slug ?? null,
          detalle: item.detalle ?? '',
          imagenUrl: item.imagenUrl ?? null,
          cantidad: item.solicitud.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: redondear(item.precioUnitario * item.solicitud.cantidad),
          notas: item.solicitud.notas ?? null,
        }))
      : (this._carrito()?.items ?? []).map(lineaDelBackend),
  );
  readonly subtotal = computed(() =>
    this.esInvitado() ? this.total() : (this._carrito()?.montos.subtotal ?? 0),
  );

  constructor() {
    effect(() => {
      if (this.auth.esCliente()) {
        untracked(() => this.sincronizarInvitado());
      } else {
        this._carrito.set(null);
      }
    });
  }

  refrescar(): Observable<CarritoResponse> {
    return this.api.carrito().pipe(tap((c) => this._carrito.set(c)));
  }

  agregar(cuerpo: AgregarProductoRequest, referencia: ReferenciaItem): Observable<void> {
    if (this.esInvitado()) {
      this.guardarInvitado([...this._invitado(), { ...referencia, solicitud: cuerpo }]);
      return of(undefined);
    }
    if (!this.auth.esCliente()) {
      this.toast.info('Solo clientes', 'Las cuentas del personal no hacen pedidos.');
      return EMPTY;
    }
    return this.api.agregarAlCarrito(cuerpo).pipe(
      tap((c) => this._carrito.set(c)),
      map(() => undefined),
    );
  }

  agregarPizzaPersonalizada(pizza: PizzaPersonalizadaRequest, cantidad: number, referencia: ReferenciaItem): Observable<void> {
    if (this.esInvitado()) {
      this.guardarInvitado([...this._invitado(), { ...referencia, solicitud: { cantidad }, pizza }]);
      return of(undefined);
    }
    if (!this.auth.esCliente()) {
      this.toast.info('Solo clientes', 'Las cuentas del personal no hacen pedidos.');
      return EMPTY;
    }
    return this.api.guardarPizzaPersonalizada(pizza).pipe(
      switchMap((guardada) => this.api.agregarAlCarrito({ pizzaPersonalizadaId: guardada.id, cantidad })),
      tap((c) => this._carrito.set(c)),
      map(() => undefined),
    );
  }

  actualizar(itemId: number, cuerpo: ActualizarItemCarritoRequest): Observable<CarritoResponse> {
    return this.api.actualizarItem(itemId, cuerpo).pipe(tap((c) => this._carrito.set(c)));
  }

  quitar(itemId: number): Observable<CarritoResponse> {
    return this.api.quitarItem(itemId).pipe(tap((c) => this._carrito.set(c)));
  }

  cambiarCantidad(linea: LineaCarrito, cantidad: number): Observable<void> {
    const nueva = Math.min(CANTIDAD_MAXIMA_ITEM, Math.max(1, cantidad));
    if (linea.indice !== null) {
      this.guardarInvitado(
        this._invitado().map((item, i) => (i === linea.indice ? { ...item, solicitud: { ...item.solicitud, cantidad: nueva } } : item)),
      );
      return of(undefined);
    }
    if (linea.itemId === null) return of(undefined);
    return this.actualizar(linea.itemId, { cantidad: nueva, notas: linea.notas }).pipe(map(() => undefined));
  }

  quitarLinea(linea: LineaCarrito): Observable<void> {
    if (linea.indice !== null) {
      this.guardarInvitado(this._invitado().filter((_, i) => i !== linea.indice));
      return of(undefined);
    }
    if (linea.itemId === null) return of(undefined);
    return this.quitar(linea.itemId).pipe(map(() => undefined));
  }

  vaciarTodo(): Observable<void> {
    if (this.esInvitado()) {
      this.guardarInvitado([]);
      return of(undefined);
    }
    return this.vaciar().pipe(map(() => undefined));
  }

  vaciar(): Observable<CarritoResponse> {
    return this.api.vaciarCarrito().pipe(tap((c) => this._carrito.set(c)));
  }

  private sincronizarInvitado(): void {
    const pendientes = this._invitado();
    const subida$ =
      pendientes.length === 0
        ? this.refrescar()
        : from(pendientes).pipe(
            concatMap((item) =>
              this.subirItemInvitado(item).pipe(
                map(() => true),
                catchError(() => of(false)),
              ),
            ),
            toArray(),
            switchMap((resultados) => {
              this.guardarInvitado([]);
              const fallidos = resultados.filter((ok) => !ok).length;
              if (fallidos > 0) {
                this.toast.warning(
                  'Revisa tu carrito',
                  fallidos === 1 ? 'Un producto ya no estaba disponible y no se agregó.' : `${fallidos} productos ya no estaban disponibles y no se agregaron.`,
                );
              }
              return this.refrescar();
            }),
          );
    subida$.subscribe({ error: () => undefined });
  }

  private subirItemInvitado(item: ItemInvitado): Observable<CarritoResponse> {
    const silenciosa = { context: peticionSilenciosa() };
    if (!item.pizza) return this.api.agregarAlCarrito(item.solicitud, silenciosa);
    return this.api
      .guardarPizzaPersonalizada(item.pizza, silenciosa)
      .pipe(switchMap((guardada) => this.api.agregarAlCarrito({ pizzaPersonalizadaId: guardada.id, cantidad: item.solicitud.cantidad }, silenciosa)));
  }

  private guardarInvitado(items: readonly ItemInvitado[]): void {
    this._invitado.set(items);
    try {
      if (items.length === 0) localStorage.removeItem(CLAVE_INVITADO);
      else localStorage.setItem(CLAVE_INVITADO, JSON.stringify(items));
    } catch {
    }
  }
}

function leerInvitado(): readonly ItemInvitado[] {
  try {
    const valor = localStorage.getItem(CLAVE_INVITADO);
    const items: unknown = valor ? JSON.parse(valor) : [];
    return Array.isArray(items) ? (items as ItemInvitado[]).filter((i) => i?.solicitud && typeof i.precioUnitario === 'number') : [];
  } catch {
    return [];
  }
}

function lineaDelBackend(item: ItemCarritoResponse): LineaCarrito {
  const extras = item.adicionales.map((a) => (a.cantidad > 1 ? `${a.nombre} ×${a.cantidad}` : a.nombre));
  return {
    clave: `item-${item.id}`,
    itemId: item.id,
    indice: null,
    nombre: item.nombre,
    slug: null,
    detalle: [item.tamano, item.tipoMasa, ...extras].filter(Boolean).join(', '),
    imagenUrl: item.imagenUrl,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: item.subtotal,
    notas: item.notas,
  };
}

function redondear(monto: number): number {
  return Math.round(monto * 100) / 100;
}
