import type { IngredienteResponse, TamanoPizzaResponse, TipoMasaResponse } from './catalogo.model';

export type PasoPersonalizacion = 'TAMANO_MASA' | 'QUESO' | 'SALSA' | 'INGREDIENTES' | 'RESUMEN';

export interface PizzaPersonalizadaRequest {
  readonly nombre?: string | null;
  readonly tamanoId: number;
  readonly tipoMasaId: number;
  readonly quesoIds: readonly number[];
  readonly salsaIds?: readonly number[];
  readonly ingredienteIds?: readonly number[];
}

export interface PasoOpcionesResponse {
  readonly numero: number;
  readonly etiqueta: string;
  readonly maxSelecciones: number;
  readonly opciones: readonly IngredienteResponse[];
}

export interface OpcionesPersonalizacionResponse {
  readonly tamanos: readonly TamanoPizzaResponse[];
  readonly tiposMasa: readonly TipoMasaResponse[];
  readonly pasos: readonly PasoOpcionesResponse[];
}

export interface CotizacionPizzaResponse {
  readonly precioTamano: number;
  readonly recargoMasa: number;
  readonly totalIngredientes: number;
  readonly total: number;
}

export interface IngredienteSeleccionadoResponse {
  readonly ingredienteId: number;
  readonly nombre: string;
  readonly paso: PasoPersonalizacion;
  readonly precioAplicado: number;
}

export interface PizzaPersonalizadaResponse {
  readonly id: number;
  readonly nombre: string;
  readonly tamano: TamanoPizzaResponse;
  readonly tipoMasa: TipoMasaResponse;
  readonly ingredientes: readonly IngredienteSeleccionadoResponse[];
  readonly precioTotal: number;
}
