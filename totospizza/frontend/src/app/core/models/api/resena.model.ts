import type { Instante } from './enums.model';

export interface CalificacionProductoRequest {
  readonly productoId: number;
  readonly estrellas: number;
}

export interface ResenaRequest {
  readonly pedidoId: number;
  readonly calificacion: number;
  readonly comentario?: string | null;
  readonly calificaciones?: readonly CalificacionProductoRequest[];
}

export interface CalificacionProductoResponse {
  readonly productoId: number;
  readonly productoNombre: string;
  readonly estrellas: number;
}

export interface ResenaResponse {
  readonly id: number;
  readonly autor: string;
  readonly calificacion: number;
  readonly comentario: string | null;
  readonly creadoEn: Instante;
  readonly destacada: boolean;
  readonly visible: boolean;
  readonly calificaciones: readonly CalificacionProductoResponse[];
}

export interface ResumenCalificacionResponse {
  readonly promedio: number;
  readonly total: number;
}
