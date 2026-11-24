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

export type TipoEntrega = 'DELIVERY' | 'RECOJO';

export type MetodoPago = 'TARJETA' | 'YAPE' | 'PLIN' | 'CMR';

export type EstadoPago = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'REEMBOLSADO';

export interface PageResponse<T> {
  contenido: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
}

export interface PedidoResumenResponse {
  id: number;
  numero: string;
  tipoEntrega: TipoEntrega;
  estado: EstadoPedido;
  total: number;
  cantidadItems: number;
  creadoEn: string; // Instant ISO8601
}

export interface AdicionalResponse {
  ingredienteId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface DetallePedidoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas: string | null;
  adicionales: AdicionalResponse[];
}

export interface DireccionResponse {
  direccion: string;
  referencia: string | null;
  distrito: string;
  latitud: number;
  longitud: number;
}

export interface ResumenMontosResponse {
  subtotal: number;
  costoDelivery: number;
  descuento: number;
  total: number;
  envioGratisDesde: number;
  faltanteEnvioGratis: number;
}

export interface PagoResponse {
  id: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  monto: number;
  marcaTarjeta: string | null;
  ultimosDigitos: string | null;
  pagadoEn: string | null;
  montoReembolsado: number | null;
}

export interface HistorialEstadoResponse {
  estado: EstadoPedido;
  comentario: string | null;
  fecha: string; // Instant ISO8601
}

export interface PedidoResponse {
  id: number;
  numero: string;
  sucursalNombre: string;
  tipoEntrega: TipoEntrega;
  estado: EstadoPedido;
  direccionEntrega: DireccionResponse | null;
  instrucciones: string | null;
  detalles: DetallePedidoResponse[];
  montos: ResumenMontosResponse;
  minutosEstimados: number;
  creadoEn: string;
  confirmadoEn: string | null;
  entregadoEn: string | null;
  vencimientoRecojo: string | null;
  garantiaAplicada: boolean;
  pago: PagoResponse | null;
  historial: HistorialEstadoResponse[];
}

export interface CambiarEstadoPedidoRequest {
  estado: EstadoPedido;
  comentario?: string;
}

export interface CancelarPedidoRequest {
  motivo: string;
}

export interface ReembolsoRequest {
  monto: number;
  motivo: string;
}

export interface ApiError {
  fecha: string;
  estado: number;
  codigo: string;
  mensaje: string;
  ruta: string;
  errores: { campo: string; mensaje: string }[];
}