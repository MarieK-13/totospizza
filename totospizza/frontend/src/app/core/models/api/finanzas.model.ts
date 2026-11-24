import type {
  EstadoPagoPersonal,
  EstadoPedido,
  Fecha,
  Instante,
  MetodoPago,
  TipoMovimientoFinanciero,
} from './enums.model';

export interface PedidosPorEstadoResponse {
  readonly estado: EstadoPedido;
  readonly cantidad: number;
}

export interface ResumenAdminResponse {
  readonly gananciaSemanal: number;
  readonly gananciaMensual: number;
  readonly gananciaAnual: number;
  readonly ventasHoy: number;
  readonly pedidosHoy: number;
  readonly deudaMotorizados: number;
  readonly alertasStockBajo: number;
  readonly pedidosPorEstado: readonly PedidosPorEstadoResponse[];
}

export interface VentaDiariaResponse {
  readonly fecha: Fecha;
  readonly total: number;
  readonly pedidos: number;
}

export interface VentaPorMetodoPagoResponse {
  readonly metodo: MetodoPago;
  readonly total: number;
  readonly transacciones: number;
}

export interface ProductoVendidoResponse {
  readonly nombre: string;
  readonly cantidad: number;
  readonly ingresos: number;
}

export interface RankingProductosResponse {
  readonly masVendidos: readonly ProductoVendidoResponse[];
  readonly menosVendidos: readonly ProductoVendidoResponse[];
}

export interface PagoMotorizadoResponse {
  readonly id: number;
  readonly empleadoId: number;
  readonly motorizadoNombre: string;
  readonly periodoDesde: Fecha;
  readonly periodoHasta: Fecha;
  readonly totalEntregas: number;
  readonly montoBase: number;
  readonly montoBonos: number;
  readonly montoTotal: number;
  readonly estado: EstadoPagoPersonal;
  readonly pagadoEn: Instante | null;
}

export interface FinanzasResponse {
  readonly desde: Fecha;
  readonly hasta: Fecha;
  readonly ingresos: number;
  readonly egresos: number;
  readonly ganancia: number;
  readonly deudaMotorizados: number;
  readonly ventasDiarias: readonly VentaDiariaResponse[];
  readonly ventasPorMetodo: readonly VentaPorMetodoPagoResponse[];
  readonly ranking: RankingProductosResponse;
  readonly pagosMotorizados: readonly PagoMotorizadoResponse[];
}

export interface MovimientoFinancieroRequest {
  readonly sucursalId: number;
  readonly tipo: TipoMovimientoFinanciero;
  readonly concepto: string;
  readonly monto: number;
  readonly ocurridoEn?: Instante | null;
}

export interface MovimientoFinancieroResponse {
  readonly id: number;
  readonly tipo: TipoMovimientoFinanciero;
  readonly concepto: string;
  readonly monto: number;
  readonly ocurridoEn: Instante;
  readonly numeroPedido: string | null;
}

export interface RegistrarPagoMotorizadoRequest {
  readonly empleadoId: number;
  readonly periodoDesde: Fecha;
  readonly periodoHasta: Fecha;
}

export interface FiltroFinanzas {
  readonly sucursalId?: number;
  readonly desde?: string;
  readonly hasta?: string;
}
