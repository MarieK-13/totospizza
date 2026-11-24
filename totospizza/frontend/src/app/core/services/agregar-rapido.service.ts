import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { peticionSilenciosa } from '../interceptors/http-context';
import type { PromocionResponse } from '../models/api';
import { imagenDeProducto } from '../utils/producto-imagen';
import { CatalogoService } from './catalogo.service';
import { CartService } from './cart.service';
import { ToastService } from './toast.service';

export type ResultadoAgregarRapido = 'agregado' | 'opciones' | 'rechazado';

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
        return this.cart.agregar({ productoId: detalle.id, cantidad: 1 }, { nombre: detalle.nombre, slug: detalle.slug, precioUnitario: detalle.precioBase, imagenUrl: imagenDeProducto(detalle), detalle: '' }).pipe(
          tap(() => this.toast.success('Agregado al carrito', nombre)),
          map(() => 'agregado' as const),
        );
      }),
    );
  }

  agregarPromocion(promo: PromocionResponse): Observable<ResultadoAgregarRapido> {
    if (!this.cart.puedeComprar()) {
      this.toast.info('Solo clientes', 'Las cuentas del personal no hacen pedidos.');
      return of('rechazado');
    }
    return this.cart
      .agregar(
        { promocionId: promo.id, cantidad: 1 },
        { nombre: promo.titulo, slug: null, precioUnitario: promo.precioPromocional, imagenUrl: promo.imagenUrl, detalle: detalleDePromocion(promo) },
      )
      .pipe(
        tap(() => this.toast.success('Agregado al carrito', promo.titulo)),
        map(() => 'agregado' as const),
      );
  }
}

export function detalleDePromocion(promo: Pick<PromocionResponse, 'items'>): string {
  return promo.items.map((i) => `${i.cantidad} × ${i.productoNombre}${i.tamanoNombre ? ` (${i.tamanoNombre})` : ''}`).join(', ');
}
