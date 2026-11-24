import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { PUBLIC_REQUEST, SKIP_ERROR_TOAST } from '../../interceptors/http-context';
import type {
  CambiarContrasenaRequest,
  LoginRequest,
  MensajeResponse,
  OlvidoContrasenaRequest,
  RefreshTokenRequest,
  RegistroRequest,
  RestablecerContrasenaRequest,
  TokenResponse,
} from '../../models/api';
import { ApiClient } from './api-client';

const PUBLICA = new HttpContext().set(PUBLIC_REQUEST, true);
/** Formularios que muestran el error en la propia pantalla: sin toast encima. */
const PUBLICA_SIN_TOAST = new HttpContext().set(PUBLIC_REQUEST, true).set(SKIP_ERROR_TOAST, true);

/** /api/v1/auth */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly api = inject(ApiClient);

  registro(cuerpo: RegistroRequest): Observable<TokenResponse> {
    return this.api.post('/auth/registro', cuerpo, { context: PUBLICA_SIN_TOAST });
  }

  login(cuerpo: LoginRequest): Observable<TokenResponse> {
    return this.api.post('/auth/login', cuerpo, { context: PUBLICA_SIN_TOAST });
  }

  refresh(cuerpo: RefreshTokenRequest): Observable<TokenResponse> {
    return this.api.post('/auth/refresh', cuerpo, { context: PUBLICA });
  }

  logout(): Observable<void> {
    return this.api.post('/auth/logout');
  }

  olvidoContrasena(cuerpo: OlvidoContrasenaRequest): Observable<MensajeResponse> {
    return this.api.post('/auth/olvido-contrasena', cuerpo, { context: PUBLICA_SIN_TOAST });
  }

  restablecerContrasena(cuerpo: RestablecerContrasenaRequest): Observable<MensajeResponse> {
    return this.api.post('/auth/restablecer-contrasena', cuerpo, { context: PUBLICA_SIN_TOAST });
  }

  cambiarContrasena(cuerpo: CambiarContrasenaRequest): Observable<void> {
    return this.api.post('/auth/cambiar-contrasena', cuerpo);
  }
}
