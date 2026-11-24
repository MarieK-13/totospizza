import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { peticionSilenciosa } from '../interceptors/http-context';
import { CatalogoService } from './catalogo.service';
import { CartService } from './cart.service';
import { ToastService } from './toast.service';

export type ResultadoAgregarRapido = 'agregado' | 'opciones' | 'rechazado';

/**
 * Botón "+" de las tarjetas del menú.
 * - Producto sin opciones (bebidas, salsas): se agrega 1 unidad al carrito, con o sin sesión.
 * - Pizza (exige tamaño y masa): lleva al detalle para elegirlos.
 * El resumen del menú no dice si un producto pide opciones, por eso se consulta el detalle al pulsar.
 */
@Injectable({ providedIn: 'root' })
export class AgregarRapidoService {
  private readonly api = inject(CatalogoService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  agregar(slug: string, nombre: string): Observable<ResultadoAgregarRapido> {
    if (!this.cart.puedeComprar()) {
      this.toast.info('Solo clientes', 'Las cuentas del personal no hacen pedidos.');
      return of('rechazado');
    }

    return this.api.producto(slug, { context: peticionSilenciosa() }).pipe(
      catchError(() => {
        this.toast.error('Producto no disponible', `${nombre} ya no está en el menú.`);
        return EMPTY;
      }),
      switchMap((detalle): Observable<ResultadoAgregarRapido> => {
        if (detalle.requiereTamano) {
          void this.router.navigate(['/menu', slug]);
          return of('opciones');
        }
        return this.cart.agregar({ productoId: detalle.id, cantidad: 1 }, { nombre: detalle.nombre, precioUnitario: detalle.precioBase }).pipe(
          tap(() => this.toast.success('Agregado al carrito', nombre)),
          map(() => 'agregado' as const),
        );
      }),
    );
  }
}
