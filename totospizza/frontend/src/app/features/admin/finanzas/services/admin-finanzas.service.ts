import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinanzasResponse, ResumenAdminResponse } from '../models/admin-finanzas.models';

@Injectable({ providedIn: 'root' })
export class AdminFinanzasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/admin';

  obtenerFinanzas(desde: string, hasta: string, sucursalId?: number): Observable<FinanzasResponse> {
    let params = new HttpParams().set('desde', desde).set('hasta', hasta);
    if (sucursalId) {
      params = params.set('sucursalId', String(sucursalId));
    }
    return this.http.get<FinanzasResponse>(`${this.baseUrl}/finanzas`, { params });
  }

  obtenerResumen(sucursalId?: number): Observable<ResumenAdminResponse> {
    let params = new HttpParams();
    if (sucursalId) {
      params = params.set('sucursalId', String(sucursalId));
    }
    return this.http.get<ResumenAdminResponse>(`${this.baseUrl}/resumen`, { params });
  }
}