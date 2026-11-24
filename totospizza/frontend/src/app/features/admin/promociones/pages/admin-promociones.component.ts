import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type AbstractControl, type ValidationErrors } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CalendarClock, LucideAngularModule, Megaphone, Pencil, Plus, Search, Tag, TrendingDown, Trash2 } from 'lucide-angular';
import type {
  ColorPromocion,
  ProductoResumenResponse,
  PromocionAdminResponse,
  PromocionRequest,
  TamanoPizzaResponse,
  TipoPromocion,
} from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { aInputFechaHora, deInputFechaHora, formatearFechaHora } from '../../../../core/utils/fechas';
import { aplicarErrorApi } from '../../../../core/utils/form-errors';
import { normalizar, numeroONull, textoONull, valorDe } from '../../../../core/utils/texto';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelKpi } from '../../../../shared/components/panel-kpi/panel-kpi';
import { PanelModal } from '../../../../shared/components/panel-modal/panel-modal';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';
import { COLORES_PROMOCION, TIPOS_PROMOCION } from '../../shared/catalogo';
import { ImagenField } from '../../shared/imagen-field/imagen-field';

type Vista = 'todas' | 'activas' | 'perdida';

interface ValoresItem {
  readonly productoId: string;
  readonly tamanoId: string;
  readonly cantidad: string;
}

interface ValoresPromocion {
  readonly titulo: string;
  readonly tipo: TipoPromocion;
  readonly etiqueta: string;
  readonly descripcion: string;
  readonly precioPromocional: string;
  readonly precioAnterior: string;
  readonly costoEstimado: string;
  readonly imagenUrl: string;
  readonly colorFondo: ColorPromocion;
  readonly condiciones: string;
  readonly vigenteDesde: string;
  readonly vigenteHasta: string;
  readonly orden: string;
  readonly activa: boolean;
}
type EstadoVigencia = 'Programada' | 'Vigente' | 'Vencida';

/** Una promoción da pérdida cuando es oferta flash y su precio no cubre el costo estimado. */
export function enPerdida(p: Pick<PromocionAdminResponse, 'tipo' | 'costoEstimado' | 'precioPromocional'>): boolean {
  return p.tipo === 'OFERTA_FLASH' && p.costoEstimado !== null && p.precioPromocional < p.costoEstimado;
}

function vigenciaValida(grupo: AbstractControl): ValidationErrors | null {
  const desde = grupo.get('vigenteDesde')?.value as string;
  const hasta = grupo.get('vigenteHasta')?.value as string;
  return desde && hasta && hasta <= desde ? { vigencia: true } : null;
}

@Component({
  selector: 'app-admin-promociones',
  imports: [DecimalPipe, ReactiveFormsModule, LucideAngularModule, PanelAccionesDirective, PanelKpi, PanelModal, EstadoVacio, TextField, SelectField, ImagenField],
  templateUrl: './admin-promociones.component.html',
  styleUrl: './admin-promociones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPromocionesComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly cargando = signal(true);
  protected readonly promociones = signal<readonly PromocionAdminResponse[]>([]);
  protected readonly productos = signal<readonly ProductoResumenResponse[]>([]);
  protected readonly tamanos = signal<readonly TamanoPizzaResponse[]>([]);
  protected readonly vista = signal<Vista>('todas');
  protected readonly busqueda = signal('');
  private readonly ahora = signal(Date.now());

  protected readonly modalAbierto = signal(false);
  protected readonly editando = signal<PromocionAdminResponse | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);

  protected readonly opcionesTipo = (Object.keys(TIPOS_PROMOCION) as TipoPromocion[]).map((t) => ({ valor: t, etiqueta: TIPOS_PROMOCION[t] }));
  protected readonly opcionesColor = (Object.keys(COLORES_PROMOCION) as ColorPromocion[]).map((c) => ({ valor: c, etiqueta: COLORES_PROMOCION[c] }));
  protected readonly opcionesProducto = computed(() => [
    { valor: '', etiqueta: 'Elige un producto' },
    ...[...this.productos()].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((p) => ({ valor: String(p.id), etiqueta: p.nombre })),
  ]);
  protected readonly opcionesTamano = computed(() => [
    { valor: '', etiqueta: 'Sin tamaño' },
    ...this.tamanos().map((t) => ({ valor: String(t.id), etiqueta: t.nombre })),
  ]);

  protected readonly form = this.fb.group(
    {
      titulo: ['', [Validators.required, Validators.maxLength(120)]],
      tipo: ['COMBO' as TipoPromocion, [Validators.required]],
      etiqueta: ['', [Validators.maxLength(40)]],
      descripcion: ['', [Validators.maxLength(500)]],
      precioPromocional: ['', [Validators.required, Validators.min(0)]],
      precioAnterior: ['', [Validators.min(0)]],
      costoEstimado: ['', [Validators.min(0)]],
      imagenUrl: ['', [Validators.maxLength(500)]],
      colorFondo: ['ROJO' as ColorPromocion, [Validators.required]],
      condiciones: ['', [Validators.maxLength(500)]],
      vigenteDesde: ['', [Validators.required]],
      vigenteHasta: ['', [Validators.required]],
      orden: ['0', [Validators.min(0)]],
      activa: [true],
      items: this.fb.array([this.nuevoItem()]),
    },
    { validators: vigenciaValida },
  );

  protected get items() {
    return this.form.controls.items;
  }

  protected readonly filtradas = computed(() => {
    const q = normalizar(this.busqueda());
    const vista = this.vista();
    return [...this.promociones()]
      .filter((p) => (vista !== 'activas' || p.activa) && (vista !== 'perdida' || enPerdida(p)))
      .filter((p) => !q || normalizar(`${p.titulo} ${p.etiqueta ?? ''}`).includes(q))
      .sort((a, b) => a.orden - b.orden || a.id - b.id);
  });
  protected readonly activas = computed(() => this.promociones().filter((p) => p.activa).length);
  protected readonly vigentes = computed(() => this.promociones().filter((p) => p.activa && this.vigencia(p) === 'Vigente').length);
  protected readonly vencidas = computed(() => this.promociones().filter((p) => this.vigencia(p) === 'Vencida').length);
  protected readonly perdidas = computed(() => this.promociones().filter(enPerdida).length);

  protected readonly valor = valorDe;
  protected readonly fechaHora = formatearFechaHora;
  protected readonly enPerdida = enPerdida;
  protected readonly tipos = TIPOS_PROMOCION;
  protected readonly Icons = { CalendarClock, Megaphone, Pencil, Plus, Search, Tag, TrendingDown, Trash2 };

  constructor() {
    forkJoin({
      promociones: this.api.promociones(),
      productos: this.api.productos({ tamano: 100 }),
      tamanos: this.api.tamanos(),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe((r) => {
        this.promociones.set(r.promociones);
        this.productos.set(r.productos.contenido);
        this.tamanos.set(r.tamanos);
      });
  }

  protected vigencia(p: PromocionAdminResponse): EstadoVigencia {
    const ahora = this.ahora();
    if (Date.parse(p.vigenteDesde) > ahora) return 'Programada';
    return Date.parse(p.vigenteHasta) < ahora ? 'Vencida' : 'Vigente';
  }

  protected margen(p: PromocionAdminResponse): number | null {
    return p.costoEstimado === null ? null : p.precioPromocional - p.costoEstimado;
  }

  protected alternarActiva(p: PromocionAdminResponse): void {
    this.api.activarPromocion(p.id, !p.activa).subscribe((act) => {
      this.promociones.update((l) => l.map((x) => (x.id === act.id ? act : x)));
      this.toast.success(act.activa ? 'Promoción activada' : 'Promoción pausada', act.titulo);
    });
  }

  // ---- Formulario ----
  protected abrirNueva(): void {
    this.editando.set(null);
    const inicio = new Date();
    const fin = new Date(inicio.getTime() + 7 * 86_400_000);
    this.prepararForm({
      titulo: '',
      tipo: 'COMBO',
      etiqueta: '',
      descripcion: '',
      precioPromocional: '',
      precioAnterior: '',
      costoEstimado: '',
      imagenUrl: '',
      colorFondo: 'ROJO',
      condiciones: '',
      vigenteDesde: aInputFechaHora(inicio.toISOString()),
      vigenteHasta: aInputFechaHora(fin.toISOString()),
      orden: String(Math.max(0, ...this.promociones().map((p) => p.orden)) + 1),
      activa: true,
    }, [{ productoId: '', tamanoId: '', cantidad: '1' }]);
  }

  protected abrirEdicion(p: PromocionAdminResponse): void {
    this.editando.set(p);
    this.prepararForm(
      {
        titulo: p.titulo,
        tipo: p.tipo,
        etiqueta: p.etiqueta ?? '',
        descripcion: p.descripcion ?? '',
        precioPromocional: String(p.precioPromocional),
        precioAnterior: p.precioAnterior === null ? '' : String(p.precioAnterior),
        costoEstimado: p.costoEstimado === null ? '' : String(p.costoEstimado),
        imagenUrl: p.imagenUrl ?? '',
        colorFondo: p.colorFondo,
        condiciones: p.condiciones ?? '',
        vigenteDesde: aInputFechaHora(p.vigenteDesde),
        vigenteHasta: aInputFechaHora(p.vigenteHasta),
        orden: String(p.orden),
        activa: p.activa,
      },
      p.items.map((i) => ({ productoId: String(i.productoId), tamanoId: i.tamanoId ? String(i.tamanoId) : '', cantidad: String(i.cantidad) })),
    );
  }

  protected agregarItem(): void {
    if (this.items.length >= 20) return;
    this.items.push(this.nuevoItem());
  }

  protected quitarItem(indice: number): void {
    if (this.items.length > 1) this.items.removeAt(indice);
  }

  protected cerrar(): void {
    this.modalAbierto.set(false);
  }

  protected guardar(): void {
    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.errors?.['vigencia']) this.errorFormulario.set('La promoción debe terminar después de que empieza.');
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo: PromocionRequest = {
      titulo: v.titulo.trim(),
      descripcion: v.descripcion.trim(),
      tipo: v.tipo,
      etiqueta: textoONull(v.etiqueta),
      precioPromocional: Number(v.precioPromocional),
      precioAnterior: numeroONull(v.precioAnterior),
      costoEstimado: numeroONull(v.costoEstimado),
      imagenUrl: textoONull(v.imagenUrl),
      colorFondo: v.colorFondo,
      condiciones: textoONull(v.condiciones),
      vigenteDesde: deInputFechaHora(v.vigenteDesde),
      vigenteHasta: deInputFechaHora(v.vigenteHasta),
      activa: v.activa,
      orden: Number(v.orden || 0),
      items: v.items.map((i) => ({ productoId: Number(i.productoId), tamanoId: numeroONull(i.tamanoId), cantidad: Number(i.cantidad) })),
    };
    const actual = this.editando();
    this.guardando.set(true);
    this.errorFormulario.set(null);
    (actual ? this.api.actualizarPromocion(actual.id, cuerpo) : this.api.crearPromocion(cuerpo))
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (guardada) => {
          this.promociones.update((l) => (actual ? l.map((x) => (x.id === guardada.id ? guardada : x)) : [...l, guardada]));
          this.ahora.set(Date.now());
          this.toast.success(actual ? 'Promoción actualizada' : 'Promoción creada', guardada.titulo);
          if (enPerdida(guardada)) this.toast.warning('Esta oferta se vende en pérdida', 'El precio no cubre el costo estimado.');
          this.cerrar();
        },
        error: (e: unknown) => this.errorFormulario.set(aplicarErrorApi(this.form, e)),
      });
  }

  private nuevoItem() {
    return this.fb.group({
      productoId: ['', [Validators.required]],
      tamanoId: [''],
      cantidad: ['1', [Validators.required, Validators.min(1), Validators.max(20)]],
    });
  }

  private prepararForm(
    valores: ValoresPromocion,
    items: readonly ValoresItem[],
  ): void {
    this.items.clear();
    items.forEach(() => this.items.push(this.nuevoItem()));
    this.form.reset({ ...valores, items: [...items] });
    this.errorFormulario.set(null);
    this.modalAbierto.set(true);
  }
}
