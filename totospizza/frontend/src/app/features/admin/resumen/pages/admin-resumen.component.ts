import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import {
  ApiError,
  EmpleadoResponse,
  FinanzasResponse,
  NotificacionResponse,
  PagoMotorizadoResponse,
  ProductoVendidoResponse,
  ResumenAdminResponse,
  SucursalResponse,
} from '../models/admin-dashboard.models';

interface BarraDiaUI {
  fecha: string;
  diaCorto: string;
  diaCompleto: string;
  numeroDia: string;
  pedidos: number;
  total: number;
  porcentajeAltura: number;
}

interface PagoMotorizadoUI extends PagoMotorizadoResponse {
  sucursalNombre: string;
}

@Component({
  selector: 'app-admin-resumen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-resumen.component.html',
  styleUrls: ['./admin-resumen.component.scss'],
})
export class AdminResumenComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(AdminDashboardService);
  private readonly router = inject(Router);
  private relojInterval?: ReturnType<typeof setInterval>;

  // Navegación lateral
  readonly rutaActiva = signal<'resumen' | 'pedidos' | 'empleados' | 'finanzas' | 'configuracion'>('resumen');

  // Usuario autenticado (desde TokenResponse.usuario)
  readonly usuario = signal({
    nombres: 'Andrea',
    apellidos: 'Mendoza',
    rolEtiqueta: 'Administradora',
    iniciales: 'AM',
  });

  // Reloj y estado de actualización
  readonly fechaHoraActual = signal<string>('Vie, 02 oct · 14:32');
  readonly minutosUltimaActualizacion = signal<number>(0);

  // Sucursales
  readonly sucursales = signal<SucursalResponse[]>([]);
  readonly sucursalSeleccionadaId = signal<number | undefined>(undefined);
  readonly sucursalActual = computed(() => {
    const lista = this.sucursales();
    const id = this.sucursalSeleccionadaId();
    return lista.find((s) => s.id === id) ?? lista[0] ?? null;
  });

  // Notificaciones
  readonly notificacionesNoLeidas = signal<number>(2);
  readonly notificaciones = signal<NotificacionResponse[]>([]);
  readonly panelNotificacionesAbierto = signal<boolean>(false);

  // Datos principales del dashboard
  readonly cargando = signal<boolean>(false);
  readonly usandoDatosDemo = signal<boolean>(false);
  readonly resumen = signal<ResumenAdminResponse | null>(null);
  readonly finanzasHoy = signal<FinanzasResponse | null>(null);
  readonly finanzasSemana = signal<FinanzasResponse | null>(null);
  readonly motorizados = signal<EmpleadoResponse[]>([]);

  // Interactividad de gráficos y tabla
  readonly barraSeleccionadaIdx = signal<number>(6);
  readonly menuFilaAbiertoId = signal<number | null>(null);
  readonly toastMensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Modal liquidar motorizado (POST /api/v1/admin/finanzas/pagos-motorizado)
  readonly modalLiquidacionAbierto = signal<boolean>(false);
  readonly formLiquidacion = signal({
    empleadoId: 0,
    periodoDesde: this.obtenerFechaISO(-6),
    periodoHasta: this.obtenerFechaISO(0),
  });

  // Cálculos derivados para las 4 tarjetas KPI
  readonly pedidosHoy = computed(() => this.resumen()?.pedidosHoy ?? 0);

  readonly gananciaDia = computed(() => this.finanzasHoy()?.ganancia ?? 0);

  readonly margenNetoDia = computed(() => {
    const f = this.finanzasHoy();
    if (!f || !f.ingresos || f.ingresos <= 0) return 0;
    return Number(((f.ganancia / f.ingresos) * 100).toFixed(1));
  });

  readonly ticketPromedio = computed(() => {
    const r = this.resumen();
    if (!r || !r.pedidosHoy || r.pedidosHoy <= 0) return 0;
    return r.ventasHoy / r.pedidosHoy;
  });

  readonly conteoMotorizados = computed(() => {
    const lista = this.motorizados();
    const activos = lista.filter((m) => m.estado !== 'INACTIVO' && m.estado !== 'CON_LICENCIA');
    const enOperacion = activos.filter((m) => m.estado === 'EN_TURNO' || m.estado === 'DISPONIBLE');
    const disponibles = activos.filter((m) => m.estado === 'DISPONIBLE');
    return {
      activos: enOperacion.length,
      total: activos.length,
      disponibles: disponibles.length,
    };
  });

  // Gráfico de 7 días (VentasDiariasResponse)
  readonly barrasSemana = computed<BarraDiaUI[]>(() => {
    const ventas = this.finanzasSemana()?.ventasDiarias ?? [];
    if (!ventas.length) return [];

    const maxPedidos = Math.max(...ventas.map((v) => v.pedidos), 1);
    const diasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const diasLargos = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return ventas.map((v) => {
      const [y, m, d] = v.fecha.split('-').map(Number);
      const fechaObj = new Date(y, m - 1, d);
      const dayIdx = fechaObj.getDay();
      return {
        fecha: v.fecha,
        diaCorto: diasCortos[dayIdx],
        diaCompleto: diasLargos[dayIdx],
        numeroDia: String(d).padStart(2, '0'),
        pedidos: v.pedidos,
        total: v.total,
        porcentajeAltura: Math.max(18, Math.round((v.pedidos / maxPedidos) * 78)),
      };
    });
  });

  readonly totalPedidosSemana = computed(() =>
    this.barrasSemana().reduce((acc, b) => acc + b.pedidos, 0)
  );

  // Top 4 productos más vendidos (RankingProductosResponse.masVendidos)
  readonly topPizzas = computed<(ProductoVendidoResponse & { porcentaje: number })[]>(() => {
    const lista = (this.finanzasSemana()?.ranking?.masVendidos ?? []).slice(0, 4);
    const maxIngresos = Math.max(...lista.map((p) => p.ingresos), 1);
    return lista.map((p) => ({
      ...p,
      porcentaje: Math.round((p.ingresos / maxIngresos) * 100),
    }));
  });

  // Tabla Pagos a Motorizados
  readonly pagosMotorizadosUI = computed<PagoMotorizadoUI[]>(() => {
    const pagos = this.finanzasSemana()?.pagosMotorizados ?? [];
    const mapaEmpleados = new Map(this.motorizados().map((m) => [m.id, m.sucursalNombre]));
    return pagos.map((p) => ({
      ...p,
      sucursalNombre: mapaEmpleados.get(p.empleadoId) ?? this.sucursalActual()?.nombre ?? 'Sede Principal',
    }));
  });

  ngOnInit(): void {
    this.actualizarReloj();
    this.relojInterval = setInterval(() => {
      this.actualizarReloj();
      this.minutosUltimaActualizacion.update((m) => m + 1);
    }, 60000);

    this.cargarDatosIniciales();
  }

  ngOnDestroy(): void {
    if (this.relojInterval) clearInterval(this.relojInterval);
  }

  navegarA(ruta: 'resumen' | 'pedidos' | 'empleados' | 'finanzas' | 'configuracion'): void {
    this.rutaActiva.set(ruta);
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
    } else {
      this.mostrarToast('ok', `Módulo "${ruta}" listo para conectar cuando envíes su vista.`);
    }
  }

  cargarDatosIniciales(): void {
    this.cargando.set(true);
    const hoy = this.obtenerFechaISO(0);
    const hace6Dias = this.obtenerFechaISO(-6);
    const sucursalId = this.sucursalSeleccionadaId();

    forkJoin({
      sucursales: this.dashboardService.obtenerSucursales().pipe(catchError(() => of(null))),
      resumen: this.dashboardService.obtenerResumen(sucursalId).pipe(catchError(() => of(null))),
      finanzasHoy: this.dashboardService
        .obtenerReporteFinanzas(hoy, hoy, sucursalId)
        .pipe(catchError(() => of(null))),
      finanzasSemana: this.dashboardService
        .obtenerReporteFinanzas(hace6Dias, hoy, sucursalId)
        .pipe(catchError(() => of(null))),
      motorizados: this.dashboardService
        .obtenerMotorizados(sucursalId)
        .pipe(catchError(() => of(null))),
      conteoNotif: this.dashboardService.obtenerConteoNotificaciones().pipe(catchError(() => of(null))),
    }).subscribe((res) => {
      this.cargando.set(false);
      this.minutosUltimaActualizacion.set(0);

      if (!res.resumen || !res.finanzasSemana) {
        this.cargarDatosFallbackMockup();
        return;
      }

      this.usandoDatosDemo.set(false);
      if (res.sucursales) {
        this.sucursales.set(res.sucursales);
        if (!this.sucursalSeleccionadaId() && res.sucursales.length) {
          this.sucursalSeleccionadaId.set(res.sucursales[0].id);
        }
      }
      this.resumen.set(res.resumen);
      this.finanzasHoy.set(res.finanzasHoy);
      this.finanzasSemana.set(res.finanzasSemana);
      if (res.motorizados) this.motorizados.set(res.motorizados.contenido);
      if (res.conteoNotif) this.notificacionesNoLeidas.set(res.conteoNotif.total);
    });
  }

  cambiarSucursal(id: number): void {
    this.sucursalSeleccionadaId.set(Number(id));
    this.cargarDatosIniciales();
  }

  seleccionarBarra(index: number): void {
    this.barraSeleccionadaIdx.set(index);
  }

  toggleNotificaciones(): void {
    const abrir = !this.panelNotificacionesAbierto();
    this.panelNotificacionesAbierto.set(abrir);
    if (abrir && !this.usandoDatosDemo()) {
      this.dashboardService.obtenerNotificaciones().subscribe((page) => {
        this.notificaciones.set(page.contenido);
      });
    }
  }

  marcarNotificacionLeida(notif: NotificacionResponse): void {
    if (notif.leida) return;
    if (this.usandoDatosDemo()) {
      this.notificaciones.update((list) =>
        list.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
      );
      this.notificacionesNoLeidas.update((c) => Math.max(0, c - 1));
      return;
    }
    this.dashboardService.marcarNotificacionLeida(notif.id).subscribe(() => {
      this.notificaciones.update((list) =>
        list.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
      );
      this.notificacionesNoLeidas.update((c) => Math.max(0, c - 1));
    });
  }

  toggleMenuFila(id: number, event: Event): void {
    event.stopPropagation();
    this.menuFilaAbiertoId.update((actual) => (actual === id ? null : id));
  }

  marcarComoPagado(pago: PagoMotorizadoUI): void {
    this.menuFilaAbiertoId.set(null);
    if (pago.estado === 'PAGADO') return;

    if (this.usandoDatosDemo()) {
      this.finanzasSemana.update((f) => {
        if (!f) return f;
        return {
          ...f,
          pagosMotorizados: f.pagosMotorizados.map((p) =>
            p.id === pago.id ? { ...p, estado: 'PAGADO', pagadoEn: new Date().toISOString() } : p
          ),
        };
      });
      this.mostrarToast('ok', `Pago de ${pago.motorizadoNombre} marcado como PAGADO.`);
      return;
    }

    this.dashboardService.marcarPagoMotorizadoPagado(pago.id).subscribe({
      next: (actualizado) => {
        this.finanzasSemana.update((f) => {
          if (!f) return f;
          return {
            ...f,
            pagosMotorizados: f.pagosMotorizados.map((p) =>
              p.id === actualizado.id ? actualizado : p
            ),
          };
        });
        this.mostrarToast('ok', `Liquidación #${actualizado.id} pagada correctamente.`);
      },
      error: (err) => this.manejarErrorApi(err),
    });
  }

  abrirModalLiquidacion(): void {
    const primerMotorizado = this.motorizados()[0]?.id ?? 0;
    this.formLiquidacion.set({
      empleadoId: primerMotorizado,
      periodoDesde: this.obtenerFechaISO(-6),
      periodoHasta: this.obtenerFechaISO(0),
    });
    this.modalLiquidacionAbierto.set(true);
  }

  registrarLiquidacion(): void {
    const req = this.formLiquidacion();
    if (!req.empleadoId) return;

    this.dashboardService.liquidarPagoMotorizado(req).subscribe({
      next: (nuevoPago) => {
        this.modalLiquidacionAbierto.set(false);
        this.finanzasSemana.update((f) =>
          f ? { ...f, pagosMotorizados: [nuevoPago, ...f.pagosMotorizados] } : f
        );
        this.mostrarToast('ok', `Liquidación generada por S/ ${nuevoPago.montoTotal.toFixed(2)}`);
      },
      error: (err) => this.manejarErrorApi(err),
    });
  }

  mostrarToast(tipo: 'ok' | 'error', texto: string): void {
    this.toastMensaje.set({ tipo, texto });
    setTimeout(() => this.toastMensaje.set(null), 4000);
  }

  private manejarErrorApi(err: { error?: ApiError }): void {
    const apiErr = err?.error;
    const msg = apiErr?.mensaje ?? 'Ocurrió un error al comunicarse con el servidor.';
    this.mostrarToast('error', msg);
  }

  private actualizarReloj(): void {
    const ahora = new Date();
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const dia = dias[ahora.getDay()];
    const num = String(ahora.getDate()).padStart(2, '0');
    const mes = meses[ahora.getMonth()];
    const hh = String(ahora.getHours()).padStart(2, '0');
    const mm = String(ahora.getMinutes()).padStart(2, '0');
    this.fechaHoraActual.set(`${dia}, ${num} ${mes} · ${hh}:${mm}`);
  }

  private obtenerFechaISO(offsetDias: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDias);
    return d.toISOString().split('T')[0];
  }

  private cargarDatosFallbackMockup(): void {
    this.usandoDatosDemo.set(true);
    this.sucursales.set([
      {
        id: 1,
        nombre: 'Sede Miraflores',
        telefono: '987654321',
        activa: true,
        abiertoAhora: true,
        horarios: [{ diaSemana: 'FRIDAY', horaApertura: '12:00', horaCierre: '22:30', cerrado: false }],
      },
      {
        id: 2,
        nombre: 'Sede San Isidro',
        telefono: '987654322',
        activa: true,
        abiertoAhora: true,
        horarios: [{ diaSemana: 'FRIDAY', horaApertura: '12:00', horaCierre: '22:30', cerrado: false }],
      },
    ]);
    this.sucursalSeleccionadaId.set(1);

    this.resumen.set({
      gananciaSemanal: 24500,
      gananciaMensual: 98400,
      gananciaAnual: 920000,
      ventasHoy: 6349.2,
      pedidosHoy: 148,
      deudaMotorizados: 242,
      alertasStockBajo: 1,
      pedidosPorEstado: [{ estado: 'ENTREGADO', cantidad: 18 }],
    });

    this.finanzasHoy.set({
      desde: this.obtenerFechaISO(0),
      hasta: this.obtenerFechaISO(0),
      ingresos: 13147.24,
      egresos: 8861.24,
      ganancia: 4286,
      deudaMotorizados: 242,
      ventasDiarias: [],
      ranking: { masVendidos: [], menosVendidos: [] },
      pagosMotorizados: [],
    });

    this.finanzasSemana.set({
      desde: '2026-09-26',
      hasta: '2026-10-02',
      ingresos: 33976.8,
      egresos: 21000,
      ganancia: 12976.8,
      deudaMotorizados: 242,
      ventasDiarias: [
        { fecha: '2026-09-26', total: 3600, pedidos: 84 },
        { fecha: '2026-09-27', total: 4100, pedidos: 96 },
        { fecha: '2026-09-28', total: 4450, pedidos: 104 },
        { fecha: '2026-09-29', total: 4700, pedidos: 110 },
        { fecha: '2026-09-30', total: 5200, pedidos: 122 },
        { fecha: '2026-10-01', total: 5750, pedidos: 134 },
        { fecha: '2026-10-02', total: 6176.8, pedidos: 142 },
      ],
      ranking: {
        masVendidos: [
          { nombre: 'Americana Clásica', cantidad: 86, ingresos: 4128 },
          { nombre: 'Pepperoni Suprema', cantidad: 72, ingresos: 3744 },
          { nombre: 'Prosciutto & rúcula', cantidad: 54, ingresos: 3240 },
          { nombre: 'Cuatro quesos', cantidad: 47, ingresos: 2585 },
        ],
        menosVendidos: [],
      },
      pagosMotorizados: [
        {
          id: 101,
          empleadoId: 1,
          motorizadoNombre: 'Luis Mendoza',
          periodoDesde: '2026-09-26',
          periodoHasta: '2026-10-02',
          totalEntregas: 12,
          montoBase: 60,
          montoBonos: 36,
          montoTotal: 96,
          estado: 'PENDIENTE',
          pagadoEn: null,
        },
        {
          id: 102,
          empleadoId: 2,
          motorizadoNombre: 'Diego Salazar',
          periodoDesde: '2026-09-26',
          periodoHasta: '2026-10-02',
          totalEntregas: 10,
          montoBase: 52,
          montoBonos: 30,
          montoTotal: 82,
          estado: 'PAGADO',
          pagadoEn: '2026-10-02T12:15:00Z',
        },
        {
          id: 103,
          empleadoId: 3,
          motorizadoNombre: 'Marco Rojas',
          periodoDesde: '2026-09-26',
          periodoHasta: '2026-10-02',
          totalEntregas: 8,
          montoBase: 40,
          montoBonos: 24,
          montoTotal: 64,
          estado: 'PENDIENTE',
          pagadoEn: null,
        },
        {
          id: 104,
          empleadoId: 4,
          motorizadoNombre: 'Renzo Paredes',
          periodoDesde: '2026-09-26',
          periodoHasta: '2026-10-02',
          totalEntregas: 7,
          montoBase: 37,
          montoBonos: 21,
          montoTotal: 58,
          estado: 'PAGADO',
          pagadoEn: '2026-10-02T11:40:00Z',
        },
      ],
    });

    this.motorizados.set([
      {
        id: 1,
        usuarioId: 21,
        nombreCompleto: 'Luis Mendoza',
        correo: 'luis@totospizza.pe',
        telefono: '991112223',
        rol: 'MOTORIZADO',
        sucursalId: 1,
        sucursalNombre: 'Miraflores',
        estado: 'EN_TURNO',
        horaInicio: '12:00',
        horaFin: '22:00',
        fechaIngreso: '2025-04-10',
        pagoBaseTurno: 50,
        bonoPorEntrega: 3,
      },
      {
        id: 2,
        usuarioId: 22,
        nombreCompleto: 'Diego Salazar',
        correo: 'diego@totospizza.pe',
        telefono: '991112224',
        rol: 'MOTORIZADO',
        sucursalId: 2,
        sucursalNombre: 'San Isidro',
        estado: 'DISPONIBLE',
        horaInicio: '12:00',
        horaFin: '22:00',
        fechaIngreso: '2025-05-12',
        pagoBaseTurno: 50,
        bonoPorEntrega: 3,
      },
      {
        id: 3,
        usuarioId: 23,
        nombreCompleto: 'Marco Rojas',
        correo: 'marco@totospizza.pe',
        telefono: '991112225',
        rol: 'MOTORIZADO',
        sucursalId: 1,
        sucursalNombre: 'Surquillo',
        estado: 'DISPONIBLE',
        horaInicio: '12:00',
        horaFin: '22:00',
        fechaIngreso: '2025-06-01',
        pagoBaseTurno: 50,
        bonoPorEntrega: 3,
      },
      {
        id: 4,
        usuarioId: 24,
        nombreCompleto: 'Renzo Paredes',
        correo: 'renzo@totospizza.pe',
        telefono: '991112226',
        rol: 'MOTORIZADO',
        sucursalId: 1,
        sucursalNombre: 'Barranco',
        estado: 'DISPONIBLE',
        horaInicio: '12:00',
        horaFin: '22:00',
        fechaIngreso: '2025-07-15',
        pagoBaseTurno: 50,
        bonoPorEntrega: 3,
      },
    ]);

    this.notificaciones.set([
      {
        id: 1,
        tipo: 'PEDIDO_NUEVO',
        titulo: 'Nuevo pedido #PZ-148',
        mensaje: 'Delivery confirmado hacia Av. Larco 450.',
        leida: false,
        creadoEn: new Date().toISOString(),
      },
      {
        id: 2,
        tipo: 'STOCK_BAJO',
        titulo: 'Stock web bajo en Masa Artesanal',
        mensaje: 'Quedan 14 unidades disponibles en canal ONLINE.',
        leida: false,
        creadoEn: new Date().toISOString(),
      },
    ]);
  }
}