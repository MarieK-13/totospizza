import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../config/environment';
import { INICIO_PRUEBA } from '../data/inicio-prueba';
import { FILTROS_PRUEBA, MENU_PRUEBA, detallePrueba, tamanosDePrueba } from '../data/menu-prueba';
import { ApiException } from '../utils/api-exception';
import type { FiltroMenu, HomeResponse, MenuFiltrosResponse, PageResponse, ProductoDetalleResponse, ProductoResumenResponse } from '../models/api';
import { PublicoApi } from './api/publico.api';
import type { OpcionesPeticion } from './api/api-client';

const LATENCIA_SIMULADA_MS = 250;

/**
 * Fuente única del catálogo público. Con `environment.menuDatosDePrueba` responde con datos locales;
 * si no, delega en el backend. Las pantallas no saben cuál de las dos se usa.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly api = inject(PublicoApi);
  private readonly demo = environment.menuDatosDePrueba;

  readonly modoPrueba = this.demo;

  menu(filtro: FiltroMenu = {}, opciones?: Pick<OpcionesPeticion, 'context'>): Observable<PageResponse<ProductoResumenResponse>> {
    if (!this.demo) return this.api.menu(filtro, opciones);

    const texto = filtro.q?.trim().toLowerCase();
    const contenido = MENU_PRUEBA.filter(
      (p) =>
        (!filtro.categoria || FILTROS_PRUEBA.categorias.some((c) => c.slug === filtro.categoria && c.nombre === p.categoria)) &&
        (!filtro.etiqueta || p.etiquetas.some((e) => e.slug === filtro.etiqueta)) &&
        (!filtro.tamanoPizza || tamanosDePrueba(p).includes(filtro.tamanoPizza)) &&
        (!texto || `${p.nombre} ${p.descripcion}`.toLowerCase().includes(texto)),
    );
    const tamano = filtro.tamano ?? contenido.length;
    return of({
      contenido: contenido.slice(0, tamano),
      pagina: 0,
      tamano,
      totalElementos: contenido.length,
      totalPaginas: 1,
      primera: true,
      ultima: true,
    }).pipe(delay(LATENCIA_SIMULADA_MS));
  }

  /** Inicio en una sola llamada: promociones vigentes, destacados, reseñas y datos del negocio. */
  home(opciones?: OpcionesPeticion): Observable<HomeResponse> {
    return this.demo ? of(INICIO_PRUEBA).pipe(delay(LATENCIA_SIMULADA_MS)) : this.api.home(opciones);
  }

  filtros(opciones?: OpcionesPeticion): Observable<MenuFiltrosResponse> {
    return this.demo ? of(FILTROS_PRUEBA).pipe(delay(LATENCIA_SIMULADA_MS)) : this.api.filtros(opciones);
  }

  producto(slug: string, opciones?: OpcionesPeticion): Observable<ProductoDetalleResponse> {
    if (!this.demo) return this.api.producto(slug, opciones);
    const detalle = detallePrueba(slug);
    return detalle
      ? of(detalle).pipe(delay(LATENCIA_SIMULADA_MS))
      : throwError(() => new ApiException({
            fecha: new Date().toISOString(),
            estado: 404,
            codigo: 'PRODUCTO_NO_ENCONTRADO',
            mensaje: 'Producto no encontrado',
            ruta: `/publico/menu/${slug}`,
            errores: [],
          }));
  }
}
