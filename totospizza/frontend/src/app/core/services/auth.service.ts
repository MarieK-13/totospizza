import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import type { LoginRequest, RegistroRequest, Rol, TokenResponse, UsuarioResponse } from '../models/api';
import type { Sesion } from '../models/sesion.model';
import { AuthApi } from './api/auth.api';
import { TokenStorage } from './token-storage.service';

export const RUTA_INICIO_POR_ROL: Readonly<Record<Rol, string>> = {
  ADMINISTRADOR: '/admin/resumen',
  CLIENTE: '/',
  PIZZERO: '/cocina',
  DESPACHADOR: '/despacho',
  MOTORIZADO: '/reparto',
};

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

  logout(redirigirA: string | null = '/'): Observable<void> {
    const llamada = this.sesion() ? this.api.logout().pipe(catchError(() => of(void 0))) : of(void 0);
    return llamada.pipe(
      switchMap(() => {
        this.limpiar();
        return redirigirA === null ? of(void 0) : this.navegar(redirigirA);
      }),
    );
  }

  limpiar(): void {
    this.storage.borrar();
    this.sesion.set(null);
    this.renovacion$ = null;
  }

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
