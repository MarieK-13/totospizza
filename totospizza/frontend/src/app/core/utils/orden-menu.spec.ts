import type { ProductoResumenResponse } from '../models/api';
import { ordenarMenu } from './orden-menu';

const p = (nombre: string, precioDesde: number, destacado = false, calificacionPromedio = 0, totalResenas = 0) =>
  ({ nombre, precioDesde, destacado, calificacionPromedio, totalResenas }) as ProductoResumenResponse;

describe('ordenarMenu', () => {
  const lista = [p('Salsa', 2.5), p('Pepperoni', 32, true, 4.8, 12), p('Gaseosa', 9)];
  const nombres = (orden: Parameters<typeof ordenarMenu>[1]) => ordenarMenu(lista, orden).map((x) => x.nombre);

  it('recomendado: destacados primero', () => expect(nombres('recomendado')[0]).toBe('Pepperoni'));
  it('precio ascendente', () => expect(nombres('precio-asc')).toEqual(['Salsa', 'Gaseosa', 'Pepperoni']));
  it('precio descendente', () => expect(nombres('precio-desc')).toEqual(['Pepperoni', 'Gaseosa', 'Salsa']));
  it('mejor valorados primero', () => expect(nombres('valorados')[0]).toBe('Pepperoni'));
  it('no modifica la lista original', () => {
    nombres('precio-desc');
    expect(lista[0].nombre).toBe('Salsa');
  });
});
