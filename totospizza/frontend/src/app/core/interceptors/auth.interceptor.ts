import { HttpErrorResponse, type HttpHandlerFn, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { PUBLIC_REQUEST } from './http-context';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(API_URL);
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const esNuestraApi = req.url.startsWith(apiUrl);
  if (!esNuestraApi || req.context.get(PUBLIC_REQUEST)) return next(req);

  const cerrarSesion = (): void => {
    auth.limpiar();
    toast.info('Tu sesión expiró', 'Inicia sesión para continuar.');
    void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
  };

  return next(conToken(req, auth.accessToken)).pipe(
    catchError((error: unknown) => {
      const noAutorizado = error instanceof HttpErrorResponse && error.status === 401;
      if (!noAutorizado || !auth.estaAutenticado()) return throwError(() => error);
      return renovarYReintentar(req, next, auth, cerrarSesion);
    }),
  );
};

function renovarYReintentar(req: HttpRequest<unknown>, next: HttpHandlerFn, auth: AuthService, cerrarSesion: () => void) {
  return auth.renovar().pipe(
    switchMap((token) => next(conToken(req, token.accessToken))),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && auth.estaAutenticado()) cerrarSesion();
      return throwError(() => error);
    }),
  );
}

function conToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}
