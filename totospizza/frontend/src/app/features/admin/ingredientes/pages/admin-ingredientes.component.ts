import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Carrot, Filter, LucideAngularModule, Pencil, Plus, Search, ShieldAlert, Tag, Trash2 } from 'lucide-angular';
import type {
  EtiquetaRequest,
  EtiquetaResponse,
  IngredienteRequest,
  IngredienteResponse,
  TipoIngrediente,
} from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { aplicarErrorApi } from '../../../../core/utils/form-errors';
import { normalizar, numeroONull, valorDe } from '../../../../core/utils/texto';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelKpi } from '../../../../shared/components/panel-kpi/panel-kpi';
import { PanelModal } from '../../../../shared/components/panel-modal/panel-modal';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';
import { TIPOS_INGREDIENTE, claseEtiqueta, etiquetaTipoIngrediente, tipoDeEtiqueta } from '../../shared/catalogo';

type Pestana = 'ingredientes' | 'etiquetas';
type Modal = 'ingrediente' | 'etiqueta' | 'eliminar-etiqueta' | null;

@Component({
  selector: 'app-admin-ingredientes',
  imports: [DecimalPipe, ReactiveFormsModule, LucideAngularModule, PanelAccionesDirective, PanelKpi, PanelModal, EstadoVacio, TextField, SelectField],
  templateUrl: './admin-ingredientes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIngredientesComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly pestana = signal<Pestana>('ingredientes');
  protected readonly cargando = signal(true);
  protected readonly ingredientes = signal<readonly IngredienteResponse[]>([]);
  protected readonly etiquetas = signal<readonly EtiquetaResponse[]>([]);
  protected readonly busqueda = signal('');
  protected readonly filtroTipo = signal<TipoIngrediente | ''>('');

  protected readonly modal = signal<Modal>(null);
  protected readonly ingredienteSel = signal<IngredienteResponse | null>(null);
  protected readonly etiquetaSel = signal<EtiquetaResponse | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);

  protected readonly tipos = TIPOS_INGREDIENTE;
  protected readonly opcionesTipo = TIPOS_INGREDIENTE.map((t) => ({ valor: t, etiqueta: etiquetaTipoIngrediente(t) }));

  protected readonly formIngrediente = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    tipo: ['OTRO' as TipoIngrediente, [Validators.required]],
    precioExtra: ['0', [Validators.required, Validators.min(0)]],
    costoOperativoFijo: ['', [Validators.min(0)]],
    disponible: [true],
  });

  protected readonly formEtiqueta = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    esFiltro: [true],
  });

  protected readonly ingredientesFiltrados = computed(() => {
    const q = normalizar(this.busqueda());
    const tipo = this.filtroTipo();
    return [...this.ingredientes()]
      .filter((i) => (!tipo || i.tipo === tipo) && (!q || normalizar(i.nombre).includes(q)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  protected readonly etiquetasFiltradas = computed(() => {
    const q = normalizar(this.busqueda());
    return [...this.etiquetas()]
      .filter((e) => !q || normalizar(e.nombre).includes(q))
      .sort((a, b) => tipoDeEtiqueta(a).localeCompare(tipoDeEtiqueta(b)) || a.nombre.localeCompare(b.nombre));
  });

  protected readonly disponibles = computed(() => this.ingredientes().filter((i) => i.disponible).length);
  protected readonly alergenos = computed(() => this.etiquetas().filter((e) => tipoDeEtiqueta(e) !== 'Rasgo').length);
  protected readonly filtrosMenu = computed(() => this.etiquetas().filter((e) => e.esFiltro).length);

  protected readonly valor = valorDe;
  protected readonly tipoDeEtiqueta = tipoDeEtiqueta;
  protected readonly claseEtiqueta = claseEtiqueta;
  protected readonly etiquetaTipo = etiquetaTipoIngrediente;
  protected readonly Icons = { Carrot, Filter, Pencil, Plus, Search, ShieldAlert, Tag, Trash2 };

  constructor() {
    forkJoin({ ingredientes: this.api.ingredientes(), etiquetas: this.api.etiquetas() })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe(({ ingredientes, etiquetas }) => {
        this.ingredientes.set(ingredientes);
        this.etiquetas.set(etiquetas);
      });
  }

  protected cambiarPestana(pestana: Pestana): void {
    this.pestana.set(pestana);
    this.busqueda.set('');
  }

  protected nuevo(): void {
    if (this.pestana() === 'ingredientes') this.abrirIngrediente(null);
    else this.abrirEtiqueta(null);
  }

  protected cerrar(): void {
    this.modal.set(null);
  }

  // ---- Ingredientes ----
  protected abrirIngrediente(ingrediente: IngredienteResponse | null): void {
    this.ingredienteSel.set(ingrediente);
    this.formIngrediente.reset({
      nombre: ingrediente?.nombre ?? '',
      tipo: ingrediente?.tipo ?? 'OTRO',
      precioExtra: String(ingrediente?.precioExtra ?? 0),
      costoOperativoFijo: '',
      disponible: ingrediente?.disponible ?? true,
    });
    this.abrir('ingrediente');
  }

  protected guardarIngrediente(): void {
    if (this.guardando()) return;
    if (this.formIngrediente.invalid) {
      this.formIngrediente.markAllAsTouched();
      return;
    }
    const v = this.formIngrediente.getRawValue();
    const cuerpo: IngredienteRequest = {
      nombre: v.nombre.trim(),
      tipo: v.tipo,
      precioExtra: Number(v.precioExtra),
      costoOperativoFijo: numeroONull(v.costoOperativoFijo),
      disponible: v.disponible,
    };
    const actual = this.ingredienteSel();
    this.guardando.set(true);
    (actual ? this.api.actualizarIngrediente(actual.id, cuerpo) : this.api.crearIngrediente(cuerpo))
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (guardado) => {
          this.ingredientes.update((l) => (actual ? l.map((i) => (i.id === guardado.id ? guardado : i)) : [...l, guardado]));
          this.toast.success(actual ? 'Ingrediente actualizado' : 'Ingrediente creado', guardado.nombre);
          this.cerrar();
        },
        error: (e: unknown) => this.errorFormulario.set(aplicarErrorApi(this.formIngrediente, e)),
      });
  }

  protected alternarDisponible(ingrediente: IngredienteResponse): void {
    this.api.disponibilidadIngrediente(ingrediente.id, { disponible: !ingrediente.disponible }).subscribe((act) => {
      this.ingredientes.update((l) => l.map((i) => (i.id === act.id ? act : i)));
      this.toast.success(act.disponible ? 'Ingrediente disponible' : 'Ingrediente agotado', act.nombre);
    });
  }

  // ---- Etiquetas ----
  protected abrirEtiqueta(etiqueta: EtiquetaResponse | null): void {
    this.etiquetaSel.set(etiqueta);
    this.formEtiqueta.reset({ nombre: etiqueta?.nombre ?? '', esFiltro: etiqueta?.esFiltro ?? true });
    this.abrir('etiqueta');
  }

  protected usarPrefijo(prefijo: string): void {
    const actual = this.formEtiqueta.controls.nombre.value.replace(/^(contiene|sin)\s+/i, '');
    this.formEtiqueta.controls.nombre.setValue(`${prefijo} ${actual}`.trim());
    this.formEtiqueta.controls.nombre.markAsDirty();
  }

  protected guardarEtiqueta(): void {
    if (this.guardando()) return;
    if (this.formEtiqueta.invalid) {
      this.formEtiqueta.markAllAsTouched();
      return;
    }
    const v = this.formEtiqueta.getRawValue();
    const cuerpo: EtiquetaRequest = { nombre: v.nombre.trim(), esFiltro: v.esFiltro };
    const actual = this.etiquetaSel();
    this.guardando.set(true);
    (actual ? this.api.actualizarEtiqueta(actual.id, cuerpo) : this.api.crearEtiqueta(cuerpo))
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (guardada) => {
          this.etiquetas.update((l) => (actual ? l.map((e) => (e.id === guardada.id ? guardada : e)) : [...l, guardada]));
          this.toast.success(actual ? 'Etiqueta actualizada' : 'Etiqueta creada', guardada.nombre);
          this.cerrar();
        },
        error: (e: unknown) => this.errorFormulario.set(aplicarErrorApi(this.formEtiqueta, e)),
      });
  }

  protected pedirEliminarEtiqueta(etiqueta: EtiquetaResponse): void {
    this.etiquetaSel.set(etiqueta);
    this.abrir('eliminar-etiqueta');
  }

  protected eliminarEtiqueta(): void {
    const etiqueta = this.etiquetaSel();
    if (!etiqueta || this.guardando()) return;
    this.guardando.set(true);
    this.api
      .eliminarEtiqueta(etiqueta.id)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe(() => {
        this.etiquetas.update((l) => l.filter((e) => e.id !== etiqueta.id));
        this.toast.success('Etiqueta eliminada', etiqueta.nombre);
        this.cerrar();
      });
  }

  private abrir(modal: Modal): void {
    this.errorFormulario.set(null);
    this.modal.set(modal);
  }
}
