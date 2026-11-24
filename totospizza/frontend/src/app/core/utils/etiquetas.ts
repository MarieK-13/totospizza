import type { EtiquetaResponse } from '../models/api';


export interface EtiquetasSeparadas {
  readonly contiene: readonly EtiquetaResponse[];
  readonly libres: readonly EtiquetaResponse[];
  readonly otras: readonly EtiquetaResponse[];
}

export function separarEtiquetas(etiquetas: readonly EtiquetaResponse[]): EtiquetasSeparadas {
  return {
    contiene: etiquetas.filter((e) => e.slug.startsWith('contiene-')),
    libres: etiquetas.filter((e) => e.slug.startsWith('sin-')),
    otras: etiquetas.filter((e) => !e.slug.startsWith('contiene-') && !e.slug.startsWith('sin-')),
  };
}

export function nombreCorto(etiqueta: EtiquetaResponse): string {
  return etiqueta.nombre.replace(/^contiene\s+/i, '');
}
