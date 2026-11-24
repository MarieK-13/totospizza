import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  AsignarMotorizadoRequest,
  ConfirmarEntregaRequest,
  ConteoResponse,
  EmpleadoResponse,
  EntregaAsignadaResponse,
  EntregaResponse,
  MotivoRequest,
  NotificacionResponse,
  PaginaParams,
  PageResponse,
  PedidoListoResponse,
  ResumenDespachoResponse,
  ResumenRepartoResponse,
  TableroCocinaResponse,
} from '../../models/api';
import { ApiClient, type OpcionesPeticion } from './api-client';

@Injectable({ providedIn: 'root' })
export class OperacionApi {
  private readonly api = inject(ApiClient);

  // ---- Cocina ----
  tableroCocina(opciones?: OpcionesPeticion): Observable<TableroCocinaResponse> {
    return this.api.get('/cocina/tablero', opciones);
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
  pedidosListos(opciones?: OpcionesPeticion): Observable<readonly PedidoListoResponse[]> {
    return this.api.get('/despacho/pedidos-listos', opciones);
  }

  resumenDespacho(opciones?: OpcionesPeticion): Observable<ResumenDespachoResponse> {
    return this.api.get('/despacho/resumen', opciones);
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

  desbloquearPin(pedidoId: number): Observable<PedidoListoResponse> {
    return this.api.post(`/despacho/pedidos/${pedidoId}/desbloquear-pin`);
  }

  confirmarSinPin(pedidoId: number, cuerpo: MotivoRequest): Observable<PedidoListoResponse> {
    return this.api.post(`/despacho/pedidos/${pedidoId}/confirmar-sin-pin`, cuerpo);
  }

  /** Cancela y reembolsa un delivery que el motorizado no pudo entregar. */
  cancelarEntregaFallida(pedidoId: number, cuerpo: MotivoRequest): Observable<PedidoListoResponse> {
    return this.api.post(`/despacho/pedidos/${pedidoId}/cancelar`, cuerpo);
  }

  // ---- Reparto ----
  misEntregas(opciones?: OpcionesPeticion): Observable<readonly EntregaAsignadaResponse[]> {
    return this.api.get('/reparto/entregas', opciones);
  }

  resumenReparto(opciones?: OpcionesPeticion): Observable<ResumenRepartoResponse> {
    return this.api.get('/reparto/resumen', opciones);
  }

  iniciarRuta(entregaId: number): Observable<EntregaResponse> {
    return this.api.post(`/reparto/entregas/${entregaId}/iniciar-ruta`);
  }

  reportarNoEntregada(entregaId: number, cuerpo: MotivoRequest, opciones?: OpcionesPeticion): Observable<EntregaResponse> {
    return this.api.post(`/reparto/entregas/${entregaId}/no-entregada`, cuerpo, opciones);
  }

  confirmarEntrega(entregaId: number, cuerpo: ConfirmarEntregaRequest, opciones?: OpcionesPeticion): Observable<EntregaResponse> {
    return this.api.post(`/reparto/entregas/${entregaId}/confirmar`, cuerpo, opciones);
  }

  // ---- Notificaciones (cualquier rol con sesión) ----
  notificaciones(paginacion: PaginaParams = {}): Observable<PageResponse<NotificacionResponse>> {
    return this.api.get('/notificaciones', { params: paginacion });
  }

  contarNoLeidas(opciones?: OpcionesPeticion): Observable<ConteoResponse> {
    return this.api.get('/notificaciones/no-leidas/conteo', opciones);
  }

  marcarNotificacionLeida(id: number): Observable<void> {
    return this.api.patch(`/notificaciones/${id}/leida`, null);
  }

  marcarTodasLeidas(): Observable<void> {
    return this.api.patch('/notificaciones/leidas', null);
  }
}
