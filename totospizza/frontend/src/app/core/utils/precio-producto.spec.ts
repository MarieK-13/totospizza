import type { ProductoDetalleResponse } from '../models/api';
import { precioUnitario } from './precio-producto';

const pizza = {
  requiereTamano: true,
  precioBase: 32,
  precios: [{ tamanoId: 1, tamanoNombre: 'Mediana', precio: 32 }],
  tiposMasa: [{ id: 7, nombre: 'Borde de queso', recargo: 6 }],
  adicionales: [{ id: 3, nombre: 'Tocino', tipo: 'CARNE', precioExtra: 5, disponible: true }],
} as unknown as ProductoDetalleResponse;

describe('precioUnitario', () => {
  it('devuelve null si falta tamaño o masa', () => {
    expect(precioUnitario(pizza, { tamanoId: null, tipoMasaId: 7, extras: {} })).toBeNull();
    expect(precioUnitario(pizza, { tamanoId: 1, tipoMasaId: null, extras: {} })).toBeNull();
  });

  it('suma tamaño, recargo de masa y adicionales', () => {
    expect(precioUnitario(pizza, { tamanoId: 1, tipoMasaId: 7, extras: { 3: 2 } })).toBe(48);
  });

  it('usa el precio base si no requiere tamaño', () => {
    const bebida = { ...pizza, requiereTamano: false, precioBase: 9 } as ProductoDetalleResponse;
    expect(precioUnitario(bebida, { tamanoId: null, tipoMasaId: null, extras: {} })).toBe(9);
  });
});
