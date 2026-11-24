import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import type { LoginRequest, RegistroRequest, Rol, TokenResponse, UsuarioResponse } from '../models/api';
import type { Sesion } from '../models/sesion.model';
import { AuthApi } from './api/auth.api';
import { TokenStorage } from './token-storage.service';

/** Pantalla de inicio de cada rol después de iniciar sesión. */
export const RUTA_INICIO_POR_ROL: Readonly<Record<Rol, string>> = {
  ADMINISTRADOR: '/admin/resumen',
  CLIENTE: '/',
  PIZZERO: '/cocina',
  DESPACHADOR: '/despacho',
  MOTORIZADO: '/reparto',
};

/**
 * Estado de sesión de toda la aplicación (signals).
 * Se restaura al arrancar con `restaurarSesion()` y se renueva sola cuando el token vence.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly storage = inject(TokenStorage);
  private readonly router = inject(Router);

  private readonly sesion = signal<Sesion | null>(null);
  private renovacion$: Observable<TokenResponse> | null = null;

  readonly usuario = computed<UsuarioResponse | null>(() => this.sesion()?.usuario ?? null);
  readonly estaAutenticado = computed(() => this.sesion() !== null);
  readonly rol = computed<Rol | null>(() => this.usuario()?.rol ?? null);
  readonly nombreCorto = computed(() => this.usuario()?.nombres.split(' ')[0] ?? '');
  readonly esCliente = computed(() => this.rol() === 'CLIENTE');

  get accessToken(): string | null {
    return this.sesion()?.accessToken ?? null;
  }

  /** Se llama una vez al arrancar la app (APP_INITIALIZER). */
  restaurarSesion(): void {
    this.sesion.set(this.storage.leer());
  }

  login(cuerpo: LoginRequest, recordar = false): Observable<UsuarioResponse> {
    return this.api.login(cuerpo).pipe(
      tap((token) => this.guardar(token, recordar)),
      map((token) => token.usuario),
    );
  }

  registrar(cuerpo: RegistroRequest): Observable<UsuarioResponse> {
    return this.api.registro(cuerpo).pipe(
      tap((token) => this.guardar(token, false)),
      map((token) => token.usuario),
    );
  }

  /**
   * Renueva los tokens. Si varias peticiones fallan a la vez por 401,
   * todas comparten una sola renovación (evita invalidar el refresh token con llamadas repetidas).
   */
  renovar(): Observable<TokenResponse> {
    const actual = this.sesion();
    if (!actual) return throwError(() => new Error('No hay sesión para renovar'));
    this.renovacion$ ??= this.api.refresh({ refreshToken: actual.refreshToken }).pipe(
      tap((token) => this.guardar(token)),
      finalize(() => (this.renovacion$ = null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.renovacion$;
  }

  /** Cierra la sesión en el servidor (si se puede) y siempre en el navegador. */
  logout(redirigirA: string | null = '/'): Observable<void> {
    const llamada = this.sesion() ? this.api.logout().pipe(catchError(() => of(void 0))) : of(void 0);
    return llamada.pipe(
      switchMap(() => {
        this.limpiar();
        return redirigirA === null ? of(void 0) : this.navegar(redirigirA);
      }),
    );
  }

  /** Borra la sesión local sin llamar al servidor (token inválido o ya vencido). */
  limpiar(): void {
    this.storage.borrar();
    this.sesion.set(null);
    this.renovacion$ = null;
  }

  /** Refleja en la sesión los datos que el cliente cambió en su perfil (el header muestra el nombre). */
  actualizarUsuario(cambios: Partial<Pick<UsuarioResponse, 'nombres' | 'apellidos' | 'telefono' | 'avatarUrl'>>): void {
    const actual = this.sesion();
    if (!actual) return;
    const sesion: Sesion = { ...actual, usuario: { ...actual.usuario, ...cambios } };
    this.storage.guardar(sesion);
    this.sesion.set(sesion);
  }

  tieneRol(...roles: readonly Rol[]): boolean {
    const rol = this.rol();
    return rol !== null && roles.includes(rol);
  }

  rutaInicio(): string {
    const rol = this.rol();
    return rol ? RUTA_INICIO_POR_ROL[rol] : '/';
  }

  private guardar(token: TokenResponse, recordar?: boolean): void {
    const sesion: Sesion = { accessToken: token.accessToken, refreshToken: token.refreshToken, usuario: token.usuario };
    this.storage.guardar(sesion, recordar);
    this.sesion.set(sesion);
  }

  private navegar(url: string): Observable<void> {
    return new Observable<void>((suscriptor) => {
      void this.router.navigateByUrl(url).then(() => {
        suscriptor.next();
        suscriptor.complete();
      });
    });
  }
}
