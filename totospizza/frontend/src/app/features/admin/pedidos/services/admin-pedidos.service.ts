import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CambiarEstadoPedidoRequest,
  CancelarPedidoRequest,
  EstadoPedido,
  PageResponse,
  PagoResponse,
  PedidoResponse,
  PedidoResumenResponse,
  ReembolsoRequest,
} from '../models/admin-pedidos.models';

export interface FiltrosPedidosQuery {
  sucursalId?: number;
  estado?: EstadoPedido;
  desde?: string;
  hasta?: string;
  texto?: string;
  pagina?: number;
  tamano?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminPedidosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/admin/pedidos';

  listarPedidos(filtros: FiltrosPedidosQuery = {}): Observable<PageResponse<PedidoResumenResponse>> {
    let params = new HttpParams()
      .set('pagina', String(filtros.pagina ?? 0))
      .set('tamano', String(filtros.tamano ?? 6));

    if (filtros.sucursalId) params = params.set('sucursalId', String(filtros.sucursalId));
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.texto && filtros.texto.trim()) params = params.set('texto', filtros.texto.trim());

    return this.http.get<PageResponse<PedidoResumenResponse>>(this.baseUrl, { params });
  }

  obtenerDetallePedido(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.baseUrl}/${id}`);
  }

  cambiarEstado(id: number, body: CambiarEstadoPedidoRequest): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.baseUrl}/${id}/estado`, body);
  }

  cancelarPedido(id: number, body: CancelarPedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.baseUrl}/${id}/cancelar`, body);
  }

  reembolsarPedido(id: number, body: ReembolsoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.baseUrl}/${id}/reembolso`, body);
  }
}