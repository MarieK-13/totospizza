import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Eye, LucideAngularModule, Pencil, Pizza, Plus, Search, Star, Layers } from 'lucide-angular';
import type {
  CategoriaResponse,
  EtiquetaResponse,
  IngredienteResponse,
  ProductoDetalleResponse,
  ProductoRequest,
  ProductoResumenResponse,
  TamanoPizzaResponse,
} from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { aplicarErrorApi } from '../../../../core/utils/form-errors';
import { normalizar, textoONull, valorDe } from '../../../../core/utils/texto';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelKpi } from '../../../../shared/components/panel-kpi/panel-kpi';
import { PanelModal } from '../../../../shared/components/panel-modal/panel-modal';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';
import { claseEtiqueta, etiquetaTipoIngrediente, TIPOS_INGREDIENTE, tipoDeEtiqueta } from '../../shared/catalogo';
import { ImagenField } from '../../shared/imagen-field/imagen-field';

const TAMANO_PAGINA = 100;
const MAX_ETIQUETAS = 10;
const MAX_INGREDIENTES = 30;

type FiltroEstado = '' | 'disponibles' | 'agotados' | 'destacados';

/** Precio que el administrador escribe para cada tamaño ('' = ese tamaño no se vende). */
type PreciosPorTamano = Readonly<Partial<Record<number, string>>>;

@Component({
  selector: 'app-admin-productos',
  imports: [DecimalPipe, ReactiveFormsModule, LucideAngularModule, PanelAccionesDirective, PanelKpi, PanelModal, EstadoVacio, TextField, SelectField, ImagenField],
  templateUrl: './admin-productos.component.html',
  styleUrl: './admin-productos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductosComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  // ---- Listado ----
  protected readonly cargando = signal(true);
  protected readonly productos = signal<readonly ProductoResumenResponse[]>([]);
  protected readonly totalElementos = signal(0);
  private readonly pagina = signal(0);
  protected readonly hayMas = signal(false);
  protected readonly cargandoMas = signal(false);
  protected readonly busqueda = signal('');
  protected readonly filtroCategoria = signal('');
  protected readonly filtroEstado = signal<FiltroEstado>('');

  // ---- Catálogos del formulario ----
  protected readonly categorias = signal<readonly CategoriaResponse[]>([]);
  protected readonly etiquetas = signal<readonly EtiquetaResponse[]>([]);
  protected readonly ingredientes = signal<readonly IngredienteResponse[]>([]);
  protected readonly tamanos = signal<readonly TamanoPizzaResponse[]>([]);

  // ---- Formulario ----
  protected readonly modalAbierto = signal(false);
  protected readonly cargandoDetalle = signal(false);
  protected readonly editando = signal<ProductoDetalleResponse | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);
  protected readonly etiquetaIds = signal<ReadonlySet<number>>(new Set());
  protected readonly ingredienteIds = signal<ReadonlySet<number>>(new Set());
  protected readonly precios = signal<PreciosPorTamano>({});

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    categoriaId: ['', [Validators.required]],
    descripcion: ['', [Validators.maxLength(1000)]],
    imagenUrl: ['', [Validators.maxLength(500)]],
    precioBase: ['0', [Validators.required, Validators.min(0)]],
    requiereTamano: [false],
    disponible: [true],
    destacado: [false],
  });

  protected readonly filtrados = computed(() => {
    const q = normalizar(this.busqueda());
    const categoria = this.filtroCategoria();
    const estado = this.filtroEstado();
    return this.productos().filter(
      (p) =>
        (!q || normalizar(`${p.nombre} ${p.descripcion}`).includes(q)) &&
        (!categoria || p.categoria === categoria) &&
        (estado !== 'disponibles' || p.disponible) &&
        (estado !== 'agotados' || !p.disponible) &&
        (estado !== 'destacados' || p.destacado),
    );
  });

  protected readonly disponibles = computed(() => this.productos().filter((p) => p.disponible).length);
  protected readonly destacados = computed(() => this.productos().filter((p) => p.destacado).length);
  protected readonly nombresCategoria = computed(() => [...new Set(this.productos().map((p) => p.categoria))].sort());
  protected readonly opcionesCategoria = computed(() => [
    { valor: '', etiqueta: 'Elige una categoría' },
    ...this.categorias().map((c) => ({ valor: String(c.id), etiqueta: c.activa ? c.nombre : `${c.nombre} (oculta)` })),
  ]);
  protected readonly gruposEtiquetas = computed(() => {
    const todas = [...this.etiquetas()].sort((a, b) => a.nombre.localeCompare(b.nombre));
    return (['Alérgeno', 'Libre de', 'Rasgo'] as const)
      .map((tipo) => ({ tipo, items: todas.filter((e) => tipoDeEtiqueta(e) === tipo) }))
      .filter((g) => g.items.length);
  });
  protected readonly gruposIngredientes = computed(() =>
    TIPOS_INGREDIENTE.map((tipo) => ({
      tipo: etiquetaTipoIngrediente(tipo),
      items: this.ingredientes().filter((i) => i.tipo === tipo).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    })).filter((g) => g.items.length),
  );
  protected readonly tamanosOrdenados = computed(() => [...this.tamanos()].sort((a, b) => a.orden - b.orden || a.diametroCm - b.diametroCm));
  protected readonly requiereTamano = signal(false);

  protected readonly valor = valorDe;
  protected readonly claseEtiqueta = claseEtiqueta;
  protected readonly Icons = { Eye, Pencil, Pizza, Plus, Search, Star, Layers };

  constructor() {
    this.cargarPagina(true);
    forkJoin({
      categorias: this.api.categorias(),
      etiquetas: this.api.etiquetas(),
      ingredientes: this.api.ingredientes(),
      tamanos: this.api.tamanos(),
    }).subscribe((r) => {
      this.categorias.set(r.categorias);
      this.etiquetas.set(r.etiquetas);
      this.ingredientes.set(r.ingredientes);
      this.tamanos.set(r.tamanos);
    });
    this.form.controls.requiereTamano.valueChanges.subscribe((v) => this.requiereTamano.set(v));
  }

  protected cargarPagina(reiniciar = false): void {
    const pagina = reiniciar ? 0 : this.pagina() + 1;
    (reiniciar ? this.cargando : this.cargandoMas).set(true);
    this.api
      .productos({ pagina, tamano: TAMANO_PAGINA })
      .pipe(finalize(() => (reiniciar ? this.cargando : this.cargandoMas).set(false)))
      .subscribe((resp) => {
        this.productos.update((l) => (reiniciar ? resp.contenido : [...l, ...resp.contenido]));
        this.pagina.set(pagina);
        this.totalElementos.set(resp.totalElementos);
        this.hayMas.set(!resp.ultima);
      });
  }

  // ---- Acciones de fila ----
  protected alternarDisponible(producto: ProductoResumenResponse): void {
    this.api.disponibilidadProducto(producto.id, { disponible: !producto.disponible }).subscribe((act) => {
      this.reemplazar(act);
      this.toast.success(act.disponible ? 'Producto disponible' : 'Producto agotado', act.nombre);
    });
  }

  // ---- Formulario ----
  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form.reset({
      nombre: '',
      categoriaId: String(this.categorias()[0]?.id ?? ''),
      descripcion: '',
      imagenUrl: '',
      precioBase: '0',
      requiereTamano: false,
      disponible: true,
      destacado: false,
    });
    this.requiereTamano.set(false);
    this.etiquetaIds.set(new Set());
    this.ingredienteIds.set(new Set());
    this.precios.set(Object.fromEntries(this.tamanos().filter((t) => t.activo).map((t) => [t.id, String(t.precioBase)])));
    this.errorFormulario.set(null);
    this.modalAbierto.set(true);
  }

  protected abrirEdicion(producto: ProductoResumenResponse): void {
    this.errorFormulario.set(null);
    this.cargandoDetalle.set(true);
    this.api
      .producto(producto.id)
      .pipe(finalize(() => this.cargandoDetalle.set(false)))
      .subscribe((detalle) => {
        this.editando.set(detalle);
        this.form.reset({
          nombre: detalle.nombre,
          categoriaId: String(detalle.categoria.id),
          descripcion: detalle.descripcion ?? '',
          imagenUrl: detalle.imagenUrl ?? '',
          precioBase: String(detalle.precioBase),
          requiereTamano: detalle.requiereTamano,
          disponible: detalle.disponible,
          destacado: detalle.destacado,
        });
        this.requiereTamano.set(detalle.requiereTamano);
        this.etiquetaIds.set(new Set(detalle.etiquetas.map((e) => e.id)));
        this.ingredienteIds.set(new Set(detalle.ingredientes.map((i) => i.id)));
        this.precios.set(Object.fromEntries(detalle.precios.map((p) => [p.tamanoId, String(p.precio)])));
        this.modalAbierto.set(true);
      });
  }

  protected cerrar(): void {
    this.modalAbierto.set(false);
  }

  protected alternarSwitch(control: 'requiereTamano' | 'disponible' | 'destacado'): void {
    const c = this.form.controls[control];
    c.setValue(!c.value);
  }

  protected alternarEtiqueta(id: number): void {
    this.etiquetaIds.update((actual) => alternar(actual, id, MAX_ETIQUETAS, () => this.toast.warning('Máximo 10 etiquetas por producto')));
  }

  protected alternarIngrediente(id: number): void {
    this.ingredienteIds.update((actual) =>
      alternar(actual, id, MAX_INGREDIENTES, () => this.toast.warning('Máximo 30 ingredientes por producto')),
    );
  }

  protected incluidoTamano(id: number): boolean {
    return this.precios()[id] !== undefined;
  }

  protected alternarTamano(tamano: TamanoPizzaResponse): void {
    this.precios.update((actual) => {
      const copia: Partial<Record<number, string>> = { ...actual };
      if (copia[tamano.id] !== undefined) delete copia[tamano.id];
      else copia[tamano.id] = String(tamano.precioBase);
      return copia;
    });
  }

  protected cambiarPrecio(id: number, evento: Event): void {
    const valor = valorDe(evento);
    this.precios.update((actual) => ({ ...actual, [id]: valor }));
  }

  protected guardar(): void {
    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const precios = v.requiereTamano
      ? Object.entries(this.precios()).map(([tamanoId, precio]) => ({ tamanoId: Number(tamanoId), precio: Number(precio?.trim() || NaN) }))
      : [];
    if (v.requiereTamano && !precios.length) {
      this.errorFormulario.set('Indica el precio de al menos un tamaño.');
      return;
    }
    if (precios.some((p) => !Number.isFinite(p.precio) || p.precio < 0)) {
      this.errorFormulario.set('Revisa los precios por tamaño: deben ser números iguales o mayores a cero.');
      return;
    }
    const cuerpo: ProductoRequest = {
      categoriaId: Number(v.categoriaId),
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim(),
      imagenUrl: textoONull(v.imagenUrl),
      precioBase: Number(v.precioBase),
      requiereTamano: v.requiereTamano,
      disponible: v.disponible,
      destacado: v.destacado,
      etiquetaIds: [...this.etiquetaIds()],
      precios,
      ingredienteIds: [...this.ingredienteIds()],
    };
    const actual = this.editando();
    this.guardando.set(true);
    this.errorFormulario.set(null);
    (actual ? this.api.actualizarProducto(actual.id, cuerpo) : this.api.crearProducto(cuerpo))
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (guardado) => {
          if (actual) this.reemplazar(guardado);
          else this.cargarPagina(true);
          this.toast.success(actual ? 'Producto actualizado' : 'Producto creado', guardado.nombre);
          this.cerrar();
        },
        error: (e: unknown) => this.errorFormulario.set(aplicarErrorApi(this.form, e)),
      });
  }

  /** Actualiza la fila del listado con lo que devolvió el backend. */
  private reemplazar(detalle: ProductoDetalleResponse): void {
    const precios = detalle.precios.map((p) => p.precio);
    this.productos.update((lista) =>
      lista.map((p) =>
        p.id === detalle.id
          ? {
              ...p,
              nombre: detalle.nombre,
              slug: detalle.slug,
              descripcion: detalle.descripcion,
              imagenUrl: detalle.imagenUrl,
              precioDesde: precios.length ? Math.min(...precios) : detalle.precioBase,
              categoria: detalle.categoria.nombre,
              disponible: detalle.disponible,
              destacado: detalle.destacado,
              etiquetas: detalle.etiquetas,
            }
          : p,
      ),
    );
  }
}

function alternar(actual: ReadonlySet<number>, id: number, maximo: number, alExceder: () => void): ReadonlySet<number> {
  const copia = new Set(actual);
  if (copia.has(id)) copia.delete(id);
  else if (copia.size >= maximo) alExceder();
  else copia.add(id);
  return copia;
}
