import type { ProductoResumenResponse } from '../models/api';

const RESPALDOS: readonly (readonly [RegExp, string])[] = [
  [/pepperoni/i, 'images/pepperoni.jpg'],
  [/margherita|margarita/i, 'images/margherita.jpg'],
  [/diavola/i, 'images/diavola.jpg'],
  [/carn[ií]vora/i, 'images/carnivora.jpg'],
  [/prosciutto/i, 'images/prosciutto.jpg'],
  [/portobello|champi/i, 'images/portobello.jpg'],
  [/andina/i, 'images/andina.jpg'],
  [/burrata/i, 'images/burrata.jpg'],
  [/ternera/i, 'images/ternera.jpg'],
  [/vegetariana|verde|veggie/i, 'images/verde.jpg'],
  [/coca|gaseosa/i, 'images/cocacola.jpg'],
];

export function imagenDeProducto(producto: Pick<ProductoResumenResponse, 'nombre' | 'imagenUrl'>): string | null {
  if (producto.imagenUrl) return producto.imagenUrl;
  return RESPALDOS.find(([patron]) => patron.test(producto.nombre))?.[1] ?? null;
}
