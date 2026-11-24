import type { ApiError, CampoError } from '../models/api';

export class ApiException extends Error {
  constructor(readonly api: ApiError) {
    super(api.mensaje);
    this.name = 'ApiException';
  }

  get estado(): number {
    return this.api.estado;
  }

  get codigo(): string {
    return this.api.codigo;
  }

  get errores(): readonly CampoError[] {
    return this.api.errores;
  }
}

export function esApiException(error: unknown): error is ApiException {
  return error instanceof ApiException;
}

/** Mensaje legible para cualquier error que llegue a un componente. */
export function mensajeDeError(error: unknown, porDefecto = 'Ocurrió un error inesperado. Intenta de nuevo.'): string {
  return esApiException(error) ? error.message : porDefecto;
}
