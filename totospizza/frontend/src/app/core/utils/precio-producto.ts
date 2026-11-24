import type { ProductoDetalleResponse } from '../models/api';

export interface SeleccionProducto {
  readonly tamanoId: number | null;
  readonly tipoMasaId: number | null;
  readonly extras: Readonly<Record<number, number>>;
}

export function precioUnitario(producto: ProductoDetalleResponse, seleccion: SeleccionProducto): number | null {
  if (!producto.requiereTamano) return producto.precioBase;
  const tamano = producto.precios.find((p) => p.tamanoId === seleccion.tamanoId);
  const masa = producto.tiposMasa.find((m) => m.id === seleccion.tipoMasaId);
  if (!tamano || !masa) return null;

  const extras = producto.adicionales.reduce((suma, ing) => suma + ing.precioExtra * (seleccion.extras[ing.id] ?? 0), 0);
  return redondear(tamano.precio + masa.recargo + extras);
}

function redondear(monto: number): number {
  return Math.round(monto * 100) / 100;
}
