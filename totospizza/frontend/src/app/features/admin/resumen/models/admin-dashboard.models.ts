export type Rol = 'ADMINISTRADOR' | 'CLIENTE' | 'PIZZERO' | 'DESPACHADOR' | 'MOTORIZADO';

export type EstadoEmpleado = 'ACTIVO' | 'EN_TURNO' | 'DISPONIBLE' | 'INACTIVO' | 'CON_LICENCIA';

export type EstadoPagoPersonal = 'PENDIENTE' | 'PAGADO';

export type EstadoPedido =
  | 'PENDIENTE_PAGO'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'EN_HORNO'
  | 'LISTO'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'NO_RECOGIDO';

export interface PageResponse<T> {
  contenido: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
}

export interface ConteoResponse {
  total: number;
}

export interface PedidosPorEstadoResponse {
  estado: EstadoPedido;
  cantidad: number;
}

export interface ResumenAdminResponse {
  gananciaSemanal: number;
  gananciaMensual: number;
  gananciaAnual: number;
  ventasHoy: number;
  pedidosHoy: number;
  deudaMotorizados: number;
  alertasStockBajo: number;
  pedidosPorEstado: PedidosPorEstadoResponse[];
}

export interface VentaDiariaResponse {
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
  estado: EstadoPagoPersonal;
  pagadoEn: string | null;
}

export interface RegistrarPagoMotorizadoRequest {
  empleadoId: number;
  periodoDesde: string;
  periodoHasta: string;
}

export interface FinanzasResponse {
  desde: string;
  hasta: string;
  ingresos: number;
  egresos: number;
  ganancia: number;
  deudaMotorizados: number;
  ventasDiarias: VentaDiariaResponse[];
  ranking: RankingProductosResponse;
  pagosMotorizados: PagoMotorizadoResponse[];
}

export interface EmpleadoResponse {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  rol: Rol;
  sucursalId: number;
  sucursalNombre: string;
  estado: EstadoEmpleado;
  horaInicio: string;
  horaFin: string;
  fechaIngreso: string;
  pagoBaseTurno: number;
  bonoPorEntrega: number;
}

export interface HorarioSucursalResponse {
  diaSemana: string;
  horaApertura: string;
  horaCierre: string;
  cerrado: boolean;
}

export interface SucursalResponse {
  id: number;
  nombre: string;
  telefono: string;
  activa: boolean;
  abiertoAhora: boolean;
  horarios: HorarioSucursalResponse[];
}

export interface NotificacionResponse {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
}

export interface ApiError {
  fecha: string;
  estado: number;
  codigo: string;
  mensaje: string;
  ruta: string;
  errores: { campo: string; mensaje: string }[];
}