import type { Instante } from './enums.model';

/** Respuesta de error uniforme del backend (dto.common.ApiError). */
export interface ApiError {
  readonly fecha: Instante;
  readonly estado: number;
  readonly codigo: string;
  readonly mensaje: string;
  readonly ruta: string;
  readonly errores: readonly CampoError[];
}

export interface CampoError {
  readonly campo: string;
  readonly mensaje: string;
}

export interface PageResponse<T> {
  readonly contenido: readonly T[];
  readonly pagina: number;
  readonly tamano: number;
  readonly totalElementos: number;
  readonly totalPaginas: number;
  readonly primera: boolean;
  readonly ultima: boolean;
}

export interface ConteoResponse {
  readonly total: number;
}

export interface MensajeResponse {
  readonly mensaje: string;
}

/** Parámetros de paginación comunes. */
export interface PaginaParams {
  readonly pagina?: number;
  readonly tamano?: number;
}
