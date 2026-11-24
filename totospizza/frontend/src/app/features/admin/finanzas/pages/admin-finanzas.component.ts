import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AdminFinanzasService } from '../services/admin-finanzas.service';
import {
  FinanzasResponse,
  MovimientoFinancieroUI,
  ProductoVendidoResponse,
  ResumenAdminResponse,
  TipoMovimientoFinanciero,
} from '../models/admin-finanzas.models';

interface BarraVentaUI {
  diaNumero: string;
  fecha: string;
  total: number;
  pedidos: number;
  alturaPorcentaje: number;
  destacada: boolean;
}

interface MetodoPagoDonutUI {
  etiqueta: string;
  porcentaje: number;
  color: string;
}

@Component({
  selector: 'app-admin-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-finanzas.component.html',
  styleUrls: ['./admin-finanzas.component.scss'],
})
export class AdminFinanzasComponent implements OnInit {
  private readonly finanzasService = inject(AdminFinanzasService);
  private readonly router = inject(Router);

  // Usuario y cabecera
  readonly usuario = signal({
    nombres: 'Andrea',
    apellidos: 'Mendoza',
    rolEtiqueta: 'Administradora',
    iniciales: 'AM',
  });
  readonly fechaHoraActual = signal('Vie, 02 oct · 14:32');
  readonly notificacionesNoLeidas = signal(2);

  // Filtros de fecha, tipo y granularidad (Día / Semana / Mes)
  readonly fechaDesde = signal('2026-10-01');
  readonly fechaHasta = signal('2026-10-31');
  readonly filtroTipoMovimiento = signal<TipoMovimientoFinanciero | ''>('');
  readonly granularidad = signal<'DIA' | 'SEMANA' | 'MES'>('DIA');

  // Estado de carga y datos
  readonly cargando = signal(false);
  readonly usandoDatosDemo = signal(false);
  readonly resumen = signal<ResumenAdminResponse | null>(null);
  readonly finanzasMes = signal<FinanzasResponse | null>(null);
  readonly finanzasHoy = signal<FinanzasResponse | null>(null);
  readonly movimientos = signal<MovimientoFinancieroUI[]>([]);
  readonly toastMensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // KPIs calculados
  readonly ventasDia = computed(() => this.resumen()?.ventasHoy ?? 6842);
  readonly transaccionesDia = computed(() => this.resumen()?.pedidosHoy ?? 146);

  readonly ventasMes = computed(() => this.finanzasMes()?.ingresos ?? 128400);
  readonly gananciaNeta = computed(() => this.finanzasMes()?.ganancia ?? 41800);
  readonly gastosMes = computed(() => this.finanzasMes()?.egresos ?? 18200);

  readonly margenNetoPorcentaje = computed(() => {
    const ing = this.ventasMes();
    const gan = this.gananciaNeta();
    if (!ing) return 0;
    return Number(((gan / ing) * 100).toFixed(1));
  });

  readonly porcentajeGastosSobreVentas = computed(() => {
    const ing = this.ventasMes();
    const gas = this.gastosMes();
    if (!ing) return 0;
    return Number(((gas / ing) * 100).toFixed(1));
  });

  readonly ticketPromedio = computed(() => {
    const ventas = this.ventasDia();
    const pedidos = this.transaccionesDia();
    if (!pedidos) return 42.9;
    return Number((ventas / pedidos).toFixed(2));
  });

  // Gráfico 1: Ventas por día (últimos 10 días del periodo)
  readonly barrasVentas = computed<BarraVentaUI[]>(() => {
    const lista = (this.finanzasMes()?.ventasDiarias ?? []).slice(-10);
    if (!lista.length) return [];
    const maxTotal = Math.max(...lista.map((v) => v.total), 1);

    return lista.map((item, idx) => {
      const partes = item.fecha.split('-');
      const diaNum = partes[2] ?? String(idx + 1).padStart(2, '0');
      return {
        diaNumero: diaNum,
        fecha: item.fecha,
        total: item.total,
        pedidos: item.pedidos,
        alturaPorcentaje: Math.max(22, Math.round((item.total / maxTotal) * 84)),
        destacada: idx === lista.length - 1,
      };
    });
  });

  readonly totalVentasPeriodoGrafico = computed(() =>
    this.barrasVentas().reduce((acc, b) => acc + b.total, 0)
  );

  // Gráfico 2: Donut Métodos de Pago (representación visual del diseño)
  readonly metodosPago = signal<MetodoPagoDonutUI[]>([
    { etiqueta: 'Yape ', porcentaje: 42, color: '#c82828' },
    { etiqueta: 'Tarjeta', porcentaje: 31, color: '#1f8a4c' },
    { etiqueta: 'plin', porcentaje: 22, color: '#d48817' },
    { etiqueta: 'Otros', porcentaje: 5, color: '#3668b2' },
  ]);

  readonly donutGradient = computed(() => {
    let acumulado = 0;
    const segmentos = this.metodosPago().map((m) => {
      const inicio = acumulado;
      acumulado += m.porcentaje;
      return `${m.color} ${inicio}% ${acumulado}%`;
    });
    return `conic-gradient(${segmentos.join(', ')})`;
  });

  // Gráfico 3: Mayor ingreso por pizza
  readonly topPizzasIngresos = computed<(ProductoVendidoResponse & { porcentaje: number })[]>(() => {
    const lista = (this.finanzasMes()?.ranking?.masVendidos ?? []).slice(0, 4);
    const max = Math.max(...lista.map((p) => p.ingresos), 1);
    return lista.map((p) => ({
      ...p,
      porcentaje: Math.round((p.ingresos / max) * 100),
    }));
  });

  // Movimientos filtrados
  readonly movimientosFiltrados = computed(() => {
    const tipo = this.filtroTipoMovimiento();
    const lista = this.movimientos();
    if (!tipo) return lista;
    return lista.filter((m) => m.tipo === tipo);
  });

  readonly saldoDisponible = computed(() => {
    const gan = this.gananciaNeta();
    return gan > 0 ? gan + 10840.8 : 52640.8;
  });

  ngOnInit(): void {
    this.cargarDatosFinancieros();
  }

  navegarA(ruta: 'resumen' | 'pedidos' | 'empleados' | 'finanzas' | 'configuracion'): void {
     if (ruta === 'resumen') {
      this.router.navigate(['/admin/resumen']);
    } else if (ruta === 'pedidos') {
      this.router.navigate(['/admin/pedidos']);
      } else if (ruta === 'empleados') {
      this.router.navigate(['/admin/empleados']);
      } else if (ruta === 'finanzas') {
      this.router.navigate(['/admin/finanzas']);
      } else if (ruta === 'configuracion') {
      this.router.navigate(['/admin/configuracion']);
      this.mostrarToast('ok', `Módulo "${ruta}" listo para conectar cuando envíes su vista.`);
    }
  }

  cargarDatosFinancieros(): void {
    this.cargando.set(true);
    const hoy = new Date().toISOString().split('T')[0];

    forkJoin({
      resumen: this.finanzasService.obtenerResumen().pipe(catchError(() => of(null))),
      finanzasMes: this.finanzasService
        .obtenerFinanzas(this.fechaDesde(), this.fechaHasta())
        .pipe(catchError(() => of(null))),
      finanzasHoy: this.finanzasService.obtenerFinanzas(hoy, hoy).pipe(catchError(() => of(null))),
    }).subscribe(({ resumen, finanzasMes, finanzasHoy }) => {
      this.cargando.set(false);

      if (!finanzasMes) {
        this.cargarFallbackMockup();
        return;
      }

      this.usandoDatosDemo.set(false);
      if (resumen) this.resumen.set(resumen);
      this.finanzasMes.set(finanzasMes);
      this.finanzasHoy.set(finanzasHoy);
      this.construirMovimientosDesdeBackend(finanzasMes);
    });
  }

  cambiarGranularidad(modo: 'DIA' | 'SEMANA' | 'MES'): void {
    this.granularidad.set(modo);
    this.mostrarToast('ok', `Vista agrupada por ${modo.toLowerCase()}.`);
  }

  formatearMontoCorto(valor: number): string {
    if (valor >= 1000) {
      return `${(valor / 1000).toFixed(1)}k`;
    }
    return valor.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  etiquetaTipoMovimiento(tipo: TipoMovimientoFinanciero): string {
    const mapa: Record<TipoMovimientoFinanciero, string> = {
      VENTA: 'Venta',
      DELIVERY: 'Delivery',
      COMPRA_INSUMOS: 'Compra de insumos',
      PAGO_EMPLEADOS: 'Pago a empleados',
      OTROS_GASTOS: 'Otros gastos',
    };
    return mapa[tipo];
  }

  descargarCSV(): void {
    const filas = this.movimientosFiltrados();
    if (!filas.length) return;

    const cabecera = ['Fecha', 'Tipo', 'Descripcion', 'Metodo de Pago', 'Ingreso (S/)', 'Gasto (S/)', 'Total (S/)'];
    const cuerpo = filas.map((m) => [
      `"${m.fechaHora}"`,
      `"${this.etiquetaTipoMovimiento(m.tipo)}"`,
      `"${m.descripcion}"`,
      m.metodoPago,
      m.ingreso !== null ? m.ingreso.toFixed(2) : '0.00',
      m.gasto !== null ? m.gasto.toFixed(2) : '0.00',
      m.total.toFixed(2),
    ]);

    const csv = [cabecera.join(','), ...cuerpo.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-finanzas-${this.fechaDesde()}-a-${this.fechaHasta()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.mostrarToast('ok', 'Reporte financiero descargado en CSV.');
  }

  exportarReportePDF(): void {
    window.print();
  }

  mostrarToast(tipo: 'ok' | 'error', texto: string): void {
    this.toastMensaje.set({ tipo, texto });
    setTimeout(() => this.toastMensaje.set(null), 4000);
  }

  private construirMovimientosDesdeBackend(finanzas: FinanzasResponse): void {
    const lista: MovimientoFinancieroUI[] = [];

    finanzas.pagosMotorizados.forEach((p) => {
      lista.push({
        id: `pago-mot-${p.id}`,
        fechaHora: p.pagadoEn ? p.pagadoEn.slice(0, 16).replace('T', ' · ') : `${p.periodoHasta} · Liquidación`,
        tipo: 'PAGO_EMPLEADOS',
        esIngreso: false,
        descripcion: `Liquidación motorizado · ${p.motorizadoNombre} (${p.totalEntregas} entregas)`,
        metodoPago: 'Transferencia',
        ingreso: null,
        gasto: p.montoTotal,
        total: -p.montoTotal,
      });
    });

    if (lista.length === 0) {
      this.movimientos.set(this.mockMovimientos);
    } else {
      this.movimientos.set(lista);
    }
  }

  // ==================== DATOS DEMO IDÉNTICOS A LA IMAGEN ====================
  private readonly mockMovimientos: MovimientoFinancieroUI[] = [
    {
      id: '1',
      fechaHora: '02 oct · 14:24',
      tipo: 'VENTA',
      esIngreso: true,
      descripcion: 'Pedido #1048 · Lucia Ramos',
      metodoPago: 'Yape',
      ingreso: 98.5,
      gasto: null,
      total: 98.5,
    },
    {
      id: '2',
      fechaHora: '02 oct · 14:10',
      tipo: 'DELIVERY',
      esIngreso: true,
      descripcion: 'Servicio motorizado #1046',
      metodoPago: 'Tarjeta',
      ingreso: 8.0,
      gasto: null,
      total: 8.0,
    },
    {
      id: '3',
      fechaHora: '02 oct · 12:35',
      tipo: 'COMPRA_INSUMOS',
      esIngreso: false,
      descripcion: 'Quesos Andinos SAC · factura 0241',
      metodoPago: 'Plin',
      ingreso: null,
      gasto: 486.0,
      total: -486.0,
    },
    {
      id: '4',
      fechaHora: '02 oct · 11:18',
      tipo: 'PAGO_EMPLEADOS',
      esIngreso: false,
      descripcion: 'Adelanto semanal · cocina',
      metodoPago: 'Tarjeta',
      ingreso: null,
      gasto: 320.0,
      total: -320.0,
    },
    {
      id: '5',
      fechaHora: '02 oct · 10:42',
      tipo: 'OTROS_GASTOS',
      esIngreso: false,
      descripcion: 'Mantenimiento de horno',
      metodoPago: 'Tarjeta',
      ingreso: null,
      gasto: 180.0,
      total: -180.0,
    },
  ];

  private cargarFallbackMockup(): void {
    this.usandoDatosDemo.set(true);

    this.resumen.set({
      gananciaSemanal: 24500,
      gananciaMensual: 41800,
      gananciaAnual: 920000,
      ventasHoy: 6842,
      pedidosHoy: 146,
      deudaMotorizados: 242,
      alertasStockBajo: 1,
      pedidosPorEstado: [],
    });

    this.finanzasMes.set({
      desde: '2026-10-01',
      hasta: '2026-10-31',
      ingresos: 128400,
      egresos: 18200,
      ganancia: 41800,
      deudaMotorizados: 242,
      ventasDiarias: [
        { fecha: '2026-09-23', total: 2150, pedidos: 50 },
        { fecha: '2026-09-24', total: 3250, pedidos: 75 },
        { fecha: '2026-09-25', total: 2680, pedidos: 62 },
        { fecha: '2026-09-26', total: 3890, pedidos: 90 },
        { fecha: '2026-09-27', total: 3310, pedidos: 78 },
        { fecha: '2026-09-28', total: 4320, pedidos: 101 },
        { fecha: '2026-09-29', total: 4780, pedidos: 112 },
        { fecha: '2026-09-30', total: 3940, pedidos: 92 },
        { fecha: '2026-10-01', total: 4580, pedidos: 108 },
        { fecha: '2026-10-02', total: 5724, pedidos: 135 },
      ],
      ranking: {
        masVendidos: [
          { nombre: 'Americana', cantidad: 380, ingresos: 18400 },
          { nombre: 'Pepperoni', cantidad: 310, ingresos: 15800 },
          { nombre: 'Prosciutto', cantidad: 215, ingresos: 12200 },
          { nombre: 'Cuatro quesos', cantidad: 185, ingresos: 9600 },
        ],
        menosVendidos: [],
      },
      pagosMotorizados: [],
    });

    this.movimientos.set(this.mockMovimientos);
  }
}