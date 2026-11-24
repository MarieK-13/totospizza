import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Eye, EyeOff, Layers, LucideAngularModule, Pencil, Plus, Search, Trash2 } from 'lucide-angular';
import type { CategoriaRequest, CategoriaResponse } from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { aplicarErrorApi } from '../../../../core/utils/form-errors';
import { normalizar, valorDe } from '../../../../core/utils/texto';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelKpi } from '../../../../shared/components/panel-kpi/panel-kpi';
import { PanelModal } from '../../../../shared/components/panel-modal/panel-modal';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';

type Modal = 'formulario' | 'eliminar' | null;

@Component({
  selector: 'app-admin-categorias',
  imports: [ReactiveFormsModule, LucideAngularModule, PanelAccionesDirective, PanelKpi, PanelModal, EstadoVacio, TextField],
  templateUrl: './admin-categorias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriasComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly categorias = signal<readonly CategoriaResponse[]>([]);
  protected readonly cargando = signal(true);
  protected readonly busqueda = signal('');
  protected readonly modal = signal<Modal>(null);
  protected readonly seleccionada = signal<CategoriaResponse | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    orden: [0, [Validators.required, Validators.min(0), Validators.max(999)]],
    activa: [true],
  });

  protected readonly filtradas = computed(() => {
    const q = normalizar(this.busqueda());
    const ordenadas = [...this.categorias()].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));
    return q ? ordenadas.filter((c) => normalizar(c.nombre).includes(q)) : ordenadas;
  });
  protected readonly activas = computed(() => this.categorias().filter((c) => c.activa).length);

  protected readonly valor = valorDe;
  protected readonly Icons = { Layers, Plus, Search, Pencil, Trash2, Eye, EyeOff };

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.api
      .categorias()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe((lista) => this.categorias.set(lista));
  }

  protected abrirNueva(): void {
    const siguiente = Math.max(0, ...this.categorias().map((c) => c.orden)) + 1;
    this.seleccionada.set(null);
    this.form.reset({ nombre: '', orden: siguiente, activa: true });
    this.abrir('formulario');
  }

  protected abrirEdicion(categoria: CategoriaResponse): void {
    this.seleccionada.set(categoria);
    this.form.reset({ nombre: categoria.nombre, orden: categoria.orden, activa: categoria.activa });
    this.abrir('formulario');
  }

  protected abrirEliminar(categoria: CategoriaResponse): void {
    this.seleccionada.set(categoria);
    this.abrir('eliminar');
  }

  protected cerrar(): void {
    this.modal.set(null);
  }

  protected guardar(): void {
    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo: CategoriaRequest = { nombre: v.nombre.trim(), orden: Number(v.orden), activa: v.activa };
    const actual = this.seleccionada();
    this.guardando.set(true);
    this.errorFormulario.set(null);
    (actual ? this.api.actualizarCategoria(actual.id, cuerpo) : this.api.crearCategoria(cuerpo))
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (guardada) => {
          this.categorias.update((lista) => (actual ? lista.map((c) => (c.id === guardada.id ? guardada : c)) : [...lista, guardada]));
          this.toast.success(actual ? 'Categoría actualizada' : 'Categoría creada', guardada.nombre);
          this.cerrar();
        },
        error: (error: unknown) => this.errorFormulario.set(aplicarErrorApi(this.form, error)),
      });
  }

  protected alternarActiva(categoria: CategoriaResponse): void {
    this.api.activarCategoria(categoria.id, !categoria.activa).subscribe((actualizada) => {
      this.categorias.update((lista) => lista.map((c) => (c.id === actualizada.id ? actualizada : c)));
      this.toast.success(actualizada.activa ? 'Categoría visible en el menú' : 'Categoría oculta del menú', actualizada.nombre);
    });
  }

  protected eliminar(): void {
    const categoria = this.seleccionada();
    if (!categoria || this.guardando()) return;
    this.guardando.set(true);
    this.api
      .eliminarCategoria(categoria.id)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.categorias.update((lista) => lista.filter((c) => c.id !== categoria.id));
          this.toast.success('Categoría eliminada', categoria.nombre);
          this.cerrar();
        },
        error: () => this.cerrar(),
      });
  }

  private abrir(modal: Modal): void {
    this.errorFormulario.set(null);
    this.modal.set(modal);
  }
}
