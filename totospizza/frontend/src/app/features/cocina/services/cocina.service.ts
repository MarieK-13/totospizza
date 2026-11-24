import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EtapaCocina, PedidoCocina } from '../models/cocina.models';

@Injectable({ providedIn: 'root' })
export class CocinaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/cocina/pedidos';

  obtenerPedidosCocina(): Observable<PedidoCocina[]> {
    return this.http.get<PedidoCocina[]>(this.baseUrl);
  }

  cambiarEtapaPedido(pedidoId: number, nuevaEtapa: EtapaCocina): Observable<PedidoCocina> {
    return this.http.patch<PedidoCocina>(`${this.baseUrl}/${pedidoId}/etapa`, { etapa: nuevaEtapa });
  }
}