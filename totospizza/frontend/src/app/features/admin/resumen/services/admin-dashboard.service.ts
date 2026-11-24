import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ConteoResponse,
  EmpleadoResponse,
  FinanzasResponse,
  NotificacionResponse,
  PageResponse,
  PagoMotorizadoResponse,
  RegistrarPagoMotorizadoRequest,
  ResumenAdminResponse,
  SucursalResponse,
} from '../models/admin-dashboard.models';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  obtenerSucursales(): Observable<SucursalResponse[]> {
    return this.http.get<SucursalResponse[]>(`${this.baseUrl}/admin/sucursales`);
  }

  obtenerResumen(sucursalId?: number): Observable<ResumenAdminResponse> {
    let params = new HttpParams();
    if (sucursalId) params = params.set('sucursalId', sucursalId);
    return this.http.get<ResumenAdminResponse>(`${this.baseUrl}/admin/finanzas/resumen`, { params });
  }

  obtenerReporteFinanzas(
    desde: string,
    hasta: string,
    sucursalId?: number
  ): Observable<FinanzasResponse> {
    let params = new HttpParams().set('desde', desde).set('hasta', hasta);
    if (sucursalId) params = params.set('sucursalId', sucursalId);
    return this.http.get<FinanzasResponse>(`${this.baseUrl}/admin/finanzas/reporte`, { params });
  }

  obtenerMotorizados(sucursalId?: number): Observable<PageResponse<EmpleadoResponse>> {
    let params = new HttpParams().set('rol', 'MOTORIZADO').set('tamano', '100');
    if (sucursalId) params = params.set('sucursalId', sucursalId);
    return this.http.get<PageResponse<EmpleadoResponse>>(`${this.baseUrl}/admin/empleados`, { params });
  }

  liquidarPagoMotorizado(body: RegistrarPagoMotorizadoRequest): Observable<PagoMotorizadoResponse> {
    return this.http.post<PagoMotorizadoResponse>(
      `${this.baseUrl}/admin/finanzas/pagos-motorizado`,
      body
    );
  }

  marcarPagoMotorizadoPagado(pagoId: number): Observable<PagoMotorizadoResponse> {
    return this.http.post<PagoMotorizadoResponse>(
      `${this.baseUrl}/admin/finanzas/pagos-motorizado/${pagoId}/pagar`,
      {}
    );
  }

  obtenerConteoNotificaciones(): Observable<ConteoResponse> {
    return this.http.get<ConteoResponse>(`${this.baseUrl}/notificaciones/no-leidas/conteo`);
  }

  obtenerNotificaciones(): Observable<PageResponse<NotificacionResponse>> {
    return this.http.get<PageResponse<NotificacionResponse>>(
      `${this.baseUrl}/notificaciones?pagina=0&tamano=10`
    );
  }

  marcarNotificacionLeida(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/notificaciones/${id}/leida`, {});
  }
}