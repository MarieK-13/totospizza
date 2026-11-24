import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Bike, CalendarDays, CalendarRange, ChartColumn, LucideAngularModule, Pizza, TrendingUp, TriangleAlert, Wallet } from 'lucide-angular';
import { catchError, finalize } from 'rxjs/operators';
import type {
  EmpleadoResponse,
  FinanzasResponse,
  PagoMotorizadoResponse,
  ResumenAdminResponse,
  SucursalResponse,
} from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { diaSemana, fechaISO } from '../../../../core/utils/fechas';
import { saludo } from '../../../../core/utils/roles';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelKpi } from '../../../../shared/components/panel-kpi/panel-kpi';
import { PanelModal } from '../../../../shared/components/panel-modal/panel-modal';

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const EN_CURSO = new Set(['CONFIRMADO', 'EN_PREPARACION', 'EN_HORNO', 'LISTO', 'EN_CAMINO']);

interface BarraDia {
  readonly diaCorto: string;
  readonly diaCompleto: string;
  readonly numeroDia: string;
  readonly pedidos: number;
  readonly total: number;
  readonly porcentajeAltura: number;
}

interface PagoMotorizadoFila extends PagoMotorizadoResponse {
  readonly sucursalNombre: string;
}

/** Variación porcentual redondeada a un decimal; null si no hay base para comparar. */
function variacion(actual: number, anterior: number): number | null {
  return anterior > 0 ? Math.round(((actual - anterior) / anterior) * 1000) / 10 : null;
}

@Component({
  selector: 'app-admin-resumen',
  imports: [DecimalPipe, RouterLink, LucideAngularModule, PanelAccionesDirective, EstadoVacio, PanelKpi, PanelModal],
  templateUrl: './admin-resumen.component.html',
  styleUrls: ['./admin-resumen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminResumenComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly Iconos = {
    Grafico: ChartColumn,
    Pizza,
    Moto: Bike,
    Semana: CalendarDays,
    Mes: CalendarRange,
    Anio: TrendingUp,
    Deuda: Wallet,
    Alerta: TriangleAlert,
  };

  protected readonly saludo = `${saludo()}, ${this.auth.usuario()?.nombres.split(' ')[0] ?? ''}`;

  protected readonly sucursales = signal<readonly SucursalResponse[]>([]);
  protected readonly sucursalId = signal<number | undefined>(undefined);

  protected readonly cargando = signal(true);
  protected readonly resumen = signal<ResumenAdminResponse | null>(null);
  protected readonly finanzasHoy = signal<FinanzasResponse | null>(null);
  /** Últimos 14 días: los 7 primeros sirven de base para comparar con la semana actual. */
  protected readonly finanzas14 = signal<FinanzasResponse | null>(null);
  protected readonly motorizados = signal<readonly EmpleadoResponse[]>([]);
  protected readonly actualizadoEn = signal<Date | null>(null);

  protected readonly barraSeleccionadaIdx = signal(6);
  protected readonly menuFilaAbiertoId = signal<number | null>(null);

  // Modal de liquidación
  protected readonly modalLiquidacionAbierto = signal(false);
  protected readonly liqEmpleadoId = signal<number | null>(null);
  protected readonly liqDesde = signal(fechaISO(-6));
  protected readonly liqHasta = signal(fechaISO(0));
  protected readonly guardando = signal(false);
  protected readonly paraEliminar = signal<PagoMotorizadoFila | null>(null);

  private readonly ventas14 = computed(() => this.finanzas14()?.ventasDiarias ?? []);
  private readonly semanaActual = computed(() => this.ventas14().slice(-7));
  private readonly semanaAnterior = computed(() => this.ventas14().slice(0, -7).slice(-7));

  protected readonly pedidosHoy = computed(() => this.resumen()?.pedidosHoy ?? 0);
  protected readonly variacionPedidosHoy = computed(() => {
    const anterior = this.semanaAnterior().at(-1);
    return anterior ? variacion(this.pedidosHoy(), anterior.pedidos) : null;
  });
  protected readonly diaComparado = computed(() => DIAS_LARGOS[diaSemana(fechaISO(0))].toLowerCase());
  protected readonly gananciaDia = computed(() => this.finanzasHoy()?.ganancia ?? 0);
  protected readonly ventasHoy = computed(() => this.resumen()?.ventasHoy ?? 0);
  protected readonly margenNetoDia = computed(() => {
    const f = this.finanzasHoy();
    return f && f.ingresos > 0 ? Math.round((f.ganancia / f.ingresos) * 1000) / 10 : 0;
  });
  protected readonly ticketPromedio = computed(() => {
    const r = this.resumen();
    return r && r.pedidosHoy > 0 ? r.ventasHoy / r.pedidosHoy : 0;
  });
  protected readonly ticketSemana = computed(() => {
    const dias = this.semanaActual();
    const pedidos = dias.reduce((a, d) => a + d.pedidos, 0);
    return pedidos > 0 ? dias.reduce((a, d) => a + d.total, 0) / pedidos : 0;
  });
  protected readonly conteoMotorizados = computed(() => {
    const activos = this.motorizados().filter((m) => m.estado !== 'INACTIVO' && m.estado !== 'CON_LICENCIA');
    return {
      enOperacion: activos.filter((m) => m.estado === 'EN_TURNO' || m.estado === 'DISPONIBLE').length,
      total: activos.length,
      disponibles: activos.filter((m) => m.estado === 'DISPONIBLE').length,
    };
  });
  protected readonly pedidosEnCurso = computed(() =>
    (this.resumen()?.pedidosPorEstado ?? []).filter((p) => EN_CURSO.has(p.estado)).reduce((a, p) => a + p.cantidad, 0),
  );
  protected readonly pedidosEntregados = computed(
    () => this.resumen()?.pedidosPorEstado.find((p) => p.estado === 'ENTREGADO')?.cantidad ?? 0,
  );

  protected readonly barrasSemana = computed<BarraDia[]>(() => {
    const ventas = this.semanaActual();
    const max = Math.max(...ventas.map((v) => v.pedidos), 1);
    return ventas.map((v) => {
      const dia = diaSemana(v.fecha);
      return {
        diaCorto: DIAS_CORTOS[dia],
        diaCompleto: DIAS_LARGOS[dia],
        numeroDia: v.fecha.slice(8, 10),
        pedidos: v.pedidos,
        total: v.total,
        porcentajeAltura: Math.max(6, Math.round((v.pedidos / max) * 78)),
      };
    });
  });
  protected readonly totalPedidosSemana = computed(() => this.semanaActual().reduce((a, b) => a + b.pedidos, 0));
  protected readonly variacionSemanal = computed(() =>
    variacion(this.totalPedidosSemana(), this.semanaAnterior().reduce((a, b) => a + b.pedidos, 0)),
  );

  protected readonly topPizzas = computed(() => {
    const lista = (this.finanzas14()?.ranking.masVendidos ?? []).slice(0, 4);
    const max = Math.max(...lista.map((p) => p.ingresos), 1);
    return lista.map((p) => ({ ...p, porcentaje: Math.round((p.ingresos / max) * 100) }));
  });

  protected readonly pagosMotorizados = computed<PagoMotorizadoFila[]>(() => {
    const sedes = new Map(this.motorizados().map((m) => [m.id, m.sucursalNombre]));
    return (this.finanzas14()?.pagosMotorizados ?? []).map((p) => ({ ...p, sucursalNombre: sedes.get(p.empleadoId) ?? '—' }));
  });

  constructor() {
    this.api.sucursales().subscribe({ next: (lista) => this.sucursales.set(lista), error: () => this.sucursales.set([]) });
    this.cargar();
  }

  protected cargar(): void {
    const sucursalId = this.sucursalId();
    const hoy = fechaISO(0);
    this.cargando.set(true);
    forkJoin({
      resumen: this.api.resumen(sucursalId),
      finanzasHoy: this.api.reporteFinanzas({ sucursalId, desde: hoy, hasta: hoy }),
      finanzas14: this.api.reporteFinanzas({ sucursalId, desde: fechaISO(-13), hasta: hoy }),
      motorizados: this.api.empleados({ sucursalId, rol: 'MOTORIZADO', tamano: 100 }).pipe(catchError(() => of(null))),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (r) => {
          this.resumen.set(r.resumen);
          this.finanzasHoy.set(r.finanzasHoy);
          this.finanzas14.set(r.finanzas14);
          this.motorizados.set(r.motorizados?.contenido ?? []);
          this.barraSeleccionadaIdx.set(Math.max(0, this.barrasSemana().length - 1));
          this.actualizadoEn.set(new Date());
        },
      });
  }

  protected cambiarSucursal(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.sucursalId.set(valor ? Number(valor) : undefined);
    this.cargar();
  }

  protected alternarMenuFila(id: number, evento: Event): void {
    evento.stopPropagation();
    this.menuFilaAbiertoId.update((actual) => (actual === id ? null : id));
  }

  protected marcarComoPagado(pago: PagoMotorizadoFila): void {
    this.menuFilaAbiertoId.set(null);
    if (pago.estado === 'PAGADO') return;
    this.api.marcarPagoPagado(pago.id).subscribe((actualizado) => {
      this.finanzas14.update((f) =>
        f ? { ...f, pagosMotorizados: f.pagosMotorizados.map((p) => (p.id === actualizado.id ? actualizado : p)) } : f,
      );
      this.ajustarDeuda(-pago.montoTotal);
      this.toast.success('Pago registrado', `${pago.motorizadoNombre} quedó pagado.`);
    });
  }

  protected abrirEliminar(pago: PagoMotorizadoFila): void {
    this.menuFilaAbiertoId.set(null);
    if (pago.estado === 'PENDIENTE') this.paraEliminar.set(pago);
  }

  protected cerrarEliminar(): void {
    if (!this.guardando()) this.paraEliminar.set(null);
  }

  protected eliminarLiquidacion(): void {
    const pago = this.paraEliminar();
    if (!pago || this.guardando()) return;
    this.guardando.set(true);
    this.api
      .eliminarLiquidacion(pago.id)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe(() => {
        this.paraEliminar.set(null);
        this.finanzas14.update((f) => (f ? { ...f, pagosMotorizados: f.pagosMotorizados.filter((p) => p.id !== pago.id) } : f));
        this.ajustarDeuda(-pago.montoTotal);
        this.toast.success('Liquidación eliminada', `Puedes volver a liquidar el periodo de ${pago.motorizadoNombre}.`);
      });
  }

  /** La deuda del KPI es la suma de liquidaciones pendientes: se mantiene al día sin recargar todo el panel. */
  private ajustarDeuda(delta: number): void {
    this.resumen.update((r) => (r ? { ...r, deudaMotorizados: Math.max(0, r.deudaMotorizados + delta) } : r));
  }

  protected abrirModalLiquidacion(): void {
    this.liqEmpleadoId.set(this.motorizados()[0]?.id ?? null);
    this.liqDesde.set(fechaISO(-6));
    this.liqHasta.set(fechaISO(0));
    this.modalLiquidacionAbierto.set(true);
  }

  protected valor(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected registrarLiquidacion(): void {
    const empleadoId = this.liqEmpleadoId();
    if (!empleadoId || this.guardando()) return;
    if (this.liqDesde() > this.liqHasta()) {
      this.toast.warning('Revisa las fechas', 'La fecha "desde" no puede ser posterior a "hasta".');
      return;
    }
    this.guardando.set(true);
    this.api
      .liquidarMotorizado({ empleadoId, periodoDesde: this.liqDesde(), periodoHasta: this.liqHasta() })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe((nuevo) => {
        this.modalLiquidacionAbierto.set(false);
        this.finanzas14.update((f) => (f ? { ...f, pagosMotorizados: [nuevo, ...f.pagosMotorizados] } : f));
        this.ajustarDeuda(nuevo.montoTotal);
        this.toast.success('Liquidación generada', `S/ ${nuevo.montoTotal.toFixed(2)} para ${nuevo.motorizadoNombre}.`);
      });
  }
}
