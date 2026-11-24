import type { EtiquetaResponse } from '../models/api';
import { nombreCorto, separarEtiquetas } from './etiquetas';

const etiqueta = (slug: string, nombre: string): EtiquetaResponse => ({ id: 1, slug, nombre, esFiltro: false });

describe('separarEtiquetas', () => {
  const todas = [
    etiqueta('contiene-gluten', 'Contiene Gluten'),
    etiqueta('sin-lacteos', 'Sin Lácteos'),
    etiqueta('picante', 'Picante'),
  ];

  it('separa alérgenos, ausencias y otras', () => {
    const r = separarEtiquetas(todas);
    expect(r.contiene.map((e) => e.slug)).toEqual(['contiene-gluten']);
    expect(r.libres.map((e) => e.slug)).toEqual(['sin-lacteos']);
    expect(r.otras.map((e) => e.slug)).toEqual(['picante']);
  });

  it('acorta "Contiene Gluten" a "Gluten"', () => expect(nombreCorto(todas[0])).toBe('Gluten'));
});
