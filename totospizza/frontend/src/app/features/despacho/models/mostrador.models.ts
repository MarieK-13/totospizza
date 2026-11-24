import type { EstadoEmpleado, TipoEntrega } from '../../../core/models/api';
import type { TonoOperacion } from '../../../shared/models/tono-operacion';

export type { TonoOperacion };

/** Columnas del mostrador, en el orden en que el despachador las atiende. */
export type EtapaMostrador = 'por-asignar' | 'asignados' | 'recojo' | 'en-camino';

export interface LineaMostrador {
  readonly cantidad: number;
  readonly nombre: string;
  readonly descripcion: string | null;
}

/** Pedido listo para dibujar: sale de PedidoListoResponse, con los minutos calculados al momento. */
export interface PedidoMostrador {
  readonly id: number;
  readonly numero: string;
  readonly etapa: EtapaMostrador;
  readonly tipoEntrega: TipoEntrega;
  readonly cliente: string;
  readonly telefono: string | null;
  readonly direccion: string | null;
  readonly referencia: string | null;
  readonly mapa: string | null;
  readonly distanciaKm: number | null;
  readonly instrucciones: string | null;
  readonly lineas: readonly LineaMostrador[];
  readonly totalUnidades: number;
  readonly horaListo: string;
  readonly minutosListo: number;
  readonly motorizado: string | null;
  readonly minutosAsignado: number | null;
  /** Solo recojo: minutos que quedan antes de marcarse "no recogido". */
  readonly minutosParaVencer: number | null;
  readonly horaVencimiento: string | null;
  readonly esNuevo: boolean;
  /** Delivery que el motorizado no pudo entregar: volvió al mostrador. */
  readonly fallida: boolean;
  readonly motivoFallo: string | null;
  readonly horaFallo: string | null;
  /** En camino con el PIN agotado: el motorizado no puede cerrar la entrega solo. */
  readonly pinBloqueado: boolean;
}

/** Acción del mostrador que pide un motivo antes de enviarse. */
export type AccionConMotivo = 'cancelar' | 'sin-pin';

export interface ColumnaMostrador {
  readonly etapa: EtapaMostrador;
  readonly tono: TonoOperacion;
  readonly titulo: string;
  readonly ayuda: string;
  readonly pedidos: readonly PedidoMostrador[];
}

/** Motorizado en el selector de asignación, con cuántas entregas lleva ahora mismo. */
export interface OpcionMotorizado {
  readonly id: number;
  readonly nombre: string;
  readonly iniciales: string;
  readonly telefono: string;
  readonly estado: EstadoEmpleado;
  readonly entregasEnCurso: number;
}
