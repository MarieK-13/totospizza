import type { TonoOperacion } from '../../../shared/models/tono-operacion';

/** Columnas del reparto, en el orden en que avanza una entrega. */
export type EtapaReparto = 'por-salir' | 'en-camino' | 'entregadas';

/** Semáforo frente a la hora prometida al cliente. */
export type RitmoReparto = 'a-tiempo' | 'justo' | 'atrasado';

export interface LineaReparto {
  readonly cantidad: number;
  readonly nombre: string;
  readonly descripcion: string | null;
}

/** Entrega activa (asignada o en camino) lista para dibujar; sale de EntregaAsignadaResponse. */
export interface EntregaReparto {
  readonly id: number;
  readonly numero: string;
  readonly etapa: Exclude<EtapaReparto, 'entregadas'>;
  readonly cliente: string;
  readonly primerNombre: string;
  readonly telefono: string;
  readonly direccion: string;
  readonly referencia: string | null;
  readonly mapa: string;
  readonly distanciaKm: number | null;
  readonly instrucciones: string | null;
  readonly lineas: readonly LineaReparto[];
  readonly totalUnidades: number;
  readonly horaAsignada: string;
  readonly minutosAsignada: number;
  readonly horaSalida: string | null;
  readonly minutosEnRuta: number | null;
  /** Hora límite que ve el cliente; null si el backend no la conoce. */
  readonly horaPrometida: string | null;
  /** Minutos que faltan para la hora prometida (negativo si ya pasó). */
  readonly minutosParaPromesa: number | null;
  /** "quedan 12 min" o "atrasado 3 min". */
  readonly textoPromesa: string | null;
  /** Avance de 0 a 100 entre la salida y la hora prometida. */
  readonly progreso: number;
  readonly ritmo: RitmoReparto;
  readonly intentosRestantes: number;
  readonly esNueva: boolean;
}

/** Entrega completada hoy; sale de EntregaRealizadaResponse. */
export interface EntregaRealizada {
  readonly id: number;
  readonly numero: string;
  readonly cliente: string;
  readonly distrito: string | null;
  readonly distanciaKm: number | null;
  readonly horaEntregada: string;
  readonly minutosEnRuta: number | null;
  readonly aTiempo: boolean;
}

export interface ColumnaReparto {
  readonly etapa: EtapaReparto;
  readonly tono: TonoOperacion;
  readonly titulo: string;
  readonly ayuda: string;
  readonly total: number;
}
