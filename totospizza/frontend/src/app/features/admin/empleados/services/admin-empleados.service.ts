import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AsignarHorarioRequest,
  CambiarEstadoEmpleadoRequest,
  EmpleadoRequest,
  EmpleadoResponse,
  EstadoEmpleado,
  PageResponse,
  ResumenEmpleadosResponse,
  Rol,
  SucursalBasica,
  TurnoResponse,
} from '../models/admin-empleados.models';

export interface FiltrosEmpleadosQuery {
  sucursalId?: number;
  rol?: Rol;
  estado?: EstadoEmpleado;
  texto?: string;
  pagina?: number;
  tamano?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminEmpleadosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/admin';

  listarEmpleados(filtros: FiltrosEmpleadosQuery = {}): Observable<PageResponse<EmpleadoResponse>> {
    let params = new HttpParams()
      .set('pagina', String(filtros.pagina ?? 0))
      .set('tamano', String(filtros.tamano ?? 5));

    if (filtros.sucursalId) params = params.set('sucursalId', String(filtros.sucursalId));
    if (filtros.rol) params = params.set('rol', filtros.rol);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.texto && filtros.texto.trim()) params = params.set('texto', filtros.texto.trim());

    return this.http.get<PageResponse<EmpleadoResponse>>(`${this.baseUrl}/empleados`, { params });
  }

  obtenerResumenEmpleados(sucursalId: number): Observable<ResumenEmpleadosResponse> {
    const params = new HttpParams().set('sucursalId', String(sucursalId));
    return this.http.get<ResumenEmpleadosResponse>(`${this.baseUrl}/empleados/resumen`, { params });
  }

  obtenerEmpleadoPorId(id: number): Observable<EmpleadoResponse> {
    return this.http.get<EmpleadoResponse>(`${this.baseUrl}/empleados/${id}`);
  }

  crearEmpleado(body: EmpleadoRequest): Observable<EmpleadoResponse> {
    return this.http.post<EmpleadoResponse>(`${this.baseUrl}/empleados`, body);
  }

  actualizarEmpleado(id: number, body: EmpleadoRequest): Observable<EmpleadoResponse> {
    return this.http.put<EmpleadoResponse>(`${this.baseUrl}/empleados/${id}`, body);
  }

  cambiarEstado(id: number, body: CambiarEstadoEmpleadoRequest): Observable<EmpleadoResponse> {
    return this.http.patch<EmpleadoResponse>(`${this.baseUrl}/empleados/${id}/estado`, body);
  }

  asignarHorario(id: number, body: AsignarHorarioRequest): Observable<TurnoResponse> {
    return this.http.post<TurnoResponse>(`${this.baseUrl}/empleados/${id}/turnos`, body);
  }

  obtenerTurnos(id: number, desde: string, hasta: string): Observable<TurnoResponse[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<TurnoResponse[]>(`${this.baseUrl}/empleados/${id}/turnos`, { params });
  }

  obtenerSucursales(): Observable<SucursalBasica[]> {
    return this.http.get<SucursalBasica[]>(`${this.baseUrl}/sucursales`);
  }
}