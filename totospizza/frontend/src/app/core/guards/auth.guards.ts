import { inject } from '@angular/core';
import { Router, type CanActivateFn, type UrlTree } from '@angular/router';
import type { Rol } from '../models/api';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export function roleGuard(...roles: readonly Rol[]): CanActivateFn {
  return (_route, state): boolean | UrlTree => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.estaAutenticado()) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
    if (auth.tieneRol(...roles)) return true;
    inject(ToastService).warning('Acceso denegado', 'No tienes permiso para ver esa página.');
    return router.createUrlTree([auth.rutaInicio()]);
  };
}

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado() ? router.createUrlTree([auth.rutaInicio()]) : true;
};
