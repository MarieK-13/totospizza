import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntregaAsignada } from '../models/reparto.models';

@Injectable({ providedIn: 'root' })
export class RepartoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/reparto/entregas';

  obtenerMisEntregas(): Observable<EntregaAsignada[]> {
    return this.http.get<EntregaAsignada[]>(this.baseUrl);
  }

  iniciarReparto(entregaId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${entregaId}/salir`, {});
  }

  marcarEntregado(entregaId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${entregaId}/entregado`, {});
  }

  cancelarEntrega(entregaId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${entregaId}/cancelado`, {});
  }
}