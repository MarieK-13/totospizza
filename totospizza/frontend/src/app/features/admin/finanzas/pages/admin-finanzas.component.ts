import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ArrowDownWideNarrow, Bike, ChartColumn, CreditCard, LucideAngularModule, Pizza, ReceiptText, Trash2 } from 'lucide-angular';
import type {
  FinanzasResponse,
  MetodoPago,
  MovimientoFinancieroResponse,
  PagoMotorizadoResponse,
  ResumenAdminResponse,
  SucursalResponse,
  TipoMovimientoFinanciero,
  VentaDiariaResponse,
} from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { aInputFechaHora, deInputFechaHora, fechaISO, formatearFecha, formatearFechaHora } from '../../../../core/utils/fechas';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelModal } from '../../../../shared/components/panel-modal/panel-modal';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';

type Granularidad = 'DIA' | 'SEMANA' | 'MES';
const TAMANO_MOVIMIENTOS = 15;
const MS_DIA = 86_400_000;

const METODOS: Readonly<Record<MetodoPago, { etiqueta: string; color: string }>> = {
  YAPE: { etiqueta: 'Yape', color: 'var(--color-rojo-tomate)' },
  TARJETA: { etiqueta: 'Tarjeta', color: 'var(--color-verde-albahaca)' },
  PLIN: { etiqueta: 'Plin', color: 'var(--color-amarillo-queso)' },
  CMR: { etiqueta: 'CMR', color: 'var(--color-marron-suave)' },
};
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

interface Barra {
  readonly etiqueta: string;
  readonly detalle: string;
  readonly total: number;
  readonly pedidos: number;
  readonly altura: number;
}

function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(hasta) - Date.parse(desde)) / MS_DIA) + 1;
}

function desplazar(fecha: string, dias: number): string {
  return new Date(Date.parse(fecha) + dias * MS_DIA).toISOString().slice(0, 10);
}

function variacion(actual: number, anterior: number): number | null {
  return anterior > 0 ? Math.round(((actual - anterior) / anterior) * 1000) / 10 : null;
}

function corto(fecha: string): string {
  return `${fecha.slice(8, 10)} ${MESES[Number(fecha.slice(5, 7)) - 1]}`;
}

/** Agrupa las ventas diarias por semana (lunes) o por mes. */
function agrupar(ventas: readonly VentaDiariaResponse[], modo: Granularidad): { clave: string; total: number; pedidos: number }[] {
  const grupos = new Map<string, { clave: string; total: number; pedidos: number }>();
  for (const v of ventas) {
    let clave = v.fecha;
    if (modo === 'MES') clave = v.fecha.slice(0, 7);
    if (modo === 'SEMANA') {
      const dia = (new Date(`${v.fecha}T12:00:00`).getDay() + 6) % 7;
      clave = desplazar(v.fecha, -dia);
    }
    const g = grupos.get(clave) ?? { clave, total: 0, pedidos: 0 };
    g.total += v.total;
    g.pedidos += v.pedidos;
    grupos.set(clave, g);
  }
  return [...grupos.values()];
}

@Component({
  selector: 'app-admin-finanzas',
  imports: [DecimalPipe, ReactiveFormsModule, LucideAngularModule, PanelAccionesDirective, TextField, SelectField, EstadoVacio, PanelModal],
  templateUrl: './admin-finanzas.component.html',
  styleUrls: ['./admin-finanzas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFinanzasComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly hoy = fechaISO(0);
  protected readonly desde = signal(`${this.hoy.slice(0, 8)}01`);
  protected readonly hasta = signal(this.hoy);
  protected readonly filtroTipo = signal<TipoMovimientoFinanciero | ''>('');
  protected readonly granularidad = signal<Granularidad>('DIA');

  protected readonly cargando = signal(true);
  protected readonly resumen = signal<ResumenAdminResponse | null>(null);
  protected readonly finanzas = signal<FinanzasResponse | null>(null);
  protected readonly finanzasAnterior = signal<FinanzasResponse | null>(null);
  protected readonly movimientos = signal<readonly MovimientoFinancieroResponse[]>([]);
  protected readonly paginaMovimientos = signal(0);
  protected readonly hayMasMovimientos = signal(false);
  protected readonly cargandoMovimientos = signal(false);

  protected readonly sucursales = signal<readonly SucursalResponse[]>([]);
  protected readonly opcionesSucursal = computed(() => this.sucursales().map((s) => ({ valor: String(s.id), etiqueta: s.nombre })));
  protected readonly opcionesTipo = [
    { valor: 'EGRESO', etiqueta: 'Gasto' },
    { valor: 'INGRESO', etiqueta: 'Ingreso' },
  ];
  protected readonly modalGastoAbierto = signal(false);
  protected readonly guardando = signal(false);
  protected readonly formMovimiento = this.fb.group({
    sucursalId: ['', [Validators.required]],
    tipo: ['EGRESO' as TipoMovimientoFinanciero, [Validators.required]],
    concepto: ['', [Validators.required, Validators.maxLength(160)]],
    monto: ['', [Validators.required, Validators.min(0.01)]],
    ocurridoEn: ['', [Validators.required]],
  });

  protected readonly Iconos = {
    Grafico: ChartColumn,
    Tarjeta: CreditCard,
    Pizza,
    Recibo: ReceiptText,
    Moto: Bike,
    Menos: ArrowDownWideNarrow,
  };
  protected readonly conciliando = signal(false);
  protected readonly pendientes = signal<readonly PagoMotorizadoResponse[]>([]);
  protected readonly cargandoPendientes = signal(true);
  protected readonly pagandoId = signal<number | null>(null);
  protected readonly paraEliminar = signal<PagoMotorizadoResponse | null>(null);
  protected readonly Trash2 = Trash2;
  protected readonly fecha = formatearFecha;
  protected readonly ahoraLocal = () => aInputFechaHora(new Date().toISOString());

  /** Los productos que menos se venden: candidatos a cambiar en el menú. */
  protected readonly menosVendidos = computed(() => (this.finanzas()?.ranking.menosVendidos ?? []).slice(0, 6));
  protected readonly totalPendiente = computed(() => this.pendientes().reduce((a, p) => a + p.montoTotal, 0));

  protected readonly etiquetaPeriodo = computed(() => `${corto(this.desde())} — ${corto(this.hasta())} ${this.hasta().slice(0, 4)}`);
  protected readonly ventasPeriodo = computed(() => this.finanzas()?.ingresos ?? 0);
  protected readonly gananciaNeta = computed(() => this.finanzas()?.ganancia ?? 0);
  protected readonly gastosPeriodo = computed(() => this.finanzas()?.egresos ?? 0);
  protected readonly pedidosPeriodo = computed(() => (this.finanzas()?.ventasDiarias ?? []).reduce((a, v) => a + v.pedidos, 0));
  protected readonly margenNeto = computed(() => {
    const v = this.ventasPeriodo();
    return v ? Math.round((this.gananciaNeta() / v) * 1000) / 10 : 0;
  });
  protected readonly gastosSobreVentas = computed(() => {
    const v = this.ventasPeriodo();
    return v ? Math.round((this.gastosPeriodo() / v) * 1000) / 10 : 0;
  });
  protected readonly ticketPromedio = computed(() => {
    const pedidos = this.pedidosPeriodo();
    const total = (this.finanzas()?.ventasDiarias ?? []).reduce((a, v) => a + v.total, 0);
    return pedidos ? total / pedidos : 0;
  });
  protected readonly variacionVentas = computed(() => variacion(this.ventasPeriodo(), this.finanzasAnterior()?.ingresos ?? 0));
  protected readonly variacionGanancia = computed(() => variacion(this.gananciaNeta(), this.finanzasAnterior()?.ganancia ?? 0));
  protected readonly variacionGastos = computed(() => variacion(this.gastosPeriodo(), this.finanzasAnterior()?.egresos ?? 0));

  protected readonly barras = computed<Barra[]>(() => {
    const modo = this.granularidad();
    const grupos = agrupar(this.finanzas()?.ventasDiarias ?? [], modo).slice(-14);
    const max = Math.max(...grupos.map((g) => g.total), 1);
    return grupos.map((g) => ({
      etiqueta: modo === 'MES' ? MESES[Number(g.clave.slice(5, 7)) - 1] : g.clave.slice(8, 10),
      detalle: modo === 'MES' ? g.clave : modo === 'SEMANA' ? `Semana del ${corto(g.clave)}` : corto(g.clave),
      total: g.total,
      pedidos: g.pedidos,
      altura: Math.max(4, Math.round((g.total / max) * 84)),
    }));
  });
  protected readonly totalGrafico = computed(() => this.barras().reduce((a, b) => a + b.total, 0));

  protected readonly metodosPago = computed(() => {
    const lista = this.finanzas()?.ventasPorMetodo ?? [];
    const total = lista.reduce((a, m) => a + m.total, 0);
    return lista
      .filter((m) => m.total > 0)
      .map((m) => ({ ...METODOS[m.metodo], transacciones: m.transacciones, porcentaje: total ? Math.round((m.total / total) * 1000) / 10 : 0 }));
  });
  protected readonly transacciones = computed(() => (this.finanzas()?.ventasPorMetodo ?? []).reduce((a, m) => a + m.transacciones, 0));
  protected readonly donutGradient = computed(() => {
    let acumulado = 0;
    const segmentos = this.metodosPago().map((m) => `${m.color} ${acumulado}% ${(acumulado += m.porcentaje)}%`);
    return segmentos.length ? `conic-gradient(${segmentos.join(', ')})` : 'var(--color-crema-claro)';
  });

  protected readonly topPizzas = computed(() => {
    const lista = (this.finanzas()?.ranking.masVendidos ?? []).slice(0, 4);
    const max = Math.max(...lista.map((p) => p.ingresos), 1);
    return lista.map((p) => ({ ...p, porcentaje: Math.round((p.ingresos / max) * 100) }));
  });

  protected readonly movimientosFiltrados = computed(() => {
    const tipo = this.filtroTipo();
    return tipo ? this.movimientos().filter((m) => m.tipo === tipo) : this.movimientos();
  });

  constructor() {
    this.api.sucursales().subscribe((lista) => this.sucursales.set(lista));
    this.cargar();
    this.cargarPendientes();
  }

  protected cargarPendientes(): void {
    this.cargandoPendientes.set(true);
    this.api
      .pagosPendientes({ tamano: 50 })
      .pipe(finalize(() => this.cargandoPendientes.set(false)))
      .subscribe({ next: (pagina) => this.pendientes.set(pagina.contenido), error: () => this.pendientes.set([]) });
  }

  protected marcarPagado(pago: PagoMotorizadoResponse): void {
    if (this.pagandoId()) return;
    this.pagandoId.set(pago.id);
    this.api
      .marcarPagoPagado(pago.id)
      .pipe(finalize(() => this.pagandoId.set(null)))
      .subscribe(() => {
        this.pendientes.update((l) => l.filter((p) => p.id !== pago.id));
        this.toast.success('Pago registrado', `${pago.motorizadoNombre} · S/ ${pago.montoTotal.toFixed(2)}`);
        this.cargar();
      });
  }

  protected abrirEliminar(pago: PagoMotorizadoResponse): void {
    this.paraEliminar.set(pago);
  }

  protected cerrarEliminar(): void {
    if (this.pagandoId() === null) this.paraEliminar.set(null);
  }

  protected eliminarLiquidacion(): void {
    const pago = this.paraEliminar();
    if (!pago || this.pagandoId() !== null) return;
    this.pagandoId.set(pago.id);
    this.api
      .eliminarLiquidacion(pago.id)
      .pipe(finalize(() => this.pagandoId.set(null)))
      .subscribe(() => {
        this.paraEliminar.set(null);
        this.pendientes.update((l) => l.filter((p) => p.id !== pago.id));
        this.toast.success('Liquidación eliminada', `Vuelve a liquidar el periodo de ${pago.motorizadoNombre} desde Resumen.`);
      });
  }

  /** Revisa con la pasarela los pagos que quedaron pendientes y actualiza su estado. */
  protected conciliar(): void {
    if (this.conciliando()) return;
    this.conciliando.set(true);
    this.api
      .conciliarPagos()
      .pipe(finalize(() => this.conciliando.set(false)))
      .subscribe(({ total }) => {
        if (total > 0) {
          this.toast.success('Pagos conciliados', `${total} ${total === 1 ? 'pago actualizado' : 'pagos actualizados'} con la pasarela.`);
          this.cargar();
        } else {
          this.toast.info('Todo al día', 'No había pagos pendientes por conciliar.');
        }
      });
  }

  protected valor(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected fechaHora(iso: string): string {
    return formatearFechaHora(iso);
  }

  protected montoCorto(valor: number): string {
    return Math.abs(valor) >= 10_000
      ? `${(valor / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })}k`
      : valor.toLocaleString('es-PE', { maximumFractionDigits: 0 });
  }

  protected cambiarRango(campo: 'desde' | 'hasta', evento: Event): void {
    const valor = this.valor(evento);
    if (!valor) return;
    this[campo].set(valor);
    if (this.desde() > this.hasta()) {
      this.toast.warning('Revisa las fechas', 'La fecha inicial no puede ser posterior a la final.');
      return;
    }
    this.cargar();
  }

  protected cargar(): void {
    const desde = this.desde();
    const hasta = this.hasta();
    const dias = diasEntre(desde, hasta);
    this.cargando.set(true);
    forkJoin({
      resumen: this.api.resumen(),
      actual: this.api.reporteFinanzas({ desde, hasta }),
      anterior: this.api.reporteFinanzas({ desde: desplazar(desde, -dias), hasta: desplazar(desde, -1) }),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe(({ resumen, actual, anterior }) => {
        this.resumen.set(resumen);
        this.finanzas.set(actual);
        this.finanzasAnterior.set(anterior);
      });
    this.cargarMovimientos(true);
  }

  protected cargarMovimientos(reiniciar = false): void {
    const pagina = reiniciar ? 0 : this.paginaMovimientos() + 1;
    this.cargandoMovimientos.set(true);
    this.api
      .movimientos({ desde: this.desde(), hasta: this.hasta(), pagina, tamano: TAMANO_MOVIMIENTOS })
      .pipe(finalize(() => this.cargandoMovimientos.set(false)))
      .subscribe((resp) => {
        this.movimientos.update((l) => (reiniciar ? resp.contenido : [...l, ...resp.contenido]));
        this.paginaMovimientos.set(pagina);
        this.hayMasMovimientos.set(pagina + 1 < resp.totalPaginas);
      });
  }

  protected abrirModalMovimiento(): void {
    this.formMovimiento.reset({ sucursalId: String(this.sucursales()[0]?.id ?? ''), ocurridoEn: this.ahoraLocal() });
    this.modalGastoAbierto.set(true);
  }

  protected registrarMovimiento(): void {
    if (this.guardando()) return;
    if (this.formMovimiento.invalid) {
      this.formMovimiento.markAllAsTouched();
      return;
    }
    const v = this.formMovimiento.getRawValue();
    this.guardando.set(true);
    this.api
      .registrarMovimiento({
        sucursalId: Number(v.sucursalId),
        tipo: v.tipo,
        concepto: v.concepto.trim(),
        monto: Number(v.monto),
        ocurridoEn: deInputFechaHora(v.ocurridoEn),
      })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe((mov) => {
        this.modalGastoAbierto.set(false);
        this.toast.success(mov.tipo === 'EGRESO' ? 'Gasto registrado' : 'Ingreso registrado', `${mov.concepto} · S/ ${mov.monto.toFixed(2)}`);
        this.cargar();
      });
  }

  protected descargarCSV(): void {
    const filas = this.movimientosFiltrados();
    if (!filas.length) return;
    const celda = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      ['Fecha', 'Tipo', 'Concepto', 'Pedido', 'Monto (S/)'],
      ...filas.map((m) => [
        this.fechaHora(m.ocurridoEn),
        m.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto',
        m.concepto,
        m.numeroPedido ? `#${m.numeroPedido}` : '',
        (m.tipo === 'INGRESO' ? m.monto : -m.monto).toFixed(2),
      ]),
    ]
      .map((fila) => fila.map(celda).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `finanzas-${this.desde()}-a-${this.hasta()}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  protected imprimirReporte(): void {
    window.print();
  }
}
