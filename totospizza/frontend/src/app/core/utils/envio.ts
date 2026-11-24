import type { Entrega } from '../services/entrega.service';

export const ENVIO_GRATIS_DESDE_DEFECTO = 49;
export const COSTO_DELIVERY_BASE_DEFECTO = 5;


export function calcularEnvio(
  entrega: Entrega | null,
  subtotal: number,
  envioGratisDesde: number = ENVIO_GRATIS_DESDE_DEFECTO,
  costoBase: number = COSTO_DELIVERY_BASE_DEFECTO,
): number | null {
  if (!entrega) return null;
  if (entrega.tipo === 'RECOJO' || subtotal >= envioGratisDesde) return 0;
  return entrega.costoEnvio ?? costoBase;
}

export function redondear(monto: number): number {
  return Math.round(monto * 100) / 100;
}
