import type { EtiquetaResponse } from '../models/api';

/**
 * El backend maneja los alérgenos como etiquetas con slug "contiene-*" y "sin-*"
 * (ej. contiene-gluten, sin-lacteos). El resto son insignias o dietas (vegetariana, picante).
 */
export interface EtiquetasSeparadas {
  /** Alérgenos presentes: "Contiene Gluten". */
  readonly contiene: readonly EtiquetaResponse[];
  /** Garantías de ausencia: "Sin Lácteos". */
  readonly libres: readonly EtiquetaResponse[];
  /** Vegetariana, Picante, Popular... */
  readonly otras: readonly EtiquetaResponse[];
}

export function separarEtiquetas(etiquetas: readonly EtiquetaResponse[]): EtiquetasSeparadas {
  return {
    contiene: etiquetas.filter((e) => e.slug.startsWith('contiene-')),
    libres: etiquetas.filter((e) => e.slug.startsWith('sin-')),
    otras: etiquetas.filter((e) => !e.slug.startsWith('contiene-') && !e.slug.startsWith('sin-')),
  };
}

/** "Contiene Gluten" → "Gluten" (para listas compactas bajo un ícono de aviso). */
export function nombreCorto(etiqueta: EtiquetaResponse): string {
  return etiqueta.nombre.replace(/^contiene\s+/i, '');
}
