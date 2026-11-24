import type { EstadoPago, EstadoPedido, Instante, MetodoPago, TipoEntrega } from './enums.model';
import type { DireccionRequest, DireccionResponse } from './seguridad.model';

export interface AdicionalRequest {
  readonly ingredienteId: number;
  readonly cantidad: number;
}

export interface AgregarProductoRequest {
  readonly productoId?: number | null;
  readonly pizzaPersonalizadaId?: number | null;
  readonly promocionId?: number | null;
  readonly tamanoId?: number | null;
  readonly tipoMasaId?: number | null;
  readonly cantidad: number;
  readonly notas?: string | null;
  readonly adicionales?: readonly AdicionalRequest[];
}

export interface ActualizarItemCarritoRequest {
  readonly cantidad: number;
  readonly notas?: string | null;
}

export interface AdicionalResponse {
  readonly ingredienteId: number;
  readonly nombre: string;
  readonly cantidad: number;
  readonly precioUnitario: number;
}

export interface ItemCarritoResponse {
  readonly id: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly imagenUrl: string | null;
  readonly tamano: string | null;
  readonly tipoMasa: string | null;
  readonly cantidad: number;
  readonly precioUnitario: number;
  readonly subtotal: number;
  readonly notas: string | null;
  readonly adicionales: readonly AdicionalResponse[];
}

export interface ResumenMontosResponse {
  readonly subtotal: number;
  readonly costoDelivery: number;
  readonly descuento: number;
  readonly total: number;
  readonly envioGratisDesde: number | null;
  readonly faltanteEnvioGratis: number | null;
}

export interface CarritoResponse {
  readonly id: number;
  readonly items: readonly ItemCarritoResponse[];
  readonly totalItems: number;
  readonly montos: ResumenMontosResponse;
  readonly montosReferenciales: boolean;
  readonly avisoMontos: string | null;
}

export interface PagoRequest {
  readonly metodo: MetodoPago;
  readonly tokenTarjeta?: string | null;
  readonly telefonoBilletera?: string | null;
  readonly codigoAprobacion?: string | null;
}

export interface CheckoutRequest {
  readonly tipoEntrega: TipoEntrega;
  readonly sucursalId: number;
  readonly direccionEntrega?: DireccionRequest | null;
  readonly instrucciones?: string | null;
  readonly pago: PagoRequest;
}

export interface CheckoutResponse {
  readonly pedidoId: number;
  readonly numero: string;
  readonly estado: EstadoPedido;
  readonly estadoPago: EstadoPago;
  readonly total: number;
  readonly minutosEstimados: number | null;
}

export interface CancelarPedidoRequest {
  readonly motivo?: string | null;
}

export interface DetallePedidoResponse {
  readonly id: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly cantidad: number;
  readonly precioUnitario: number;
  readonly subtotal: number;
  readonly notas: string | null;
  readonly adicionales: readonly AdicionalResponse[];
  /** Nulo en pizzas personalizadas y promociones. Sirve para calificar el producto. */
  readonly productoId: number | null;
}

export interface HistorialEstadoResponse {
  readonly estado: EstadoPedido;
  readonly comentario: string | null;
  readonly fecha: Instante;
}

export interface PagoResponse {
  readonly id: number;
  readonly metodo: MetodoPago;
  readonly estado: EstadoPago;
  readonly monto: number;
  readonly marcaTarjeta: string | null;
  readonly ultimosDigitos: string | null;
  readonly pagadoEn: Instante | null;
  readonly montoReembolsado: number | null;
}

export interface PedidoResponse {
  readonly id: number;
  readonly numero: string;
  readonly sucursalNombre: string;
  readonly tipoEntrega: TipoEntrega;
  readonly estado: EstadoPedido;
  readonly direccionEntrega: DireccionResponse | null;
  readonly instrucciones: string | null;
  readonly detalles: readonly DetallePedidoResponse[];
  readonly montos: ResumenMontosResponse;
  readonly minutosEstimados: number | null;
  readonly creadoEn: Instante;
  readonly confirmadoEn: Instante | null;
  readonly entregadoEn: Instante | null;
  readonly vencimientoRecojo: Instante | null;
  readonly garantiaAplicada: boolean;
  readonly pago: PagoResponse | null;
  readonly historial: readonly HistorialEstadoResponse[];
  /** El cliente ya dejó su reseña de este pedido. */
  readonly resenado: boolean;
}

export interface PedidoResumenResponse {
  readonly id: number;
  readonly numero: string;
  readonly tipoEntrega: TipoEntrega;
  readonly estado: EstadoPedido;
  readonly total: number;
  readonly cantidadItems: number;
  readonly creadoEn: Instante;
  readonly nombreCliente: string;
  readonly telefonoCliente: string | null;
}

export interface EtapaSeguimientoResponse {
  readonly nombre: string;
  readonly completada: boolean;
  readonly actual: boolean;
  readonly fecha: Instante | null;
}

export interface SeguimientoResponse {
  readonly pedidoId: number;
  readonly numero: string;
  readonly estado: EstadoPedido;
  readonly etapas: readonly EtapaSeguimientoResponse[];
  readonly minutosRestantes: number | null;
  readonly entregaEstimada: Instante | null;
  readonly codigoEntrega: string | null;
  readonly nombreMotorizado: string | null;
  readonly garantiaAplicada: boolean;
}

export interface CambiarEstadoPedidoRequest {
  readonly estado: EstadoPedido;
  readonly comentario?: string | null;
}

export interface ReembolsoRequest {
  readonly monto: number;
  readonly motivo: string;
}

export interface FiltroPedidos {
  readonly sucursalId?: number;
  readonly estado?: EstadoPedido;
  readonly desde?: string;
  readonly hasta?: string;
  readonly q?: string;
  readonly pagina?: number;
  readonly tamano?: number;
}
