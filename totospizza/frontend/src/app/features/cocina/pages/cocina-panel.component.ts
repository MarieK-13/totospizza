import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  Bike,
  ChefHat,
  Clock,
  CookingPot,
  Flame,
  LucideAngularModule,
  MessageSquareWarning,
  PackageCheck,
  RefreshCw,
  Store,
  Timer,
  type LucideIconData,
} from 'lucide-angular';
import { peticionSilenciosa } from '../../../core/interceptors/http-context';
import type { TableroCocinaResponse, TicketCocinaResponse } from '../../../core/models/api';
import { OperacionApi } from '../../../core/services/api/operacion.api';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { formatearHora } from '../../../core/utils/fechas';
import { saludo } from '../../../core/utils/roles';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import type { ColumnaCocina, EtapaCocina, RitmoCocina, TicketVista, TonoOperacion } from '../models/cocina.models';

const REFRESCO_MS = 15_000;
const RELOJ_MS = 20_000;
/** Cuánto tiempo se resalta un pedido que acaba de llegar. */
const RESALTE_NUEVO_MS = 60_000;

type Accion = 'iniciar' | 'horno' | 'listo';

interface AccionEtapa {
  readonly accion: Accion;
  readonly texto: string;
  readonly icono: LucideIconData;
  readonly tono: TonoOperacion;
}

/** Botón principal de cada etapa: lo que el pizzero hace para avanzar el pedido. */
const ACCION_POR_ETAPA: Readonly<Partial<Record<EtapaCocina, AccionEtapa>>> = {
  nuevos: { accion: 'iniciar', texto: 'Empezar a preparar', icono: CookingPot, tono: 'amarillo' },
  preparando: { accion: 'horno', texto: 'Meter al horno', icono: Flame, tono: 'rojo' },
  horno: { accion: 'listo', texto: 'Marcar listo', icono: PackageCheck, tono: 'verde' },
};

const ICONO_POR_ETAPA: Readonly<Record<EtapaCocina, LucideIconData>> = {
  nuevos: ChefHat,
  preparando: CookingPot,
  horno: Flame,
  mostrador: PackageCheck,
};

/**
 * Pantalla del pizzero. Todo sale del backend (GET /cocina/tablero, refrescado cada 15 s):
 * nuevos → preparando → en el horno → en el mostrador. Los tiempos se calculan con las horas
 * reales de cada cambio de estado y el objetivo es el parámetro minutos_preparacion.
 */
@Component({
  selector: 'app-cocina-panel',
  imports: [LucideAngularModule, EstadoVacio],
  templateUrl: './cocina-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CocinaPanelComponent {
  private readonly api = inject(OperacionApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  private readonly tablero = signal<TableroCocinaResponse | null>(null);
  private readonly ahora = signal(Date.now());
  /** Primera vez que este tablero vio cada pedido, para resaltar los que recién llegan. */
  private readonly vistosEn = new Map<number, number>();
  private primeraCarga = true;

  protected readonly saludo = `${saludo()}, ${this.auth.nombreCorto() || 'equipo'}`;
  protected readonly cargando = signal(true);
  protected readonly sinConexion = signal(false);
  protected readonly actualizadoEn = signal<Date | null>(null);
  protected readonly ocupado = signal<number | null>(null);
  /** El servidor responde sin los datos nuevos del tablero: está corriendo una versión anterior del backend. */
  protected readonly backendDesactualizado = signal(false);

  protected readonly minutosObjetivo = computed(() => this.tablero()?.minutosObjetivo ?? 0);
  protected readonly preparadosHoy = computed(() => this.tablero()?.preparadosHoy ?? 0);

  protected readonly columnas = computed<readonly ColumnaCocina[]>(() => {
    const t = this.tablero();
    const porPreparar = t?.porPreparar ?? [];
    return [
      {
        etapa: 'nuevos',
        tono: 'amarillo',
        titulo: 'Nuevos',
        ayuda: 'Pagados, por orden de llegada',
        tickets: porPreparar.filter((p) => p.estado === 'CONFIRMADO').map((p) => this.aVista(p)),
      },
      {
        etapa: 'preparando',
        tono: 'beige',
        titulo: 'Preparando',
        ayuda: 'Armando la pizza',
        tickets: porPreparar.filter((p) => p.estado === 'EN_PREPARACION').map((p) => this.aVista(p)),
      },
      { etapa: 'horno', tono: 'rojo', titulo: 'En el horno', ayuda: 'Tiempo desde que entró', tickets: (t?.enHorno ?? []).map((p) => this.aVista(p)) },
      {
        etapa: 'mostrador',
        tono: 'verde',
        titulo: 'En el mostrador',
        ayuda: 'Listos, esperando al despachador',
        tickets: (t?.listos ?? []).map((p) => this.aVista(p)),
      },
    ];
  });

  protected readonly enCocina = computed(() =>
    this.columnas()
      .filter((c) => c.etapa !== 'mostrador')
      .reduce((total, c) => total + c.tickets.length, 0),
  );
  protected readonly atrasados = computed(() =>
    this.columnas()
      .filter((c) => c.etapa !== 'mostrador')
      .flatMap((c) => c.tickets)
      .filter((t) => t.ritmo === 'atrasado').length,
  );
  protected readonly textoActualizado = computed(() => {
    const fecha = this.actualizadoEn();
    if (!fecha) return 'Conectando con la cocina…';
    const segundos = Math.max(0, Math.round((this.ahora() - fecha.getTime()) / 1000));
    return segundos < 30 ? 'Actualizado hace un momento' : `Actualizado a las ${formatearHora(fecha.toISOString())}`;
  });

  protected readonly accionDe = (etapa: EtapaCocina) => ACCION_POR_ETAPA[etapa] ?? null;
  protected readonly iconoDe = (etapa: EtapaCocina) => ICONO_POR_ETAPA[etapa];
  protected readonly Icons = { Bike, Clock, Flame, MessageSquareWarning, RefreshCw, Store, Timer, ChefHat, PackageCheck };

  constructor() {
    this.cargar(false);
    const refresco = setInterval(() => !document.hidden && this.cargar(true), REFRESCO_MS);
    const reloj = setInterval(() => this.ahora.set(Date.now()), RELOJ_MS);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(refresco);
      clearInterval(reloj);
    });
  }

  protected avanzar(ticket: TicketVista, etapa: EtapaCocina): void {
    const accion = ACCION_POR_ETAPA[etapa];
    if (!accion || this.ocupado() !== null) return;
    this.ocupado.set(ticket.id);
    const peticion =
      accion.accion === 'iniciar'
        ? this.api.iniciarPreparacion(ticket.id)
        : accion.accion === 'horno'
          ? this.api.enviarAlHorno(ticket.id)
          : this.api.marcarListo(ticket.id);
    peticion.pipe(finalize(() => this.ocupado.set(null))).subscribe({
      next: (tablero) => {
        this.aplicar(tablero);
        const mensajes: Record<Accion, string> = {
          iniciar: 'empezó a prepararse',
          horno: 'entró al horno',
          listo: 'pasó al mostrador',
        };
        this.toast.success(`#${ticket.numero}`, `El pedido ${mensajes[accion.accion]}.`);
      },
      // El interceptor ya mostró el motivo; recargamos para ver el estado real.
      error: () => this.cargar(true),
    });
  }

  /** Mover un pedido nuevo directo al horno (el flujo del backend lo permite). */
  protected directoAlHorno(ticket: TicketVista): void {
    this.avanzar(ticket, 'preparando');
  }

  protected reintentar(): void {
    this.cargar(false);
  }

  private cargar(silencioso: boolean): void {
    this.api
      .tableroCocina(silencioso ? { context: peticionSilenciosa() } : undefined)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (tablero) => this.aplicar(tablero),
        error: () => this.sinConexion.set(true),
      });
  }

  private aplicar(respuesta: TableroCocinaResponse): void {
    const tablero = normalizar(respuesta);
    this.backendDesactualizado.set(!('listos' in respuesta) || !('minutosObjetivo' in respuesta));
    const ahora = Date.now();
    const nuevos = tablero.porPreparar.filter((p) => p.estado === 'CONFIRMADO' && !this.vistosEn.has(p.pedidoId));
    for (const p of [...tablero.porPreparar, ...tablero.enHorno, ...tablero.listos]) {
      if (!this.vistosEn.has(p.pedidoId)) this.vistosEn.set(p.pedidoId, this.primeraCarga ? 0 : ahora);
    }
    if (!this.primeraCarga && nuevos.length) {
      this.toast.info(
        nuevos.length === 1 ? `Nuevo pedido #${nuevos[0].numero}` : `${nuevos.length} pedidos nuevos`,
        'Ya están pagados y listos para preparar.',
      );
    }
    this.primeraCarga = false;
    this.tablero.set(tablero);
    this.sinConexion.set(false);
    this.actualizadoEn.set(new Date(ahora));
    this.ahora.set(ahora);
  }

  private aVista(t: TicketCocinaResponse): TicketVista {
    const ahora = this.ahora();
    const objetivo = this.tablero()?.minutosObjetivo || 0;
    const minutosTotales = minutosDesde(t.confirmadoEn, ahora);
    const proporcion = objetivo > 0 ? minutosTotales / objetivo : 0;
    const ritmo: RitmoCocina = proporcion >= 1 ? 'atrasado' : proporcion >= 0.75 ? 'justo' : 'a-tiempo';
    const visto = this.vistosEn.get(t.pedidoId) ?? 0;
    return {
      id: t.pedidoId,
      numero: t.numero,
      estado: t.estado,
      tipoEntrega: t.tipoEntrega,
      horaIngreso: formatearHora(t.confirmadoEn),
      minutosTotales,
      minutosEnEtapa: t.estadoDesde ? minutosDesde(t.estadoDesde, ahora) : (t.minutosEnEstado ?? 0),
      ritmo: t.estado === 'LISTO' ? 'a-tiempo' : ritmo,
      progreso: Math.min(100, Math.round(proporcion * 100)),
      lineas: t.items.map((i) => ({
        cantidad: i.cantidad,
        nombre: i.nombre,
        descripcion: i.descripcion,
        adicionales: i.adicionales,
        notas: i.notas,
      })),
      totalUnidades: t.items.reduce((total, i) => total + i.cantidad, 0),
      instrucciones: t.instrucciones,
      esNuevo: visto > 0 && ahora - visto < RESALTE_NUEVO_MS,
    };
  }
}

/** Tolera un backend sin las listas nuevas (por ejemplo, antes de recompilarlo): nunca rompe el tablero. */
function normalizar(t: Partial<TableroCocinaResponse>): TableroCocinaResponse {
  return {
    porPreparar: t.porPreparar ?? [],
    enHorno: t.enHorno ?? [],
    listos: t.listos ?? [],
    preparadosHoy: t.preparadosHoy ?? 0,
    minutosObjetivo: t.minutosObjetivo ?? 0,
  };
}

function minutosDesde(iso: string, ahora: number): number {
  return Math.max(0, Math.floor((ahora - new Date(iso).getTime()) / 60_000));
}
