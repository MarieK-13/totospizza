import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  CoberturaResponse,
  ConfiguracionPublicaResponse,
  ConsultaCoberturaRequest,
  CotizacionPizzaResponse,
  FiltroMenu,
  HomeResponse,
  LocalesResponse,
  MenuFiltrosResponse,
  MetodoPagoDisponibleResponse,
  OpcionesPersonalizacionResponse,
  PageResponse,
  PizzaPersonalizadaRequest,
  ProductoDetalleResponse,
  ProductoResumenResponse,
  PromocionResponse,
  ResenaResponse,
  ResumenCalificacionResponse,
  SucursalResponse,
} from '../../models/api';
import { ApiClient, type OpcionesPeticion } from './api-client';

@Injectable({ providedIn: 'root' })
export class PublicoApi {
  private readonly api = inject(ApiClient);

  home(opciones?: OpcionesPeticion): Observable<HomeResponse> {
    return this.api.get('/publico/home', opciones);
  }

  menu(filtro: FiltroMenu = {}, opciones?: Pick<OpcionesPeticion, 'context'>): Observable<PageResponse<ProductoResumenResponse>> {
    return this.api.get('/publico/menu', { params: filtro, context: opciones?.context });
  }

  filtros(opciones?: OpcionesPeticion): Observable<MenuFiltrosResponse> {
    return this.api.get('/publico/menu/filtros', opciones);
  }

  producto(slug: string, opciones?: OpcionesPeticion): Observable<ProductoDetalleResponse> {
    return this.api.get(`/publico/menu/${encodeURIComponent(slug)}`, opciones);
  }

  promociones(): Observable<readonly PromocionResponse[]> {
    return this.api.get('/publico/promociones');
  }

  resenasDestacadas(limite = 6): Observable<readonly ResenaResponse[]> {
    return this.api.get('/publico/resenas/destacadas', { params: { limite } });
  }

  calificacion(productoId: number): Observable<ResumenCalificacionResponse> {
    return this.api.get(`/publico/productos/${productoId}/calificacion`);
  }

  locales(opciones?: OpcionesPeticion): Observable<LocalesResponse> {
    return this.api.get('/publico/locales', opciones);
  }

  local(id: number): Observable<SucursalResponse> {
    return this.api.get(`/publico/locales/${id}`);
  }

  cobertura(cuerpo: ConsultaCoberturaRequest, opciones?: OpcionesPeticion): Observable<CoberturaResponse> {
    return this.api.post('/publico/cobertura', cuerpo, opciones);
  }

  configuracion(opciones?: OpcionesPeticion): Observable<ConfiguracionPublicaResponse> {
    return this.api.get('/publico/configuracion', opciones);
  }

  metodosPago(): Observable<readonly MetodoPagoDisponibleResponse[]> {
    return this.api.get('/publico/metodos-pago');
  }

  opcionesPersonalizacion(opciones?: OpcionesPeticion): Observable<OpcionesPersonalizacionResponse> {
    return this.api.get('/publico/personalizacion/opciones', opciones);
  }

  cotizarPizza(cuerpo: PizzaPersonalizadaRequest): Observable<CotizacionPizzaResponse> {
    return this.api.post('/publico/personalizacion/cotizar', cuerpo);
  }
}
