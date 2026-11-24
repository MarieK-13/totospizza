import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AdminEmpleadosService } from '../services/admin-empleados.service';
import {
  ApiError,
  AsignarHorarioRequest,
  EmpleadoRequest,
  EmpleadoResponse,
  EstadoEmpleado,
  ResumenEmpleadosResponse,
  Rol,
  SucursalBasica,
  TipoDocumento,
  TurnoResponse,
} from '../models/admin-empleados.models';

export interface EmpleadoFilaUI extends EmpleadoResponse {
  // Campos visuales del diseño no incluidos en EmpleadoResponse del backend
  numeroDocumentoUI?: string;
  ultimoAccesoUI?: string;
  cargoVisualEtiqueta?: string;
}

@Component({
  selector: 'app-admin-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-empleados.component.html',
  styleUrls: ['./admin-empleados.component.scss'],
})
export class AdminEmpleadosComponent implements OnInit {
  private readonly empleadosService = inject(AdminEmpleadosService);
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

  // Sucursales
  readonly sucursales = signal<SucursalBasica[]>([
    { id: 1, nombre: 'Sede Miraflores' },
    { id: 2, nombre: 'Sede San Isidro' },
  ]);
  readonly sucursalActivaId = signal<number>(1);

  // KPI Resumen (ResumenEmpleadosResponse)
  readonly resumen = signal<ResumenEmpleadosResponse>({
    total: 27,
    activos: 24,
    enTurno: 18,
    disponibles: 6,
    inactivos: 3,
    conLicencia: 2,
  });

  // Filtros
  readonly filtroTexto = signal('');
  readonly filtroRol = signal<Rol | ''>('');
  readonly filtroEstado = signal<EstadoEmpleado | ''>('');

  // Paginación
  readonly paginaActual = signal(0);
  readonly tamanoPagina = signal(5);
  readonly totalElementos = signal(27);
  readonly totalPaginas = signal(6);

  // Listado y selección
  readonly cargando = signal(false);
  readonly usandoDatosDemo = signal(false);
  readonly empleados = signal<EmpleadoFilaUI[]>([]);
  readonly empleadoSeleccionado = signal<EmpleadoFilaUI | null>(null);
  readonly menuFilaAbiertoId = signal<number | null>(null);
  readonly toastMensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Modales interactivos
  readonly modalFormularioAbierto = signal(false);
  readonly modoEdicion = signal(false);
  readonly modalPerfilAbierto = signal(false);
  readonly modalEstadoAbierto = signal(false);
  readonly modalHorarioAbierto = signal(false);
  readonly modalHistorialAbierto = signal(false);

  // Formularios de modales
  readonly formEmpleado = signal<{
    nombres: string;
    apellidos: string;
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    telefono: string;
    correo: string;
    contrasenaInicial: string;
    rol: Rol;
    sucursalId: number;
    horaInicio: string;
    horaFin: string;
    fechaIngreso: string;
    pagoBaseTurno: number;
    bonoPorEntrega: number;
  }>({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    telefono: '',
    correo: '',
    contrasenaInicial: '',
    rol: 'PIZZERO',
    sucursalId: 1,
    horaInicio: '12:00',
    horaFin: '21:00',
    fechaIngreso: this.obtenerFechaISO(0),
    pagoBaseTurno: 50,
    bonoPorEntrega: 3,
  });

  readonly estadoSeleccionado = signal<EstadoEmpleado>('EN_TURNO');

  readonly formHorario = signal<AsignarHorarioRequest>({
    fecha: this.obtenerFechaISO(0),
    horaInicio: '12:00',
    horaFin: '20:00',
    puesto: 'Reparto Miraflores',
    sucursalId: 1,
  });

  readonly turnosHistorial = signal<TurnoResponse[]>([]);
  readonly filtroTurnosDesde = signal(this.obtenerFechaISO(-7));
  readonly filtroTurnosHasta = signal(this.obtenerFechaISO(7));

  readonly porcentajeEnTurno = computed(() => {
    const r = this.resumen();
    if (!r.activos) return 0;
    return Math.round((r.enTurno / r.activos) * 100);
  });

  readonly porcentajeInactivos = computed(() => {
    const r = this.resumen();
    if (!r.total) return 0;
    return Number(((r.inactivos / r.total) * 100).toFixed(1));
  });

  readonly paginasVisibles = computed(() => {
    const actual = this.paginaActual() + 1;
    const total = Math.max(this.totalPaginas(), 1);
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 2) return [1, 2, 3];
    if (actual >= total - 1) return [total - 2, total - 1, total];
    return [actual - 1, actual, actual + 1];
  });

  ngOnInit(): void {
    this.cargarDatos();
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

  cargarDatos(): void {
    this.cargando.set(true);

    forkJoin({
      sucursales: this.empleadosService.obtenerSucursales().pipe(catchError(() => of(null))),
      resumen: this.empleadosService
        .obtenerResumenEmpleados(this.sucursalActivaId())
        .pipe(catchError(() => of(null))),
      lista: this.empleadosService
        .listarEmpleados({
          sucursalId: this.sucursalActivaId(),
          rol: this.filtroRol() || undefined,
          estado: this.filtroEstado() || undefined,
          texto: this.filtroTexto() || undefined,
          pagina: this.paginaActual(),
          tamano: this.tamanoPagina(),
        })
        .pipe(catchError(() => of(null))),
    }).subscribe(({ sucursales, resumen, lista }) => {
      this.cargando.set(false);

      if (!lista) {
        this.cargarFallbackMockup();
        return;
      }

      this.usandoDatosDemo.set(false);
      if (sucursales && sucursales.length) this.sucursales.set(sucursales);
      if (resumen) this.resumen.set(resumen);

      this.empleados.set(lista.contenido);
      this.totalElementos.set(lista.totalElementos);
      this.totalPaginas.set(lista.totalPaginas);

      if (lista.contenido.length > 0) {
        const previo = this.empleadoSeleccionado();
        const encontrado = lista.contenido.find((e) => e.id === previo?.id);
        this.empleadoSeleccionado.set(encontrado ?? lista.contenido[0]);
      } else {
        this.empleadoSeleccionado.set(null);
      }
    });
  }

  aplicarFiltros(): void {
    this.paginaActual.set(0);
    if (this.usandoDatosDemo()) {
      this.filtrarMockupLocal();
      return;
    }
    this.cargarDatos();
  }

  irAPagina(pagina1Based: number): void {
    const idx = pagina1Based - 1;
    if (idx < 0 || idx >= this.totalPaginas()) return;
    this.paginaActual.set(idx);
    if (!this.usandoDatosDemo()) {
      this.cargarDatos();
    }
  }

  seleccionarEmpleado(emp: EmpleadoFilaUI): void {
    this.empleadoSeleccionado.set(emp);
    this.menuFilaAbiertoId.set(null);
  }

  toggleMenuFila(id: number, event: Event): void {
    event.stopPropagation();
    this.menuFilaAbiertoId.update((prev) => (prev === id ? null : id));
  }

  // ==================== ACCIÓN 1: VER PERFIL ====================
  abrirModalPerfil(emp?: EmpleadoFilaUI): void {
    const objetivo = emp ?? this.empleadoSeleccionado();
    if (!objetivo) return;
    this.empleadoSeleccionado.set(objetivo);
    this.menuFilaAbiertoId.set(null);

    if (!this.usandoDatosDemo()) {
      this.empleadosService.obtenerEmpleadoPorId(objetivo.id).subscribe({
        next: (detalle) => this.empleadoSeleccionado.set({ ...objetivo, ...detalle }),
        error: (err) => this.manejarErrorApi(err),
      });
    }
    this.modalPerfilAbierto.set(true);
  }

  // ==================== ACCIÓN 2: NUEVO / EDITAR EMPLEADO ====================
  abrirModalNuevoEmpleado(): void {
    this.modoEdicion.set(false);
    this.formEmpleado.set({
      nombres: '',
      apellidos: '',
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      telefono: '',
      correo: '',
      contrasenaInicial: '',
      rol: 'PIZZERO',
      sucursalId: this.sucursalActivaId(),
      horaInicio: '12:00',
      horaFin: '21:00',
      fechaIngreso: this.obtenerFechaISO(0),
      pagoBaseTurno: 50,
      bonoPorEntrega: 3,
    });
    this.modalFormularioAbierto.set(true);
  }

  abrirModalEditarEmpleado(emp?: EmpleadoFilaUI): void {
    const objetivo = emp ?? this.empleadoSeleccionado();
    if (!objetivo) return;
    this.empleadoSeleccionado.set(objetivo);
    this.menuFilaAbiertoId.set(null);
    this.modoEdicion.set(true);

    const partes = objetivo.nombreCompleto.trim().split(' ');
    const nombres = partes.slice(0, Math.ceil(partes.length / 2)).join(' ');
    const apellidos = partes.slice(Math.ceil(partes.length / 2)).join(' ') || 'Empleado';

    this.formEmpleado.set({
      nombres,
      apellidos,
      tipoDocumento: 'DNI',
      numeroDocumento: objetivo.numeroDocumentoUI ?? '',
      telefono: objetivo.telefono.replace(/\s+/g, ''),
      correo: objetivo.correo,
      contrasenaInicial: '',
      rol: objetivo.rol === 'ADMINISTRADOR' ? 'PIZZERO' : objetivo.rol,
      sucursalId: objetivo.sucursalId,
      horaInicio: objetivo.horaInicio,
      horaFin: objetivo.horaFin,
      fechaIngreso: objetivo.fechaIngreso,
      pagoBaseTurno: objetivo.pagoBaseTurno,
      bonoPorEntrega: objetivo.bonoPorEntrega,
    });
    this.modalFormularioAbierto.set(true);
  }

  guardarEmpleado(): void {
    const f = this.formEmpleado();
    const payload: EmpleadoRequest = {
      nombres: f.nombres.trim(),
      apellidos: f.apellidos.trim(),
      tipoDocumento: f.tipoDocumento,
      numeroDocumento: f.numeroDocumento.trim(),
      telefono: f.telefono.replace(/\s+/g, ''),
      correo: f.correo.trim(),
      contrasenaInicial: f.contrasenaInicial.trim() || undefined,
      rol: f.rol,
      sucursalId: Number(f.sucursalId),
      horaInicio: f.horaInicio,
      horaFin: f.horaFin,
      fechaIngreso: f.fechaIngreso,
      pagoBaseTurno: Number(f.pagoBaseTurno),
      bonoPorEntrega: f.rol === 'MOTORIZADO' ? Number(f.bonoPorEntrega) : 0,
    };

    if (this.usandoDatosDemo()) {
      const nombreCompleto = `${payload.nombres} ${payload.apellidos}`;
      if (this.modoEdicion() && this.empleadoSeleccionado()) {
        const idEdit = this.empleadoSeleccionado()!.id;
        this.empleados.update((list) =>
          list.map((e) =>
            e.id === idEdit
              ? {
                  ...e,
                  nombreCompleto,
                  numeroDocumentoUI: payload.numeroDocumento,
                  telefono: payload.telefono,
                  correo: payload.correo,
                  rol: payload.rol,
                  horaInicio: payload.horaInicio,
                  horaFin: payload.horaFin,
                }
              : e
          )
        );
        this.mostrarToast('ok', `Empleado ${nombreCompleto} actualizado.`);
      } else {
        const nuevo: EmpleadoFilaUI = {
          id: Date.now(),
          usuarioId: Date.now() + 1,
          nombreCompleto,
          correo: payload.correo,
          telefono: payload.telefono,
          rol: payload.rol,
          sucursalId: payload.sucursalId,
          sucursalNombre: 'Sede Miraflores',
          estado: 'ACTIVO',
          horaInicio: payload.horaInicio,
          horaFin: payload.horaFin,
          fechaIngreso: payload.fechaIngreso,
          pagoBaseTurno: payload.pagoBaseTurno ?? 50,
          bonoPorEntrega: payload.bonoPorEntrega ?? 0,
          numeroDocumentoUI: payload.numeroDocumento,
          ultimoAccesoUI: 'Ahora',
        };
        this.empleados.update((list) => [nuevo, ...list]);
        this.empleadoSeleccionado.set(nuevo);
        this.mostrarToast('ok', `Empleado ${nombreCompleto} registrado.`);
      }
      this.modalFormularioAbierto.set(false);
      return;
    }

    const obs =
      this.modoEdicion() && this.empleadoSeleccionado()
        ? this.empleadosService.actualizarEmpleado(this.empleadoSeleccionado()!.id, payload)
        : this.empleadosService.crearEmpleado(payload);

    obs.subscribe({
      next: (guardado) => {
        this.modalFormularioAbierto.set(false);
        this.mostrarToast('ok', `Empleado ${guardado.nombreCompleto} guardado correctamente.`);
        this.cargarDatos();
      },
      error: (err) => this.manejarErrorApi(err),
    });
  }

  // ==================== ACCIÓN 3: CAMBIAR ESTADO ====================
  abrirModalEstado(emp?: EmpleadoFilaUI): void {
    const objetivo = emp ?? this.empleadoSeleccionado();
    if (!objetivo) return;
    this.empleadoSeleccionado.set(objetivo);
    this.menuFilaAbiertoId.set(null);
    this.estadoSeleccionado.set(objetivo.estado);
    this.modalEstadoAbierto.set(true);
  }

  confirmarCambioEstado(): void {
    const objetivo = this.empleadoSeleccionado();
    const nuevoEstado = this.estadoSeleccionado();
    if (!objetivo) return;

    if (this.usandoDatosDemo()) {
      this.empleados.update((list) =>
        list.map((e) => (e.id === objetivo.id ? { ...e, estado: nuevoEstado } : e))
      );
      this.empleadoSeleccionado.set({ ...objetivo, estado: nuevoEstado });
      this.modalEstadoAbierto.set(false);
      this.mostrarToast('ok', `Estado de ${objetivo.nombreCompleto} actualizado a ${this.etiquetaEstado(nuevoEstado)}.`);
      return;
    }

    this.empleadosService.cambiarEstado(objetivo.id, { estado: nuevoEstado }).subscribe({
      next: (actualizado) => {
        this.modalEstadoAbierto.set(false);
        this.mostrarToast('ok', `Estado actualizado a ${this.etiquetaEstado(actualizado.estado)}.`);
        this.cargarDatos();
      },
      error: (err) => this.manejarErrorApi(err),
    });
  }

  // ==================== ACCIÓN 4: ASIGNAR HORARIO ====================
  abrirModalHorario(emp?: EmpleadoFilaUI): void {
    const objetivo = emp ?? this.empleadoSeleccionado();
    if (!objetivo) return;
    this.empleadoSeleccionado.set(objetivo);
    this.menuFilaAbiertoId.set(null);
    this.formHorario.set({
      fecha: this.obtenerFechaISO(0),
      horaInicio: objetivo.horaInicio || '12:00',
      horaFin: objetivo.horaFin || '20:00',
      puesto: this.etiquetaRol(objetivo),
      sucursalId: objetivo.sucursalId || this.sucursalActivaId(),
    });
    this.modalHorarioAbierto.set(true);
  }

  confirmarAsignacionHorario(): void {
    const objetivo = this.empleadoSeleccionado();
    if (!objetivo) return;
    const req = this.formHorario();

    if (this.usandoDatosDemo()) {
      this.empleados.update((list) =>
        list.map((e) =>
          e.id === objetivo.id ? { ...e, horaInicio: req.horaInicio, horaFin: req.horaFin } : e
        )
      );
      this.modalHorarioAbierto.set(false);
      this.mostrarToast('ok', `Turno asignado a ${objetivo.nombreCompleto} (${req.horaInicio}–${req.horaFin}).`);
      return;
    }

    this.empleadosService.asignarHorario(objetivo.id, req).subscribe({
      next: (turno) => {
        this.modalHorarioAbierto.set(false);
        this.mostrarToast('ok', `Turno programado para ${turno.fecha} (${turno.horaInicio}–${turno.horaFin}).`);
        this.cargarDatos();
      },
      error: (err) => this.manejarErrorApi(err),
    });
  }

  // ==================== ACCIÓN 5: VER HISTORIAL / HORARIOS ====================
  abrirModalHistorial(emp?: EmpleadoFilaUI): void {
    const objetivo = emp ?? this.empleadoSeleccionado();
    if (!objetivo) return;
    this.empleadoSeleccionado.set(objetivo);
    this.menuFilaAbiertoId.set(null);
    this.modalHistorialAbierto.set(true);
    this.consultarTurnosEmpleado();
  }

  consultarTurnosEmpleado(): void {
    const objetivo = this.empleadoSeleccionado();
    if (!objetivo) return;

    if (this.usandoDatosDemo()) {
      this.turnosHistorial.set([
        {
          id: 1,
          empleadoId: objetivo.id,
          empleadoNombre: objetivo.nombreCompleto,
          fecha: '2026-10-02',
          horaInicio: objetivo.horaInicio,
          horaFin: objetivo.horaFin,
          estado: 'EN_CURSO',
          puesto: this.etiquetaRol(objetivo),
        },
        {
          id: 2,
          empleadoId: objetivo.id,
          empleadoNombre: objetivo.nombreCompleto,
          fecha: '2026-10-01',
          horaInicio: objetivo.horaInicio,
          horaFin: objetivo.horaFin,
          estado: 'FINALIZADO',
          puesto: this.etiquetaRol(objetivo),
        },
      ]);
      return;
    }

    this.empleadosService
      .obtenerTurnos(objetivo.id, this.filtroTurnosDesde(), this.filtroTurnosHasta())
      .subscribe({
        next: (turnos) => this.turnosHistorial.set(turnos),
        error: (err) => this.manejarErrorApi(err),
      });
  }

  exportarCSV(): void {
    const filas = this.empleados();
    if (!filas.length) return;

    const cabecera = ['ID', 'Nombre Completo', 'Correo', 'Cargo', 'Telefono', 'Horario', 'Estado'];
    const cuerpo = filas.map((e) => [
      e.id,
      `"${e.nombreCompleto}"`,
      e.correo,
      this.etiquetaRol(e),
      `"${e.telefono}"`,
      `${e.horaInicio}-${e.horaFin}`,
      this.etiquetaEstado(e.estado),
    ]);

    const csv = [cabecera.join(','), ...cuerpo.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `empleados-totos-pizza-${this.obtenerFechaISO(0)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.mostrarToast('ok', 'Directorio exportado en formato CSV.');
  }

  obtenerIniciales(nombreCompleto: string): string {
    const partes = nombreCompleto.trim().split(' ');
    return `${partes[0]?.[0] ?? ''}${partes[1]?.[0] ?? ''}`.toUpperCase();
  }

  etiquetaRol(emp: EmpleadoFilaUI): string {
    if (emp.cargoVisualEtiqueta) return emp.cargoVisualEtiqueta;
    const mapa: Record<Rol, string> = {
      ADMINISTRADOR: 'Administrador',
      PIZZERO: 'Cocinero',
      DESPACHADOR: 'Despachador',
      MOTORIZADO: 'Motorizado',
      CLIENTE: 'Cliente',
    };
    return mapa[emp.rol] ?? emp.rol;
  }

  claseRol(emp: EmpleadoFilaUI): string {
    const etiqueta = this.etiquetaRol(emp).toLowerCase();
    if (etiqueta.includes('admin')) return 'role-badge--admin';
    if (etiqueta.includes('vendedor') || etiqueta.includes('despach')) return 'role-badge--vendor';
    if (etiqueta.includes('cocin') || etiqueta.includes('pizzero')) return 'role-badge--cook';
    if (etiqueta.includes('repart')) return 'role-badge--courier';
    return 'role-badge--motorized';
  }

  etiquetaEstado(estado: EstadoEmpleado): string {
    const mapa: Record<EstadoEmpleado, string> = {
      ACTIVO: 'Activo',
      EN_TURNO: 'En turno',
      DISPONIBLE: 'Disponible',
      INACTIVO: 'Inactivo',
      CON_LICENCIA: 'Con licencia',
    };
    return mapa[estado] ?? estado;
  }

  private manejarErrorApi(err: { error?: ApiError }): void {
    const msg = err?.error?.mensaje ?? 'Ocurrió un error al comunicarse con el servidor.';
    this.mostrarToast('error', msg);
  }

  mostrarToast(tipo: 'ok' | 'error', texto: string): void {
    this.toastMensaje.set({ tipo, texto });
    setTimeout(() => this.toastMensaje.set(null), 4000);
  }

  private obtenerFechaISO(offsetDias: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDias);
    return d.toISOString().split('T')[0];
  }

  // ==================== DATOS DEMO IDÉNTICOS A LA IMAGEN ====================
  private readonly mockInicial: EmpleadoFilaUI[] = [
    {
      id: 1,
      usuarioId: 10,
      nombreCompleto: 'Andrea Mendoza',
      correo: 'andrea.mendoza@fornorosso.pe',
      telefono: '987 245 109',
      rol: 'ADMINISTRADOR',
      sucursalId: 1,
      sucursalNombre: 'Sede Miraflores',
      estado: 'ACTIVO',
      horaInicio: '09:00',
      horaFin: '18:00',
      fechaIngreso: '2024-03-15',
      pagoBaseTurno: 80,
      bonoPorEntrega: 0,
      numeroDocumentoUI: '72845109',
      ultimoAccesoUI: 'Ahora',
      cargoVisualEtiqueta: 'Administrador',
    },
    {
      id: 2,
      usuarioId: 11,
      nombreCompleto: 'Carlos Tapia',
      correo: 'carlos.tapia@fornorosso.pe',
      telefono: '965 872 410',
      rol: 'DESPACHADOR',
      sucursalId: 1,
      sucursalNombre: 'Sede Miraflores',
      estado: 'EN_TURNO',
      horaInicio: '12:00',
      horaFin: '21:00',
      fechaIngreso: '2025-01-10',
      pagoBaseTurno: 55,
      bonoPorEntrega: 0,
      numeroDocumentoUI: '70451283',
      ultimoAccesoUI: 'Hace 4 min',
      cargoVisualEtiqueta: 'Vendedor',
    },
    {
      id: 3,
      usuarioId: 12,
      nombreCompleto: 'Rosa Paredes',
      correo: 'rosa.paredes@fornorosso.pe',
      telefono: '944 381 226',
      rol: 'PIZZERO',
      sucursalId: 1,
      sucursalNombre: 'Sede Miraflores',
      estado: 'EN_TURNO',
      horaInicio: '14:00',
      horaFin: '22:30',
      fechaIngreso: '2025-02-01',
      pagoBaseTurno: 60,
      bonoPorEntrega: 0,
      numeroDocumentoUI: '71682904',
      ultimoAccesoUI: 'Hace 2 min',
      cargoVisualEtiqueta: 'Cocinero',
    },
    {
      id: 4,
      usuarioId: 13,
      nombreCompleto: 'Diego Mendoza',
      correo: 'diego.mendoza@fornorosso.pe',
      telefono: '986 402 719',
      rol: 'MOTORIZADO',
      sucursalId: 1,
      sucursalNombre: 'Sede Miraflores',
      estado: 'DISPONIBLE',
      horaInicio: '12:00',
      horaFin: '20:00',
      fechaIngreso: '2025-04-20',
      pagoBaseTurno: 50,
      bonoPorEntrega: 3,
      numeroDocumentoUI: '74820911',
      ultimoAccesoUI: 'Hace 1 min',
      cargoVisualEtiqueta: 'Repartidor',
    },
    {
      id: 5,
      usuarioId: 14,
      nombreCompleto: 'José Salinas',
      correo: 'jose.salinas@fornorosso.pe',
      telefono: '972 618 305',
      rol: 'MOTORIZADO',
      sucursalId: 1,
      sucursalNombre: 'Sede Miraflores',
      estado: 'INACTIVO',
      horaInicio: '18:00',
      horaFin: '23:00',
      fechaIngreso: '2025-05-11',
      pagoBaseTurno: 50,
      bonoPorEntrega: 3,
      numeroDocumentoUI: '70188342',
      ultimoAccesoUI: 'Ayer, 22:41',
      cargoVisualEtiqueta: 'Motorizado',
    },
  ];

  private cargarFallbackMockup(): void {
    this.usandoDatosDemo.set(true);
    this.empleados.set(this.mockInicial);
    this.totalElementos.set(27);
    this.totalPaginas.set(6);
    this.empleadoSeleccionado.set(this.mockInicial[3]); // Diego Mendoza seleccionado como en la imagen
  }

  private filtrarMockupLocal(): void {
    const q = this.filtroTexto().toLowerCase().trim();
    const rol = this.filtroRol();
    const est = this.filtroEstado();

    const filtrados = this.mockInicial.filter((e) => {
      const matchTexto =
        !q ||
        e.nombreCompleto.toLowerCase().includes(q) ||
        (e.numeroDocumentoUI?.includes(q) ?? false);
      const matchRol = !rol || e.rol === rol;
      const matchEst = !est || e.estado === est;
      return matchTexto && matchRol && matchEst;
    });

    this.empleados.set(filtrados);
    if (filtrados.length) this.empleadoSeleccionado.set(filtrados[0]);
  }
}