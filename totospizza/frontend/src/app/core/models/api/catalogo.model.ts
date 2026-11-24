import type { ColorPromocion, Instante, TipoIngrediente, TipoPromocion } from './enums.model';
import type { ConfiguracionPublicaResponse } from './configuracion.model';
import type { ResenaResponse } from './resena.model';

export interface CategoriaResponse {
  readonly id: number;
  readonly nombre: string;
  readonly slug: string;
  readonly orden: number;
  readonly activa: boolean;
}

export interface EtiquetaResponse {
  readonly id: number;
  readonly nombre: string;
  readonly slug: string;
  readonly esFiltro: boolean;
}

export interface MenuFiltrosResponse {
  readonly categorias: readonly CategoriaResponse[];
  readonly etiquetas: readonly EtiquetaResponse[];
  readonly tamanos: readonly TamanoPizzaResponse[];
}

export interface IngredienteResponse {
  readonly id: number;
  readonly nombre: string;
  readonly tipo: TipoIngrediente;
  readonly precioExtra: number;
  readonly disponible: boolean;
}

export interface TipoMasaResponse {
  readonly id: number;
  readonly nombre: string;
  readonly recargo: number;
  readonly activa: boolean;
}

export interface TamanoPizzaResponse {
  readonly id: number;
  readonly nombre: string;
  readonly diametroCm: number;
  readonly personasMin: number;
  readonly personasMax: number;
  readonly precioBase: number;
  readonly orden: number;
  readonly activo: boolean;
}

export interface PrecioTamanoResponse {
  readonly tamanoId: number;
  readonly tamanoNombre: string;
  readonly precio: number;
}

export interface ProductoResumenResponse {
  readonly id: number;
  readonly nombre: string;
  readonly slug: string;
  readonly descripcion: string;
  readonly imagenUrl: string | null;
  readonly precioDesde: number;
  readonly categoria: string;
  readonly disponible: boolean;
  readonly destacado: boolean;
  readonly calificacionPromedio: number | null;
  readonly totalResenas: number | null;
  readonly ingredientes?: string | null;
  readonly etiquetas: readonly EtiquetaResponse[];
}

export interface ProductoDetalleResponse {
  readonly id: number;
  readonly categoria: CategoriaResponse;
  readonly nombre: string;
  readonly slug: string;
  readonly descripcion: string;
  readonly imagenUrl: string | null;
  readonly precioBase: number;
  readonly requiereTamano: boolean;
  readonly disponible: boolean;
  readonly destacado: boolean;
  readonly calificacionPromedio: number | null;
  readonly totalResenas: number | null;
  readonly etiquetas: readonly EtiquetaResponse[];
  readonly precios: readonly PrecioTamanoResponse[];
  readonly tiposMasa: readonly TipoMasaResponse[];
  readonly adicionales: readonly IngredienteResponse[];
  /** Lo que lleva el producto (tabla producto_ingredientes). */
  readonly ingredientes: readonly IngredienteResponse[];
}

export interface PromocionItemResponse {
  readonly productoId: number;
  readonly productoNombre: string;
  readonly tamanoId: number | null;
  readonly tamanoNombre: string | null;
  readonly cantidad: number;
}

export interface PromocionResponse {
  readonly id: number;
  readonly titulo: string;
  readonly descripcion: string;
  readonly tipo: TipoPromocion;
  readonly etiqueta: string | null;
  readonly precioPromocional: number;
  readonly precioAnterior: number | null;
  readonly imagenUrl: string | null;
  readonly colorFondo: ColorPromocion;
  readonly condiciones: string | null;
  readonly vigenteHasta: Instante | null;
  readonly items: readonly PromocionItemResponse[];
}

/** Promoción vista por el administrador: suma costo estimado, vigencia completa, estado y orden. */
export interface PromocionAdminResponse {
  readonly id: number;
  readonly titulo: string;
  readonly descripcion: string | null;
  readonly tipo: TipoPromocion;
  readonly etiqueta: string | null;
  readonly precioPromocional: number;
  readonly precioAnterior: number | null;
  readonly costoEstimado: number | null;
  readonly imagenUrl: string | null;
  readonly colorFondo: ColorPromocion;
  readonly condiciones: string | null;
  readonly vigenteDesde: Instante;
  readonly vigenteHasta: Instante;
  readonly activa: boolean;
  readonly orden: number;
  readonly items: readonly PromocionItemResponse[];
}

export interface HomeResponse {
  readonly promociones: readonly PromocionResponse[];
  readonly destacados: readonly ProductoResumenResponse[];
  readonly resenas: readonly ResenaResponse[];
  readonly negocio: ConfiguracionPublicaResponse;
}

export interface FiltroMenu {
  readonly categoria?: string;
  readonly etiqueta?: string;
  readonly q?: string;
  readonly tamanoPizza?: number;
  readonly pagina?: number;
  readonly tamano?: number;
}

// ---- Administración del catálogo ----

export interface ProductoTamanoRequest {
  readonly tamanoId: number;
  readonly precio: number;
}

export interface ProductoRequest {
  readonly categoriaId: number;
  readonly nombre: string;
  readonly descripcion: string;
  readonly imagenUrl?: string | null;
  readonly precioBase: number;
  readonly requiereTamano: boolean;
  readonly disponible: boolean;
  readonly destacado: boolean;
  readonly etiquetaIds: readonly number[];
  readonly precios: readonly ProductoTamanoRequest[];
  readonly ingredienteIds: readonly number[];
}

export interface CategoriaRequest {
  readonly nombre: string;
  readonly orden: number;
  readonly activa: boolean;
}

export interface EtiquetaRequest {
  readonly nombre: string;
  readonly esFiltro: boolean;
}

export interface TamanoPizzaRequest {
  readonly nombre: string;
  readonly diametroCm: number;
  readonly personasMin: number;
  readonly personasMax: number;
  readonly precioBase: number;
  readonly orden: number;
  readonly activo: boolean;
}

export type CarpetaImagen = 'PRODUCTOS' | 'PROMOCIONES' | 'SUCURSALES' | 'NEGOCIO';

export interface ImagenResponse {
  readonly url: string;
}

export interface IngredienteRequest {
  readonly nombre: string;
  readonly tipo: TipoIngrediente;
  readonly precioExtra: number;
  readonly costoOperativoFijo?: number | null;
  readonly disponible: boolean;
}

export interface TipoMasaRequest {
  readonly nombre: string;
  readonly recargo: number;
  readonly activa: boolean;
}

export interface PromocionItemRequest {
  readonly productoId: number;
  readonly tamanoId?: number | null;
  readonly cantidad: number;
}

export interface PromocionRequest {
  readonly titulo: string;
  readonly descripcion: string;
  readonly tipo: TipoPromocion;
  readonly etiqueta?: string | null;
  readonly precioPromocional: number;
  readonly precioAnterior?: number | null;
  readonly costoEstimado?: number | null;
  readonly imagenUrl?: string | null;
  readonly colorFondo: ColorPromocion;
  readonly condiciones?: string | null;
  readonly vigenteDesde: Instante;
  readonly vigenteHasta: Instante;
  readonly activa: boolean;
  readonly orden?: number | null;
  readonly items: readonly PromocionItemRequest[];
}

export interface CambiarDisponibilidadRequest {
  readonly disponible: boolean;
}
