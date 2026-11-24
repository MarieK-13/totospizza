import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type AbstractControl, type ValidationErrors } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CircleDashed, LucideAngularModule, Pencil, Plus, Ruler, Wheat } from 'lucide-angular';
import type { TamanoPizzaRequest, TamanoPizzaResponse, TipoMasaRequest, TipoMasaResponse } from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { aplicarErrorApi } from '../../../../core/utils/form-errors';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelKpi } from '../../../../shared/components/panel-kpi/panel-kpi';
import { PanelModal } from '../../../../shared/components/panel-modal/panel-modal';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';

type Modal = 'masa' | 'tamano' | null;

/** El mínimo de personas no puede superar al máximo (regla PERSONAS_INVALIDAS del backend). */
function rangoPersonas(grupo: AbstractControl): ValidationErrors | null {
  const min = Number(grupo.get('personasMin')?.value);
  const max = Number(grupo.get('personasMax')?.value);
  return min && max && min > max ? { personas: { message: 'El mínimo no puede ser mayor que el máximo' } } : null;
}

@Component({
  selector: 'app-admin-masas',
  imports: [DecimalPipe, ReactiveFormsModule, LucideAngularModule, PanelAccionesDirective, PanelKpi, PanelModal, EstadoVacio, TextField],
  templateUrl: './admin-masas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMasasComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly cargando = signal(true);
  protected readonly masas = signal<readonly TipoMasaResponse[]>([]);
  protected readonly tamanos = signal<readonly TamanoPizzaResponse[]>([]);
  protected readonly modal = signal<Modal>(null);
  protected readonly masaSel = signal<TipoMasaResponse | null>(null);
  protected readonly tamanoSel = signal<TamanoPizzaResponse | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);

  protected readonly formMasa = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    recargo: ['0', [Validators.required, Validators.min(0)]],
    activa: [true],
  });

  protected readonly formTamano = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(40)]],
      diametroCm: ['30', [Validators.required, Validators.min(10), Validators.max(80)]],
      personasMin: ['1', [Validators.required, Validators.min(1), Validators.max(20)]],
      personasMax: ['2', [Validators.required, Validators.min(1), Validators.max(30)]],
      precioBase: ['0', [Validators.required, Validators.min(0)]],
      orden: ['0', [Validators.min(0), Validators.max(999)]],
      activo: [true],
    },
    { validators: rangoPersonas },
  );

  protected readonly masasOrdenadas = computed(() => [...this.masas()].sort((a, b) => a.recargo - b.recargo || a.nombre.localeCompare(b.nombre)));
  protected readonly tamanosOrdenados = computed(() => [...this.tamanos()].sort((a, b) => a.orden - b.orden || a.diametroCm - b.diametroCm));
  protected readonly masasActivas = computed(() => this.masas().filter((m) => m.activa).length);
  protected readonly tamanosActivos = computed(() => this.tamanos().filter((t) => t.activo).length);

  protected readonly Icons = { CircleDashed, Pencil, Plus, Ruler, Wheat };

  constructor() {
    forkJoin({ masas: this.api.tiposMasa(), tamanos: this.api.tamanos() })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe(({ masas, tamanos }) => {
        this.masas.set(masas);
        this.tamanos.set(tamanos);
      });
  }

  protected cerrar(): void {
    this.modal.set(null);
  }

  // ---- Masas ----
  protected abrirMasa(masa: TipoMasaResponse | null): void {
    this.masaSel.set(masa);
    this.formMasa.reset({ nombre: masa?.nombre ?? '', recargo: String(masa?.recargo ?? 0), activa: masa?.activa ?? true });
    this.abrir('masa');
  }

  protected guardarMasa(): void {
    if (this.guardando()) return;
    if (this.formMasa.invalid) {
      this.formMasa.markAllAsTouched();
      return;
    }
    const v = this.formMasa.getRawValue();
    const cuerpo: TipoMasaRequest = { nombre: v.nombre.trim(), recargo: Number(v.recargo), activa: v.activa };
    const actual = this.masaSel();
    this.guardando.set(true);
    (actual ? this.api.actualizarTipoMasa(actual.id, cuerpo) : this.api.crearTipoMasa(cuerpo))
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (guardada) => {
          this.masas.update((l) => (actual ? l.map((m) => (m.id === guardada.id ? guardada : m)) : [...l, guardada]));
          this.toast.success(actual ? 'Masa actualizada' : 'Masa creada', guardada.nombre);
          this.cerrar();
        },
        error: (e: unknown) => this.errorFormulario.set(aplicarErrorApi(this.formMasa, e)),
      });
  }

  protected alternarMasa(masa: TipoMasaResponse): void {
    this.api.activarTipoMasa(masa.id, !masa.activa).subscribe((act) => {
      this.masas.update((l) => l.map((m) => (m.id === act.id ? act : m)));
      this.toast.success(act.activa ? 'Masa disponible' : 'Masa desactivada', act.nombre);
    });
  }

  // ---- Tamaños ----
  protected abrirTamano(tamano: TamanoPizzaResponse | null): void {
    this.tamanoSel.set(tamano);
    const siguiente = Math.max(0, ...this.tamanos().map((t) => t.orden)) + 1;
    this.formTamano.reset({
      nombre: tamano?.nombre ?? '',
      diametroCm: String(tamano?.diametroCm ?? 30),
      personasMin: String(tamano?.personasMin ?? 1),
      personasMax: String(tamano?.personasMax ?? 2),
      precioBase: String(tamano?.precioBase ?? 0),
      orden: String(tamano?.orden ?? siguiente),
      activo: tamano?.activo ?? true,
    });
    this.abrir('tamano');
  }

  protected guardarTamano(): void {
    if (this.guardando()) return;
    if (this.formTamano.invalid) {
      this.formTamano.markAllAsTouched();
      return;
    }
    const v = this.formTamano.getRawValue();
    const cuerpo: TamanoPizzaRequest = {
      nombre: v.nombre.trim(),
      diametroCm: Number(v.diametroCm),
      personasMin: Number(v.personasMin),
      personasMax: Number(v.personasMax),
      precioBase: Number(v.precioBase),
      orden: Number(v.orden || 0),
      activo: v.activo,
    };
    const actual = this.tamanoSel();
    this.guardando.set(true);
    (actual ? this.api.actualizarTamano(actual.id, cuerpo) : this.api.crearTamano(cuerpo))
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (guardado) => {
          this.tamanos.update((l) => (actual ? l.map((t) => (t.id === guardado.id ? guardado : t)) : [...l, guardado]));
          this.toast.success(actual ? 'Tamaño actualizado' : 'Tamaño creado', guardado.nombre);
          this.cerrar();
        },
        error: (e: unknown) => this.errorFormulario.set(aplicarErrorApi(this.formTamano, e)),
      });
  }

  protected alternarTamano(tamano: TamanoPizzaResponse): void {
    this.api.activarTamano(tamano.id, !tamano.activo).subscribe((act) => {
      this.tamanos.update((l) => l.map((t) => (t.id === act.id ? act : t)));
      this.toast.success(act.activo ? 'Tamaño disponible' : 'Tamaño desactivado', act.nombre);
    });
  }

  private abrir(modal: Modal): void {
    this.errorFormulario.set(null);
    this.modal.set(modal);
  }
}
