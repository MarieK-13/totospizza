import type { EtiquetaResponse, TipoIngrediente, TipoPromocion, ColorPromocion, UnidadMedida, TipoMovimientoInventario } from '../../../core/models/api';

// Textos y clasificaciones del catálogo que comparten varias pantallas del panel.

export const TIPOS_INGREDIENTE: readonly TipoIngrediente[] = ['QUESO', 'SALSA', 'CARNE', 'OTRO'];

const TIPO_INGREDIENTE: Readonly<Record<TipoIngrediente, string>> = {
  QUESO: 'Queso',
  SALSA: 'Salsa',
  CARNE: 'Carne',
  OTRO: 'Otro',
};

export function etiquetaTipoIngrediente(tipo: TipoIngrediente): string {
  return TIPO_INGREDIENTE[tipo];
}

export type TipoEtiqueta = 'Alérgeno' | 'Libre de' | 'Rasgo';

/** Por convención los alérgenos empiezan con "Contiene …" y los libres de alérgeno con "Sin …". */
export function tipoDeEtiqueta(etiqueta: Pick<EtiquetaResponse, 'slug'>): TipoEtiqueta {
  if (etiqueta.slug.startsWith('contiene-')) return 'Alérgeno';
  if (etiqueta.slug.startsWith('sin-')) return 'Libre de';
  return 'Rasgo';
}

export function claseEtiqueta(etiqueta: Pick<EtiquetaResponse, 'slug'>): string {
  const tipo = tipoDeEtiqueta(etiqueta);
  return tipo === 'Alérgeno' ? 'crud-badge--off' : tipo === 'Libre de' ? 'crud-badge--ok' : 'crud-badge--info';
}

export const TIPOS_PROMOCION: Readonly<Record<TipoPromocion, string>> = {
  COMBO: 'Combo',
  DOS_POR_UNO: '2x1',
  DESCUENTO: 'Descuento',
  OFERTA_FLASH: 'Oferta flash',
};

export const COLORES_PROMOCION: Readonly<Record<ColorPromocion, string>> = {
  ROJO: 'Rojo',
  VERDE: 'Verde',
  BLANCO: 'Blanco',
};

export const UNIDADES: Readonly<Record<UnidadMedida, string>> = {
  KILOGRAMO: 'kg',
  GRAMO: 'g',
  LITRO: 'l',
  MILILITRO: 'ml',
  UNIDAD: 'unid.',
};

export const MOVIMIENTOS_INVENTARIO: Readonly<Record<TipoMovimientoInventario, string>> = {
  ENTRADA: 'Entrada (suma)',
  SALIDA: 'Salida (resta)',
  MERMA: 'Merma (resta)',
  AJUSTE: 'Ajuste (fija el stock)',
};
