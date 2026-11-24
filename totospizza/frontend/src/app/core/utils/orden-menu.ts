import type { ProductoResumenResponse } from '../models/api';

export type OrdenMenu = 'recomendado' | 'precio-asc' | 'precio-desc' | 'nombre' | 'valorados';

export const OPCIONES_ORDEN: readonly { readonly valor: OrdenMenu; readonly etiqueta: string }[] = [
  { valor: 'recomendado', etiqueta: 'Recomendados' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'valorados', etiqueta: 'Mejor valorados' },
  { valor: 'nombre', etiqueta: 'Nombre (A-Z)' },
];

export function esOrdenMenu(valor: string | null): valor is OrdenMenu {
  return OPCIONES_ORDEN.some((o) => o.valor === valor);
}

const porNombre = (a: ProductoResumenResponse, b: ProductoResumenResponse): number =>
  a.nombre.localeCompare(b.nombre, 'es');

/**
 * El backend siempre devuelve el menú por nombre y no deja elegir el orden,
 * así que se ordena aquí. Es válido porque se pide el menú completo en una sola página.
 */
export function ordenarMenu(productos: readonly ProductoResumenResponse[], orden: OrdenMenu): readonly ProductoResumenResponse[] {
  const copia = [...productos];
  switch (orden) {
    case 'precio-asc':
      return copia.sort((a, b) => a.precioDesde - b.precioDesde || porNombre(a, b));
    case 'precio-desc':
      return copia.sort((a, b) => b.precioDesde - a.precioDesde || porNombre(a, b));
    case 'valorados':
      return copia.sort(
        (a, b) =>
          (b.calificacionPromedio ?? 0) - (a.calificacionPromedio ?? 0) ||
          (b.totalResenas ?? 0) - (a.totalResenas ?? 0) ||
          porNombre(a, b),
      );
    case 'nombre':
      return copia.sort(porNombre);
    case 'recomendado':
      return copia.sort((a, b) => Number(b.destacado) - Number(a.destacado) || porNombre(a, b));
  }
}
