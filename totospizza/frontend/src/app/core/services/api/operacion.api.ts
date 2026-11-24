import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  AsignarMotorizadoRequest,
  ConfirmarEntregaRequest,
  ConteoResponse,
  EmpleadoResponse,
  EntregaAsignadaResponse,
  EntregaResponse,
  NotificacionResponse,
  PaginaParams,
  PageResponse,
  PedidoListoResponse,
  TableroCocinaResponse,
} from '../../models/api';
import { ApiClient } from './api-client';

/** Cocina (PIZZERO), despacho (DESPACHADOR) y reparto (MOTORIZADO). */
@Injectable({ providedIn: 'root' })
export class OperacionApi {
  private readonly api = inject(ApiClient);

  // ---- Cocina ----
  tableroCocina(): Observable<TableroCocinaResponse> {
    return this.api.get('/cocina/tablero');
  }

  iniciarPreparacion(pedidoId: number): Observable<TableroCocinaResponse> {
    return this.api.post(`/cocina/pedidos/${pedidoId}/iniciar-preparacion`);
  }

  enviarAlHorno(pedidoId: number): Observable<TableroCocinaResponse> {
    return this.api.post(`/cocina/pedidos/${pedidoId}/enviar-al-horno`);
  }

  marcarListo(pedidoId: number): Observable<TableroCocinaResponse> {
    return this.api.post(`/cocina/pedidos/${pedidoId}/marcar-listo`);
  }

  // ---- Despacho ----
  pedidosListos(): Observable<readonly PedidoListoResponse[]> {
    return this.api.get('/despacho/pedidos-listos');
  }

  motorizadosDisponibles(): Observable<readonly EmpleadoResponse[]> {
    return this.api.get('/despacho/motorizados');
  }

  asignarMotorizado(pedidoId: number, cuerpo: AsignarMotorizadoRequest): Observable<EntregaResponse> {
    return this.api.post(`/despacho/pedidos/${pedidoId}/asignar-motorizado`, cuerpo);
  }

  entregarEnMostrador(pedidoId: number): Observable<PedidoListoResponse> {
    return this.api.post(`/despacho/pedidos/${pedidoId}/entregar-en-mostrador`);
  }

  // ---- Reparto ----
  misEntregas(): Observable<readonly EntregaAsignadaResponse[]> {
    return this.api.get('/reparto/entregas');
  }

  iniciarRuta(entregaId: number): Observable<EntregaResponse> {
    return this.api.post(`/reparto/entregas/${entregaId}/iniciar-ruta`);
  }

  confirmarEntrega(entregaId: number, cuerpo: ConfirmarEntregaRequest): Observable<EntregaResponse> {
    return this.api.post(`/reparto/entregas/${entregaId}/confirmar`, cuerpo);
  }

  // ---- Notificaciones (cualquier rol con sesión) ----
  notificaciones(paginacion: PaginaParams = {}): Observable<PageResponse<NotificacionResponse>> {
    return this.api.get('/notificaciones', { params: paginacion });
  }

  contarNoLeidas(): Observable<ConteoResponse> {
    return this.api.get('/notificaciones/no-leidas/conteo');
  }

  marcarNotificacionLeida(id: number): Observable<void> {
    return this.api.patch(`/notificaciones/${id}/leida`, null);
  }

  marcarTodasLeidas(): Observable<void> {
    return this.api.patch('/notificaciones/leidas', null);
  }
}
