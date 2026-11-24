import type {
  CanalInventario,
  EstadoEntrega,
  EstadoPedido,
  Instante,
  TipoEntrega,
  TipoMovimientoInventario,
  TipoNotificacion,
  UnidadMedida,
} from './enums.model';
import type { DireccionResponse } from './seguridad.model';

export interface ItemCocinaResponse {
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly cantidad: number;
  readonly notas: string | null;
  readonly adicionales: readonly string[];
}

export interface TicketCocinaResponse {
  readonly pedidoId: number;
  readonly numero: string;
  readonly estado: EstadoPedido;
  readonly tipoEntrega: TipoEntrega;
  readonly confirmadoEn: Instante;
  readonly minutosTranscurridos: number;
  readonly instrucciones: string | null;
  readonly items: readonly ItemCocinaResponse[];
  /** Cuándo entró a su estado actual (por ejemplo, cuándo se metió al horno). */
  readonly estadoDesde: Instante | null;
  readonly minutosEnEstado: number | null;
  readonly listoEn: Instante | null;
}

export interface TableroCocinaResponse {
  /** Confirmados (nuevos) y en preparación. */
  readonly porPreparar: readonly TicketCocinaResponse[];
  readonly enHorno: readonly TicketCocinaResponse[];
  /** Listos esperando en el mostrador, los más recientes primero. */
  readonly listos: readonly TicketCocinaResponse[];
  readonly preparadosHoy: number;
  /** Minutos de cocina por pedido (parámetro minutos_preparacion). */
  readonly minutosObjetivo: number;
}

export interface PedidoListoResponse {
  readonly pedidoId: number;
  readonly numero: string;
  readonly tipoEntrega: TipoEntrega;
  readonly nombreCliente: string;
  readonly telefonoCliente: string | null;
  readonly direccion: DireccionResponse | null;
  readonly instrucciones: string | null;
  readonly cantidadItems: number;
  readonly items: readonly ItemCocinaResponse[];
  readonly listoEn: Instante;
  readonly estadoEntrega: EstadoEntrega | null;
  readonly motorizadoNombre: string | null;
  readonly vencimientoRecojo: Instante | null;
  /** LISTO (espera en el mostrador) o EN_CAMINO (ya salió con el motorizado). */
  readonly estado: EstadoPedido;
  readonly distanciaKm: number | null;
  readonly asignadaEn: Instante | null;
  /** Intentos de PIN que le quedan al motorizado; 0 = bloqueado. Nulo en recojo. */
  readonly intentosRestantesPin: number | null;
  /** Por qué no se pudo entregar (solo si la entrega quedó FALLIDA). */
  readonly motivoFallo: string | null;
  readonly fallidaEn: Instante | null;
}

/** Motivo que el personal deja en el historial del pedido. */
export interface MotivoRequest {
  readonly motivo: string;
}

/** Indicadores del mostrador. */
export interface ResumenDespachoResponse {
  readonly enCocina: number;
  readonly entregadosHoy: number;
  readonly motorizadosDisponibles: number;
}

export interface AsignarMotorizadoRequest {
  readonly motorizadoId: number;
}

export interface EntregaResponse {
  readonly id: number;
  readonly pedidoId: number;
  readonly numeroPedido: string;
  readonly estado: EstadoEntrega;
  readonly motorizadoNombre: string | null;
  readonly asignadaEn: Instante | null;
  readonly recogidaEn: Instante | null;
  readonly entregadaEn: Instante | null;
  readonly distanciaKm: number | null;
}

export interface EntregaAsignadaResponse {
  readonly entregaId: number;
  readonly pedidoId: number;
  readonly numeroPedido: string;
  readonly nombreCliente: string;
  readonly telefonoCliente: string;
  readonly direccion: DireccionResponse;
  readonly instrucciones: string | null;
  readonly estado: EstadoEntrega;
  readonly distanciaKm: number | null;
  readonly asignadaEn: Instante;
  readonly items: readonly ItemCocinaResponse[];
  readonly recogidaEn: Instante | null;
  /** Confirmación del pago + minutos estimados: la hora que ve el cliente en su cuenta regresiva. */
  readonly horaPrometida: Instante | null;
  readonly intentosRestantes: number;
}

export interface EntregaRealizadaResponse {
  readonly entregaId: number;
  readonly numeroPedido: string;
  readonly nombreCliente: string;
  readonly distrito: string | null;
  readonly distanciaKm: number | null;
  readonly recogidaEn: Instante | null;
  readonly entregadaEn: Instante;
  readonly minutosEnRuta: number | null;
  /** Falso si se aplicó la garantía por demora. */
  readonly aTiempo: boolean;
}

export interface ResumenRepartoResponse {
  readonly entregadasHoy: number;
  readonly kmHoy: number;
  readonly bonoPorEntrega: number | null;
  readonly bonosHoy: number;
  readonly minutosPromedioRuta: number | null;
  readonly entregadasHoyDetalle: readonly EntregaRealizadaResponse[];
}

export interface ConfirmarEntregaRequest {
  readonly codigoPin: string;
}

export interface InventarioIngredienteResponse {
  readonly id: number;
  readonly ingredienteId: number;
  readonly ingredienteNombre: string;
  readonly canal: CanalInventario;
  readonly stockActual: number;
  readonly stockMinimo: number;
  readonly unidad: UnidadMedida;
  readonly stockBajo: boolean;
}

export interface AjusteInventarioRequest {
  readonly tipo: TipoMovimientoInventario;
  readonly cantidad: number;
  readonly motivo: string;
}

export interface NotificacionResponse {
  readonly id: number;
  readonly tipo: TipoNotificacion;
  readonly titulo: string;
  readonly mensaje: string;
  readonly leida: boolean;
  readonly creadoEn: Instante;
}
