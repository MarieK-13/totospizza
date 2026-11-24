import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoListoMostrador } from '../models/mostrador.models';

@Injectable({ providedIn: 'root' })
export class MostradorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/mostrador/pedidos';

  obtenerPedidosListos(): Observable<PedidoListoMostrador[]> {
    return this.http.get<PedidoListoMostrador[]>(this.baseUrl);
  }

  confirmarDespachoOEntrega(pedidoId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${pedidoId}/confirmar`, {});
  }

  cancelarPedido(pedidoId: number, motivo: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${pedidoId}/cancelar`, { motivo });
  }
}