import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { Clock, LucideAngularModule, MapPin, Pencil, Phone, Plus, Route, Store, Trash2, TriangleAlert } from 'lucide-angular';
import type { DiaSemana, SucursalRequest, SucursalResponse } from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { aplicarErrorApi } from '../../../../core/utils/form-errors';
import { phoneValidator } from '../../../../core/utils/form-validators';
import { ETIQUETA_ROL } from '../../../../core/utils/roles';
import { textoONull } from '../../../../core/utils/texto';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelKpi } from '../../../../shared/components/panel-kpi/panel-kpi';
import { PanelModal } from '../../../../shared/components/panel-modal/panel-modal';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';
import { ImagenField } from '../../shared/imagen-field/imagen-field';

const DIAS: readonly { dia: DiaSemana; etiqueta: string; corto: string }[] = [
  { dia: 'MONDAY', etiqueta: 'Lunes', corto: 'Lun' },
  { dia: 'TUESDAY', etiqueta: 'Martes', corto: 'Mar' },
  { dia: 'WEDNESDAY', etiqueta: 'Miércoles', corto: 'Mié' },
  { dia: 'THURSDAY', etiqueta: 'Jueves', corto: 'Jue' },
  { dia: 'FRIDAY', etiqueta: 'Viernes', corto: 'Vie' },
  { dia: 'SATURDAY', etiqueta: 'Sábado', corto: 'Sáb' },
  { dia: 'SUNDAY', etiqueta: 'Domingo', corto: 'Dom' },
];

const hhmm = (hora: string | null | undefined) => (hora ?? '').slice(0, 5);

@Component({
  selector: 'app-admin-sucursales',
  imports: [DecimalPipe, RouterLink, ReactiveFormsModule, LucideAngularModule, PanelAccionesDirective, PanelKpi, PanelModal, EstadoVacio, TextField, ImagenField],
  templateUrl: './admin-sucursales.component.html',
  styleUrl: './admin-sucursales.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSucursalesComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly cargando = signal(true);
  protected readonly sucursales = signal<readonly SucursalResponse[]>([]);
  protected readonly modalAbierto = signal(false);
  protected readonly editando = signal<SucursalResponse | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);

  protected readonly dias = DIAS;
  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.required, phoneValidator]],
    imagenUrl: ['', [Validators.maxLength(500)]],
    activa: [true],
    radioCoberturaKm: ['3.5', [Validators.required, Validators.min(0.5), Validators.max(10)]],
    direccion: this.fb.group({
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      referencia: ['', [Validators.maxLength(200)]],
      distrito: ['', [Validators.required, Validators.maxLength(80)]],
      latitud: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitud: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
    }),
    horarios: this.fb.array(DIAS.map(() => this.nuevoHorario())),
    zonas: this.fb.array([this.nuevaZona()]),
  });

  protected get horarios() {
    return this.form.controls.horarios;
  }

  protected get zonas() {
    return this.form.controls.zonas;
  }

  protected readonly ordenadas = computed(() => [...this.sucursales()].sort((a, b) => Number(b.activa) - Number(a.activa) || a.nombre.localeCompare(b.nombre)));
  protected readonly activas = computed(() => this.sucursales().filter((s) => s.activa).length);
  protected readonly abiertas = computed(() => this.sucursales().filter((s) => s.activa && s.abiertoAhora).length);
  protected readonly zonasTotales = computed(() => this.sucursales().reduce((a, s) => a + s.zonas.length, 0));

  protected readonly Icons = { Clock, MapPin, Pencil, Phone, Plus, Route, Store, Trash2, TriangleAlert };

  /** "pizzero y motorizado": roles sin nadie activo en la sede. */
  protected faltantes(s: SucursalResponse): string {
    const nombres = (s.personalFaltante ?? []).map((rol) => ETIQUETA_ROL[rol].toLowerCase());
    return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : (nombres[0] ?? '');
  }

  constructor() {
    this.api
      .sucursales()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe((lista) => this.sucursales.set(lista));
  }

  /** "Lun–Vie 11:00–23:00" a partir de los horarios del backend. */
  protected resumenHorario(s: SucursalResponse): string {
    const abiertos = DIAS.map((d) => ({ ...d, h: s.horarios.find((h) => h.diaSemana === d.dia) })).filter((d) => d.h && !d.h.cerrado);
    if (!abiertos.length) return 'Sin horario';
    const rangos = new Map<string, string[]>();
    for (const d of abiertos) {
      const clave = `${hhmm(d.h?.horaApertura)}–${hhmm(d.h?.horaCierre)}`;
      rangos.set(clave, [...(rangos.get(clave) ?? []), d.corto]);
    }
    return [...rangos.entries()].map(([horas, dias]) => `${dias.length > 2 ? `${dias[0]}–${dias.at(-1)}` : dias.join(', ')} ${horas}`).join(' · ');
  }

  protected mapa(s: SucursalResponse): string {
    return `https://www.google.com/maps?q=${s.direccion.latitud},${s.direccion.longitud}`;
  }

  protected alternarActiva(s: SucursalResponse): void {
    this.api.activarSucursal(s.id, !s.activa).subscribe((act) => {
      this.sucursales.update((l) => l.map((x) => (x.id === act.id ? act : x)));
      this.toast.success(act.activa ? 'Sede activada' : 'Sede desactivada', act.nombre);
    });
  }

  // ---- Formulario ----
  protected abrirNueva(): void {
    this.editando.set(null);
    this.prepararZonas(1);
    this.form.reset({
      nombre: '',
      telefono: '',
      imagenUrl: '',
      activa: true,
      radioCoberturaKm: '3.5',
      direccion: { direccion: '', referencia: '', distrito: '', latitud: '', longitud: '' },
      horarios: DIAS.map(() => ({ cerrado: false, horaApertura: '11:00', horaCierre: '23:00' })),
      zonas: [{ nombre: 'Zona 1', distanciaDesdeKm: '0', distanciaHastaKm: '2', costoEnvio: '0' }],
    });
    this.abrir();
  }

  protected abrirEdicion(s: SucursalResponse): void {
    this.editando.set(s);
    this.prepararZonas(Math.max(1, s.zonas.length));
    this.form.reset({
      nombre: s.nombre,
      telefono: s.telefono,
      imagenUrl: s.imagenUrl ?? '',
      activa: s.activa,
      radioCoberturaKm: String(s.radioCoberturaKm),
      direccion: {
        direccion: s.direccion.direccion,
        referencia: s.direccion.referencia ?? '',
        distrito: s.direccion.distrito,
        latitud: String(s.direccion.latitud),
        longitud: String(s.direccion.longitud),
      },
      horarios: DIAS.map((d) => {
        const h = s.horarios.find((x) => x.diaSemana === d.dia);
        return { cerrado: !h || h.cerrado, horaApertura: hhmm(h?.horaApertura) || '11:00', horaCierre: hhmm(h?.horaCierre) || '23:00' };
      }),
      zonas: s.zonas.length
        ? s.zonas.map((z) => ({
            nombre: z.nombre,
            distanciaDesdeKm: String(z.distanciaDesdeKm),
            distanciaHastaKm: String(z.distanciaHastaKm),
            costoEnvio: String(z.costoEnvio),
          }))
        : [{ nombre: 'Zona 1', distanciaDesdeKm: '0', distanciaHastaKm: String(s.radioCoberturaKm), costoEnvio: '0' }],
    });
    this.abrir();
  }

  protected alternarDia(indice: number): void {
    const control = this.horarios.at(indice).controls.cerrado;
    control.setValue(!control.value);
  }

  protected agregarZona(): void {
    if (this.zonas.length >= 10) return;
    const ultima = this.zonas.at(this.zonas.length - 1)?.getRawValue();
    const desde = ultima ? ultima.distanciaHastaKm : '0';
    this.zonas.push(this.nuevaZona());
    this.zonas.at(this.zonas.length - 1).reset({
      nombre: `Zona ${this.zonas.length}`,
      distanciaDesdeKm: desde,
      distanciaHastaKm: String(Number(desde) + 1),
      costoEnvio: '0',
    });
  }

  protected quitarZona(indice: number): void {
    this.zonas.removeAt(indice);
  }

  protected usarMiUbicacion(): void {
    if (!navigator.geolocation) {
      this.toast.warning('Tu navegador no comparte la ubicación');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.form.controls.direccion.patchValue({ latitud: coords.latitude.toFixed(6), longitud: coords.longitude.toFixed(6) });
        this.form.controls.direccion.markAsDirty();
      },
      () => this.toast.warning('No se pudo obtener la ubicación', 'Escribe la latitud y longitud a mano.'),
    );
  }

  protected cerrar(): void {
    this.modalAbierto.set(false);
  }

  protected guardar(): void {
    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorFormulario.set('Revisa los campos marcados.');
      return;
    }
    const v = this.form.getRawValue();
    if (v.activa && v.horarios.every((h) => h.cerrado)) {
      this.errorFormulario.set('Una sede activa necesita al menos un día abierto.');
      return;
    }
    if (v.horarios.some((h) => !h.cerrado && (!h.horaApertura || !h.horaCierre || h.horaApertura === h.horaCierre))) {
      this.errorFormulario.set('Cada día abierto necesita una hora de apertura y otra de cierre distintas.');
      return;
    }
    const cuerpo: SucursalRequest = {
      nombre: v.nombre.trim(),
      telefono: v.telefono.replace(/\s/g, ''),
      imagenUrl: textoONull(v.imagenUrl),
      activa: v.activa,
      radioCoberturaKm: Number(v.radioCoberturaKm),
      direccion: {
        direccion: v.direccion.direccion.trim(),
        referencia: textoONull(v.direccion.referencia),
        distrito: v.direccion.distrito.trim(),
        latitud: Number(v.direccion.latitud),
        longitud: Number(v.direccion.longitud),
      },
      horarios: v.horarios.map((h, i) => ({
        diaSemana: DIAS[i].dia,
        cerrado: h.cerrado,
        horaApertura: h.cerrado ? null : h.horaApertura,
        horaCierre: h.cerrado ? null : h.horaCierre,
      })),
      zonas: v.zonas.map((z) => ({
        nombre: z.nombre.trim(),
        distanciaDesdeKm: Number(z.distanciaDesdeKm),
        distanciaHastaKm: Number(z.distanciaHastaKm),
        costoEnvio: Number(z.costoEnvio),
        activa: true,
      })),
    };
    const actual = this.editando();
    this.guardando.set(true);
    this.errorFormulario.set(null);
    (actual ? this.api.actualizarSucursal(actual.id, cuerpo) : this.api.crearSucursal(cuerpo))
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (guardada) => {
          this.sucursales.update((l) => (actual ? l.map((x) => (x.id === guardada.id ? guardada : x)) : [...l, guardada]));
          this.toast.success(actual ? 'Sede actualizada' : 'Sede creada', guardada.nombre);
          this.cerrar();
        },
        error: (e: unknown) => this.errorFormulario.set(aplicarErrorApi(this.form, e)),
      });
  }

  private abrir(): void {
    this.errorFormulario.set(null);
    this.modalAbierto.set(true);
  }

  private prepararZonas(cantidad: number): void {
    this.zonas.clear();
    for (let i = 0; i < cantidad; i++) this.zonas.push(this.nuevaZona());
  }

  private nuevoHorario() {
    return this.fb.group({ cerrado: [false], horaApertura: ['11:00'], horaCierre: ['23:00'] });
  }

  private nuevaZona() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(60)]],
      distanciaDesdeKm: ['0', [Validators.required, Validators.min(0)]],
      distanciaHastaKm: ['1', [Validators.required, Validators.min(0)]],
      costoEnvio: ['0', [Validators.required, Validators.min(0)]],
    });
  }
}
