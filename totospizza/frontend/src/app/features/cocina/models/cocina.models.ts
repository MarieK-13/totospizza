import type { EstadoPedido, TipoEntrega } from '../../../core/models/api';
import type { TonoOperacion } from '../../../shared/models/tono-operacion';

export type { TonoOperacion };

/** Etapas del tablero, en el orden en que avanza un pedido en cocina. */
export type EtapaCocina = 'nuevos' | 'preparando' | 'horno' | 'mostrador';

/** Semáforo del tiempo total de un pedido frente al objetivo de cocina. */
export type RitmoCocina = 'a-tiempo' | 'justo' | 'atrasado';

export interface LineaCocina {
  readonly cantidad: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly adicionales: readonly string[];
  readonly notas: string | null;
}

/** Ticket listo para dibujar: sale de TicketCocinaResponse, con los minutos calculados al momento. */
export interface TicketVista {
  readonly id: number;
  readonly numero: string;
  readonly estado: EstadoPedido;
  readonly tipoEntrega: TipoEntrega;
  readonly horaIngreso: string;
  /** Minutos desde que se confirmó el pago. */
  readonly minutosTotales: number;
  /** Minutos en la etapa actual (en el horno, esperando en mostrador…). */
  readonly minutosEnEtapa: number;
  readonly ritmo: RitmoCocina;
  readonly progreso: number;
  readonly lineas: readonly LineaCocina[];
  readonly totalUnidades: number;
  readonly instrucciones: string | null;
  readonly esNuevo: boolean;
}

export interface ColumnaCocina {
  readonly etapa: EtapaCocina;
  readonly tono: TonoOperacion;
  readonly titulo: string;
  readonly ayuda: string;
  readonly tickets: readonly TicketVista[];
}
