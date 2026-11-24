import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CambiarContrasenaRequest,
  ConfiguracionCompletaDTO,
} from '../models/admin-configuracion.models';

@Injectable({ providedIn: 'root' })
export class AdminConfiguracionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/admin/configuracion';
  private readonly authUrl = 'http://localhost:8080/api/v1/auth';

  obtenerConfiguracion(): Observable<ConfiguracionCompletaDTO> {
    return this.http.get<ConfiguracionCompletaDTO>(this.baseUrl);
  }

  guardarConfiguracion(body: ConfiguracionCompletaDTO): Observable<ConfiguracionCompletaDTO> {
    return this.http.put<ConfiguracionCompletaDTO>(this.baseUrl, body);
  }

  cambiarContrasena(body: CambiarContrasenaRequest): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.authUrl}/cambiar-contrasena`, body);
  }

  cerrarSesionRemota(sesionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sesiones/${sesionId}`);
  }
}