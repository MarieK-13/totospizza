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
}

export interface TableroCocinaResponse {
  readonly porPreparar: readonly TicketCocinaResponse[];
  readonly enHorno: readonly TicketCocinaResponse[];
}

export interface PedidoListoResponse {
  readonly pedidoId: number;
  readonly numero: string;
  readonly tipoEntrega: TipoEntrega;
  readonly nombreCliente: string;
  readonly cantidadItems: number;
  readonly listoEn: Instante;
  readonly estadoEntrega: EstadoEntrega | null;
  readonly motorizadoNombre: string | null;
  readonly vencimientoRecojo: Instante | null;
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
  readonly motivo?: string | null;
}

export interface NotificacionResponse {
  readonly id: number;
  readonly tipo: TipoNotificacion;
  readonly titulo: string;
  readonly mensaje: string;
  readonly leida: boolean;
  readonly creadoEn: Instante;
}
