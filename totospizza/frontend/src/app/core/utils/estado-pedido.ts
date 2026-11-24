import type { EstadoPedido, MetodoPago } from '../models/api';

export type TonoEstado = 'pendiente' | 'curso' | 'listo' | 'entregado' | 'cancelado';

interface InfoEstado {
  readonly etiqueta: string;
  readonly tono: TonoEstado;
}

const ESTADOS: Readonly<Record<EstadoPedido, InfoEstado>> = {
  PENDIENTE_PAGO: { etiqueta: 'Pendiente de pago', tono: 'pendiente' },
  CONFIRMADO: { etiqueta: 'Confirmado', tono: 'curso' },
  EN_PREPARACION: { etiqueta: 'En preparación', tono: 'curso' },
  EN_HORNO: { etiqueta: 'En el horno', tono: 'curso' },
  LISTO: { etiqueta: 'Listo', tono: 'listo' },
  EN_CAMINO: { etiqueta: 'En camino', tono: 'listo' },
  ENTREGADO: { etiqueta: 'Entregado', tono: 'entregado' },
  CANCELADO: { etiqueta: 'Cancelado', tono: 'cancelado' },
  NO_RECOGIDO: { etiqueta: 'No recogido', tono: 'cancelado' },
};

export function infoEstado(estado: EstadoPedido): InfoEstado {
  return ESTADOS[estado];
}

export function pedidoEnCurso(estado: EstadoPedido): boolean {
  return ['PENDIENTE_PAGO', 'CONFIRMADO', 'EN_PREPARACION', 'EN_HORNO', 'LISTO', 'EN_CAMINO'].includes(estado);
}

export function pedidoCancelable(estado: EstadoPedido): boolean {
  return estado === 'PENDIENTE_PAGO' || estado === 'CONFIRMADO';
}

export const NOMBRE_METODO_PAGO: Readonly<Record<MetodoPago, string>> = {
  TARJETA: 'Tarjeta de crédito o débito',
  YAPE: 'Yape',
  PLIN: 'Plin',
  CMR: 'CMR',
};
