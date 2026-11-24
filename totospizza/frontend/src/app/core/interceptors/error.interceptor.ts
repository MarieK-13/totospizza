import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import type { ApiError } from '../models/api';
import { ToastService } from '../services/toast.service';
import { ApiException } from '../utils/api-exception';
import { SKIP_ERROR_TOAST } from './http-context';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);

      const api = normalizar(error);
      const esDeCampos = api.errores.length > 0;
      if (!req.context.get(SKIP_ERROR_TOAST) && !esDeCampos && api.estado !== 401) {
        toast.error(tituloPorEstado(api.estado), api.mensaje);
      }
      return throwError(() => new ApiException(api));
    }),
  );
};

function normalizar(error: HttpErrorResponse): ApiError {
  const cuerpo = error.error as Partial<ApiError> | null;
  if (cuerpo && typeof cuerpo === 'object' && typeof cuerpo.mensaje === 'string') {
    return {
      fecha: cuerpo.fecha ?? new Date().toISOString(),
      estado: cuerpo.estado ?? error.status,
      codigo: cuerpo.codigo ?? 'ERROR',
      mensaje: cuerpo.mensaje,
      ruta: cuerpo.ruta ?? error.url ?? '',
      errores: cuerpo.errores ?? [],
    };
  }
  const sinConexion = error.status === 0;
  return {
    fecha: new Date().toISOString(),
    estado: error.status,
    codigo: sinConexion ? 'SIN_CONEXION' : 'ERROR_DESCONOCIDO',
    mensaje: sinConexion
      ? 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.'
      : 'Ocurrió un error inesperado. Intenta de nuevo.',
    ruta: error.url ?? '',
    errores: [],
  };
}

function tituloPorEstado(estado: number): string {
  switch (estado) {
    case 0:
      return 'Sin conexión';
    case 403:
      return 'Acceso denegado';
    case 404:
      return 'No encontrado';
    case 409:
      return 'Conflicto';
    default:
      return estado >= 500 ? 'Error del servidor' : 'No se pudo completar';
  }
}
