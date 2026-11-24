import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { EMPTY, Observable, catchError, concatMap, from, map, of, switchMap, tap, toArray } from 'rxjs';
import { peticionSilenciosa } from '../interceptors/http-context';
import type { ActualizarItemCarritoRequest, AgregarProductoRequest, CarritoResponse } from '../models/api';
import { ClienteApi } from './api/cliente.api';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

const CLAVE_INVITADO = 'toto.carrito.invitado';

/** Datos que el carrito del invitado necesita para mostrarse sin consultar al servidor. */
export interface ReferenciaItem {
  readonly nombre: string;
  readonly precioUnitario: number;
}

/** Ítem guardado en el navegador mientras no hay sesión; se envía al backend al iniciar sesión. */
export interface ItemInvitado extends ReferenciaItem {
  readonly solicitud: AgregarProductoRequest;
}

/**
 * Carrito único para toda la app.
 * - CLIENTE con sesión: el carrito vive en el backend (/cliente/carrito).
 * - Sin sesión: se guarda en el navegador y se sube al backend en cuanto el cliente inicia sesión.
 *   Así se puede armar el pedido sin cuenta; el login solo se pide para pagar.
 * - Personal (pizzero, admin...): no compra.
 * El header lee `cantidad` y `total` de aquí.
 */
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
  /** Con sesión es el total del backend; sin sesión es referencial (el backend recalcula al pagar). */
  readonly total = computed(() =>
    this.esInvitado()
      ? redondear(this._invitado().reduce((suma, item) => suma + item.precioUnitario * item.solicitud.cantidad, 0))
      : (this._carrito()?.montos.total ?? 0),
  );
  readonly vacio = computed(() => this.cantidad() === 0);

  constructor() {
    effect(() => {
      if (this.auth.esCliente()) {
        // untracked: los interceptores leen la sesión y no deben volver a disparar este efecto
        untracked(() => this.sincronizarInvitado());
      } else {
        this._carrito.set(null);
      }
    });
  }

  refrescar(): Observable<CarritoResponse> {
    return this.api.carrito().pipe(tap((c) => this._carrito.set(c)));
  }

  /** Agrega al carrito del backend o, sin sesión, al del navegador. */
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

  actualizar(itemId: number, cuerpo: ActualizarItemCarritoRequest): Observable<CarritoResponse> {
    return this.api.actualizarItem(itemId, cuerpo).pipe(tap((c) => this._carrito.set(c)));
  }

  quitar(itemId: number): Observable<CarritoResponse> {
    return this.api.quitarItem(itemId).pipe(tap((c) => this._carrito.set(c)));
  }

  /** Quita un ítem del carrito del invitado por su posición. */
  quitarInvitado(indice: number): void {
    this.guardarInvitado(this._invitado().filter((_, i) => i !== indice));
  }

  vaciar(): Observable<CarritoResponse> {
    return this.api.vaciarCarrito().pipe(tap((c) => this._carrito.set(c)));
  }

  /** Sube al backend lo que el cliente agregó sin sesión y luego trae el carrito completo. */
  private sincronizarInvitado(): void {
    const pendientes = this._invitado();
    const subida$ =
      pendientes.length === 0
        ? this.refrescar()
        : from(pendientes).pipe(
            concatMap((item) =>
              this.api.agregarAlCarrito(item.solicitud, { context: peticionSilenciosa() }).pipe(
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

  private guardarInvitado(items: readonly ItemInvitado[]): void {
    this._invitado.set(items);
    try {
      if (items.length === 0) localStorage.removeItem(CLAVE_INVITADO);
      else localStorage.setItem(CLAVE_INVITADO, JSON.stringify(items));
    } catch {
      // sin almacenamiento: el carrito vale solo para esta pestaña
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

function redondear(monto: number): number {
  return Math.round(monto * 100) / 100;
}
