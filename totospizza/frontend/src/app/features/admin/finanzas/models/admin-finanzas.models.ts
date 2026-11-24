export interface VentasDiariasResponse {
  fecha: string; // LocalDate YYYY-MM-DD
  total: number;
  pedidos: number;
}

export interface ProductoVendidoResponse {
  nombre: string;
  cantidad: number;
  ingresos: number;
}

export interface RankingProductosResponse {
  masVendidos: ProductoVendidoResponse[];
  menosVendidos: ProductoVendidoResponse[];
}

export type EstadoPagoMotorizado = 'PENDIENTE' | 'PAGADO';

export interface PagoMotorizadoResponse {
  id: number;
  empleadoId: number;
  motorizadoNombre: string;
  periodoDesde: string;
  periodoHasta: string;
  totalEntregas: number;
  montoBase: number;
  montoBonos: number;
  montoTotal: number;
  estado: EstadoPagoMotorizado;
  pagadoEn: string | null;
}

export interface FinanzasResponse {
  desde: string;
  hasta: string;
  ingresos: number;
  egresos: number;
  ganancia: number;
  deudaMotorizados: number;
  ventasDiarias: VentasDiariasResponse[];
  ranking: RankingProductosResponse;
  pagosMotorizados: PagoMotorizadoResponse[];
}

export interface ResumenAdminResponse {
  gananciaSemanal: number;
  gananciaMensual: number;
  gananciaAnual: number;
  ventasHoy: number;
  pedidosHoy: number;
  deudaMotorizados: number;
  alertasStockBajo: number;
  pedidosPorEstado: { estado: string; cantidad: number }[];
}

export type TipoMovimientoFinanciero =
  | 'VENTA'
  | 'DELIVERY'
  | 'COMPRA_INSUMOS'
  | 'PAGO_EMPLEADOS'
  | 'OTROS_GASTOS';

export interface MovimientoFinancieroUI {
  id: string;
  fechaHora: string;
  tipo: TipoMovimientoFinanciero;
  esIngreso: boolean;
  descripcion: string;
  metodoPago: string;
  ingreso: number | null;
  gasto: number | null;
  total: number;
}

export interface ApiError {
  fecha: string;
  estado: number;
  codigo: string;
  mensaje: string;
  ruta: string;
  errores: { campo: string; mensaje: string }[];
}