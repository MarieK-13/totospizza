import { DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize, startWith } from 'rxjs/operators';
import type {
  EmpleadoRequest,
  EmpleadoResponse,
  EstadoEmpleado,
  EstadoTurno,
  ResumenEmpleadosResponse,
  Rol,
  SucursalResponse,
  TipoDocumento,
  TurnoResponse,
} from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { esApiException } from '../../../../core/utils/api-exception';
import { OPCIONES_DOCUMENTO, documentoValidator } from '../../../../core/utils/documento';
import { fechaISO, formatearFecha } from '../../../../core/utils/fechas';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { passwordValidator, phoneValidator } from '../../../../core/utils/form-validators';
import { ETIQUETA_ROL, iniciales } from '../../../../core/utils/roles';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';

const TAMANO_PAGINA = 8;
type RolOperativo = Exclude<Rol, 'CLIENTE' | 'ADMINISTRADOR'>;

const ETIQUETA_ESTADO: Readonly<Record<EstadoEmpleado, string>> = {
  ACTIVO: 'Activo',
  EN_TURNO: 'En turno',
  DISPONIBLE: 'Disponible',
  INACTIVO: 'Inactivo',
  CON_LICENCIA: 'Con licencia',
};
const ETIQUETA_TURNO: Readonly<Record<EstadoTurno, string>> = {
  PROGRAMADO: 'Programado',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado (no asistió)',
};
const CLASE_ROL: Readonly<Record<Rol, string>> = {
  ADMINISTRADOR: 'role-badge--admin',
  PIZZERO: 'role-badge--cook',
  DESPACHADOR: 'role-badge--vendor',
  MOTORIZADO: 'role-badge--motorized',
  CLIENTE: 'role-badge--admin',
};
const RESUMEN_VACIO: ResumenEmpleadosResponse = { total: 0, activos: 0, enTurno: 0, disponibles: 0, inactivos: 0, conLicencia: 0 };

import { Users } from 'lucide-angular';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
@Component({
  selector: 'app-admin-empleados',
  imports: [DecimalPipe, NgClass, ReactiveFormsModule, TextField, SelectField, PanelAccionesDirective, EstadoVacio],
  templateUrl: './admin-empleados.component.html',
  styleUrls: ['./admin-empleados.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEmpleadosComponent {
  protected readonly IconoEquipo = Users;

  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly estados = Object.keys(ETIQUETA_ESTADO) as EstadoEmpleado[];
  protected readonly opcionesDocumento = OPCIONES_DOCUMENTO;
  protected readonly opcionesRol = (['PIZZERO', 'DESPACHADOR', 'MOTORIZADO'] as const).map((valor) => ({ valor, etiqueta: ETIQUETA_ROL[valor] }));
  protected readonly hoy = fechaISO(0);

  protected readonly sucursales = signal<readonly SucursalResponse[]>([]);
  protected readonly sucursalId = signal<number | null>(null);
  protected readonly opcionesSucursal = computed(() => this.sucursales().map((s) => ({ valor: String(s.id), etiqueta: s.nombre })));
  protected readonly resumen = signal<ResumenEmpleadosResponse>(RESUMEN_VACIO);

  protected readonly filtroTexto = signal('');
  protected readonly filtroRol = signal<Rol | ''>('');
  protected readonly filtroEstado = signal<EstadoEmpleado | ''>('');
  protected readonly paginaActual = signal(0);
  protected readonly totalElementos = signal(0);
  protected readonly totalPaginas = signal(0);
  protected readonly cargando = signal(true);
  protected readonly empleados = signal<readonly EmpleadoResponse[]>([]);
  protected readonly seleccionado = signal<EmpleadoResponse | null>(null);
  protected readonly menuFilaAbiertoId = signal<number | null>(null);

  protected readonly modal = signal<'formulario' | 'perfil' | 'estado' | 'horario' | 'historial' | null>(null);
  protected readonly modoEdicion = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);
  protected readonly estadoElegido = signal<EstadoEmpleado>('ACTIVO');
  protected readonly turnos = signal<readonly TurnoResponse[]>([]);
  protected readonly cancelandoTurnoId = signal<number | null>(null);
  protected readonly cargandoTurnos = signal(false);
  protected readonly turnosDesde = signal(fechaISO(-7));
  protected readonly turnosHasta = signal(fechaISO(7));

  protected readonly form = this.fb.group({
    nombres: ['', [Validators.required, Validators.maxLength(80)]],
    apellidos: ['', [Validators.required, Validators.maxLength(80)]],
    tipoDocumento: ['DNI' as TipoDocumento, [Validators.required]],
    numeroDocumento: ['', [Validators.required, documentoValidator()]],
    telefono: ['', [Validators.required, phoneValidator]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    contrasenaInicial: ['', [passwordValidator, Validators.maxLength(72)]],
    rol: ['PIZZERO' as RolOperativo, [Validators.required]],
    sucursalId: ['', [Validators.required]],
    horaInicio: ['12:00', [Validators.required]],
    horaFin: ['21:00', [Validators.required]],
    fechaIngreso: [fechaISO(0), [Validators.required]],
    pagoBaseTurno: ['50', [Validators.min(0)]],
    bonoPorEntrega: ['3', [Validators.min(0)]],
  });
  protected readonly rolFormulario = toSignal(this.form.controls.rol.valueChanges.pipe(startWith(this.form.controls.rol.value)), {
    requireSync: true,
  });

  protected readonly formHorario = this.fb.group({
    fecha: [fechaISO(0), [Validators.required]],
    horaInicio: ['12:00', [Validators.required]],
    horaFin: ['20:00', [Validators.required]],
    puesto: ['', [Validators.maxLength(60)]],
  });

  protected readonly porcentajeEnTurno = computed(() => {
    const r = this.resumen();
    return r.activos ? Math.round((r.enTurno / r.activos) * 100) : 0;
  });
  protected readonly porcentajeInactivos = computed(() => {
    const r = this.resumen();
    return r.total ? Math.round((r.inactivos / r.total) * 1000) / 10 : 0;
  });
  protected readonly paginasVisibles = computed(() => {
    const actual = this.paginaActual() + 1;
    const total = Math.max(this.totalPaginas(), 1);
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 2) return [1, 2, 3];
    if (actual >= total - 1) return [total - 2, total - 1, total];
    return [actual - 1, actual, actual + 1];
  });

  constructor() {
    this.form.controls.tipoDocumento.valueChanges.subscribe(() => this.form.controls.numeroDocumento.updateValueAndValidity());
    this.api.sucursales().subscribe((lista) => {
      this.sucursales.set(lista);
      this.sucursalId.set(lista[0]?.id ?? null);
      this.cargarDatos();
    });
  }

  // ---- Etiquetas ----
  protected etiquetaRol(rol: Rol): string {
    return ETIQUETA_ROL[rol];
  }
  protected claseRol(rol: Rol): string {
    return CLASE_ROL[rol];
  }
  protected etiquetaEstado(estado: EstadoEmpleado): string {
    return ETIQUETA_ESTADO[estado];
  }
  protected etiquetaTurno(estado: EstadoTurno): string {
    return ETIQUETA_TURNO[estado];
  }
  protected inicialesDe(emp: EmpleadoResponse): string {
    return iniciales(emp.nombres ?? emp.nombreCompleto, emp.apellidos ?? '');
  }
  protected fecha(iso: string): string {
    return formatearFecha(`${iso}T12:00:00`);
  }
  protected valor(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
  }

  // ---- Listado ----
  protected cargarDatos(): void {
    const sucursalId = this.sucursalId();
    if (sucursalId === null) {
      this.cargando.set(false);
      return;
    }
    this.cargando.set(true);
    forkJoin({
      resumen: this.api.resumenEmpleados(sucursalId),
      pagina: this.api.empleados({
        sucursalId,
        rol: this.filtroRol() || undefined,
        estado: this.filtroEstado() || undefined,
        q: this.filtroTexto().trim() || undefined,
        pagina: this.paginaActual(),
        tamano: TAMANO_PAGINA,
      }),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe(({ resumen, pagina }) => {
        this.resumen.set(resumen);
        this.empleados.set(pagina.contenido);
        this.totalElementos.set(pagina.totalElementos);
        this.totalPaginas.set(pagina.totalPaginas);
        const previo = this.seleccionado();
        this.seleccionado.set(pagina.contenido.find((e) => e.id === previo?.id) ?? pagina.contenido[0] ?? null);
      });
  }

  protected cambiarSucursal(evento: Event): void {
    this.sucursalId.set(Number(this.valor(evento)));
    this.aplicarFiltros();
  }

  protected aplicarFiltros(): void {
    this.paginaActual.set(0);
    this.cargarDatos();
  }

  protected irAPagina(numero: number): void {
    const indice = numero - 1;
    if (indice < 0 || indice >= this.totalPaginas() || indice === this.paginaActual()) return;
    this.paginaActual.set(indice);
    this.cargarDatos();
  }

  protected seleccionar(emp: EmpleadoResponse): void {
    this.seleccionado.set(emp);
    this.menuFilaAbiertoId.set(null);
  }

  protected alternarMenuFila(id: number, evento: Event): void {
    evento.stopPropagation();
    this.menuFilaAbiertoId.update((actual) => (actual === id ? null : id));
  }

  protected cerrarModal(): void {
    if (!this.guardando()) this.modal.set(null);
  }

  // ---- Perfil ----
  protected abrirPerfil(emp: EmpleadoResponse): void {
    this.seleccionar(emp);
    this.modal.set('perfil');
  }

  // ---- Crear / editar ----
  protected abrirNuevo(): void {
    this.modoEdicion.set(false);
    this.errorFormulario.set(null);
    this.form.reset({ sucursalId: String(this.sucursalId() ?? ''), fechaIngreso: fechaISO(0) });
    this.form.controls.contrasenaInicial.addValidators(Validators.required);
    this.form.controls.contrasenaInicial.updateValueAndValidity();
    this.modal.set('formulario');
  }

  protected abrirEdicion(emp: EmpleadoResponse): void {
    this.seleccionar(emp);
    this.modoEdicion.set(true);
    this.errorFormulario.set(null);
    this.form.reset({
      nombres: emp.nombres,
      apellidos: emp.apellidos,
      tipoDocumento: emp.tipoDocumento ?? 'DNI',
      numeroDocumento: emp.numeroDocumento ?? '',
      telefono: emp.telefono,
      correo: emp.correo,
      contrasenaInicial: '',
      rol: emp.rol as RolOperativo,
      sucursalId: String(emp.sucursalId),
      horaInicio: emp.horaInicio.slice(0, 5),
      horaFin: emp.horaFin.slice(0, 5),
      fechaIngreso: emp.fechaIngreso,
      pagoBaseTurno: String(emp.pagoBaseTurno ?? 0),
      bonoPorEntrega: String(emp.bonoPorEntrega ?? 0),
    });
    this.form.controls.contrasenaInicial.removeValidators(Validators.required);
    this.form.controls.contrasenaInicial.updateValueAndValidity();
    this.modal.set('formulario');
  }

  protected guardarEmpleado(): void {
    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo: EmpleadoRequest = {
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      tipoDocumento: v.tipoDocumento,
      numeroDocumento: v.numeroDocumento.trim(),
      telefono: v.telefono.replace(/\s/g, ''),
      correo: v.correo.trim(),
      contrasenaInicial: v.contrasenaInicial || null,
      rol: v.rol,
      sucursalId: Number(v.sucursalId),
      horaInicio: v.horaInicio,
      horaFin: v.horaFin,
      fechaIngreso: v.fechaIngreso,
      pagoBaseTurno: v.pagoBaseTurno === '' ? null : Number(v.pagoBaseTurno),
      bonoPorEntrega: v.rol === 'MOTORIZADO' && v.bonoPorEntrega !== '' ? Number(v.bonoPorEntrega) : null,
    };
    const editado = this.modoEdicion() ? this.seleccionado() : null;
    const peticion = editado ? this.api.actualizarEmpleado(editado.id, cuerpo) : this.api.crearEmpleado(cuerpo);

    this.guardando.set(true);
    this.errorFormulario.set(null);
    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (emp) => {
        this.modal.set(null);
        this.seleccionado.set(emp);
        this.toast.success(editado ? 'Empleado actualizado' : 'Empleado registrado', emp.nombreCompleto);
        this.cargarDatos();
      },
      error: (error: unknown) => {
        if (esApiException(error) && error.errores.length > 0) {
          const sueltos = aplicarErroresDeCampo(this.form, error.errores);
          this.errorFormulario.set(sueltos.length ? sueltos.join(' ') : 'Revisa los campos marcados.');
        }
      },
    });
  }

  // ---- Estado ----
  protected abrirEstado(emp: EmpleadoResponse): void {
    this.seleccionar(emp);
    this.estadoElegido.set(emp.estado);
    this.modal.set('estado');
  }

  protected confirmarEstado(): void {
    const emp = this.seleccionado();
    if (!emp || this.guardando()) return;
    this.guardando.set(true);
    this.api
      .cambiarEstadoEmpleado(emp.id, this.estadoElegido())
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe((actualizado) => {
        this.modal.set(null);
        this.toast.success('Estado actualizado', `${actualizado.nombreCompleto}: ${this.etiquetaEstado(actualizado.estado)}.`);
        this.cargarDatos();
      });
  }

  // ---- Turnos ----
  protected abrirHorario(emp: EmpleadoResponse): void {
    this.seleccionar(emp);
    this.formHorario.reset({ fecha: fechaISO(0), horaInicio: emp.horaInicio.slice(0, 5), horaFin: emp.horaFin.slice(0, 5), puesto: '' });
    this.modal.set('horario');
  }

  protected asignarHorario(): void {
    const emp = this.seleccionado();
    if (!emp || this.guardando()) return;
    if (this.formHorario.invalid) {
      this.formHorario.markAllAsTouched();
      return;
    }
    const v = this.formHorario.getRawValue();
    this.guardando.set(true);
    this.api
      .asignarHorario(emp.id, { ...v, puesto: v.puesto.trim() || null, sucursalId: emp.sucursalId })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe((turno) => {
        this.modal.set(null);
        this.toast.success('Turno asignado', `${emp.nombreCompleto} · ${this.fecha(turno.fecha)} de ${turno.horaInicio.slice(0, 5)} a ${turno.horaFin.slice(0, 5)}.`);
      });
  }

  protected abrirHistorial(emp: EmpleadoResponse | null = this.seleccionado()): void {
    if (!emp) return;
    this.seleccionar(emp);
    this.modal.set('historial');
    this.consultarTurnos();
  }

  protected cancelarTurno(turno: TurnoResponse): void {
    const emp = this.seleccionado();
    if (!emp || this.cancelandoTurnoId() !== null) return;
    this.cancelandoTurnoId.set(turno.id);
    this.api
      .cancelarTurno(emp.id, turno.id)
      .pipe(finalize(() => this.cancelandoTurnoId.set(null)))
      .subscribe((actualizado) => {
        this.turnos.update((lista) => lista.map((t) => (t.id === actualizado.id ? actualizado : t)));
        this.toast.success('Turno cancelado', 'Ya no cuenta para el pago base.');
      });
  }

  protected consultarTurnos(): void {
    const emp = this.seleccionado();
    if (!emp) return;
    this.cargandoTurnos.set(true);
    this.api
      .turnos(emp.id, this.turnosDesde(), this.turnosHasta())
      .pipe(finalize(() => this.cargandoTurnos.set(false)))
      .subscribe({ next: (lista) => this.turnos.set(lista), error: () => this.turnos.set([]) });
  }

  // ---- Exportar ----
  protected exportarCSV(): void {
    const filas = this.empleados();
    if (!filas.length) return;
    const celda = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      ['Nombre', 'Documento', 'Correo', 'Cargo', 'Teléfono', 'Horario', 'Estado', 'Sede'],
      ...filas.map((e) => [
        e.nombreCompleto,
        e.numeroDocumento,
        e.correo,
        this.etiquetaRol(e.rol),
        e.telefono,
        `${e.horaInicio.slice(0, 5)}-${e.horaFin.slice(0, 5)}`,
        this.etiquetaEstado(e.estado),
        e.sucursalNombre,
      ]),
    ]
      .map((fila) => fila.map(celda).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `empleados-totos-pizza-${this.hoy}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
