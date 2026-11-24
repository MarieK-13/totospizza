import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Boxes, Globe, LucideAngularModule, PackageMinus, Search, SlidersHorizontal, Store, TriangleAlert } from 'lucide-angular';
import type {
  CanalInventario,
  InventarioIngredienteResponse,
  SucursalResponse,
  TipoMovimientoInventario,
} from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { aplicarErrorApi } from '../../../../core/utils/form-errors';
import { normalizar, valorDe } from '../../../../core/utils/texto';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelKpi } from '../../../../shared/components/panel-kpi/panel-kpi';
import { PanelModal } from '../../../../shared/components/panel-modal/panel-modal';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { PanelAccionesDirective } from '../../../../shared/directives/panel-acciones.directive';
import { MOVIMIENTOS_INVENTARIO, UNIDADES } from '../../shared/catalogo';

const CLAVE_MASA = 'ingrediente_masa_id';

@Component({
  selector: 'app-admin-inventario',
  imports: [DecimalPipe, ReactiveFormsModule, LucideAngularModule, PanelAccionesDirective, PanelKpi, PanelModal, EstadoVacio, TextField, SelectField],
  templateUrl: './admin-inventario.component.html',
  styleUrl: './admin-inventario.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInventarioComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly sucursales = signal<readonly SucursalResponse[]>([]);
  protected readonly sucursalId = signal<number | null>(null);
  protected readonly canal = signal<CanalInventario>('ONLINE');
  protected readonly cargandoSedes = signal(true);
  protected readonly cargando = signal(false);
  protected readonly inventario = signal<readonly InventarioIngredienteResponse[]>([]);
  protected readonly alertasTotales = signal<number | null>(null);
  protected readonly ingredienteMasaId = signal<number | null>(null);
  protected readonly busqueda = signal('');
  protected readonly soloBajo = signal(false);

  protected readonly seleccionado = signal<InventarioIngredienteResponse | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);
  protected readonly opcionesMovimiento = (Object.keys(MOVIMIENTOS_INVENTARIO) as TipoMovimientoInventario[]).map((t) => ({
    valor: t,
    etiqueta: MOVIMIENTOS_INVENTARIO[t],
  }));
  protected readonly form = this.fb.group({
    tipo: ['ENTRADA' as TipoMovimientoInventario, [Validators.required]],
    cantidad: ['', [Validators.required, Validators.min(0.01)]],
    motivo: ['', [Validators.required, Validators.maxLength(250)]],
  });
  private readonly valoresForm = signal(this.form.getRawValue());

  protected readonly filtrado = computed(() => {
    const q = normalizar(this.busqueda());
    return [...this.inventario()]
      .filter((i) => (!this.soloBajo() || i.stockBajo) && (!q || normalizar(i.ingredienteNombre).includes(q)))
      .sort((a, b) => Number(b.stockBajo) - Number(a.stockBajo) || a.ingredienteNombre.localeCompare(b.ingredienteNombre));
  });
  protected readonly bajos = computed(() => this.inventario().filter((i) => i.stockBajo).length);
  protected readonly masaWeb = computed(() => {
    const id = this.ingredienteMasaId();
    return this.canal() === 'ONLINE' && id ? (this.inventario().find((i) => i.ingredienteId === id) ?? null) : null;
  });
  protected readonly nombreSede = computed(() => this.sucursales().find((s) => s.id === this.sucursalId())?.nombre ?? '');
  /** Stock que quedaría tras el movimiento, para que el administrador lo vea antes de guardar. */
  protected readonly stockResultante = computed(() => {
    const item = this.seleccionado();
    const { tipo, cantidad } = this.valoresForm();
    const n = Number(cantidad);
    if (!item || !cantidad || !Number.isFinite(n)) return null;
    if (tipo === 'AJUSTE') return n;
    return tipo === 'ENTRADA' ? item.stockActual + n : item.stockActual - n;
  });

  protected readonly valor = valorDe;
  protected readonly unidad = (i: InventarioIngredienteResponse) => UNIDADES[i.unidad];
  protected readonly Icons = { Boxes, Globe, PackageMinus, Search, SlidersHorizontal, Store, TriangleAlert };

  constructor() {
    this.form.valueChanges.subscribe(() => this.valoresForm.set(this.form.getRawValue()));
    forkJoin({
      sucursales: this.api.sucursales(),
      parametros: this.api.parametros().pipe(catchError(() => of([]))),
      alertas: this.api.contarStockBajo().pipe(catchError(() => of(null))),
    })
      .pipe(finalize(() => this.cargandoSedes.set(false)))
      .subscribe(({ sucursales, parametros, alertas }) => {
        this.sucursales.set(sucursales);
        this.alertasTotales.set(alertas?.total ?? null);
        const masa = Number(parametros.find((p) => p.clave === CLAVE_MASA)?.valor);
        this.ingredienteMasaId.set(Number.isFinite(masa) && masa > 0 ? masa : null);
        const primera = sucursales.find((s) => s.activa) ?? sucursales[0];
        if (primera) {
          this.sucursalId.set(primera.id);
          this.cargar();
        }
      });
  }

  protected cambiarSucursal(evento: Event): void {
    this.sucursalId.set(Number(valorDe(evento)));
    this.cargar();
  }

  protected cambiarCanal(canal: CanalInventario): void {
    if (canal === this.canal()) return;
    this.canal.set(canal);
    this.cargar();
  }

  protected cargar(): void {
    const sucursalId = this.sucursalId();
    if (!sucursalId) return;
    this.cargando.set(true);
    this.api
      .inventario(sucursalId, this.canal())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ next: (lista) => this.inventario.set(lista), error: () => this.inventario.set([]) });
  }

  protected porcentaje(item: InventarioIngredienteResponse): number {
    const referencia = Math.max(item.stockMinimo * 2, item.stockActual, 1);
    return Math.min(100, Math.round((item.stockActual / referencia) * 100));
  }

  protected abrirAjuste(item: InventarioIngredienteResponse, tipo: TipoMovimientoInventario = 'ENTRADA'): void {
    this.seleccionado.set(item);
    this.form.reset({ tipo, cantidad: '', motivo: '' });
    this.errorFormulario.set(null);
  }

  protected cerrar(): void {
    this.seleccionado.set(null);
  }

  protected guardar(): void {
    const item = this.seleccionado();
    if (!item || this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.api
      .ajustarInventario(item.id, { tipo: v.tipo, cantidad: Number(v.cantidad), motivo: v.motivo.trim() })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (actualizado) => {
          const antes = item.stockBajo;
          this.inventario.update((l) => l.map((i) => (i.id === actualizado.id ? actualizado : i)));
          if (antes !== actualizado.stockBajo) {
            this.alertasTotales.update((t) => (t === null ? t : t + (actualizado.stockBajo ? 1 : -1)));
          }
          this.toast.success('Inventario actualizado', `${actualizado.ingredienteNombre}: ${actualizado.stockActual} ${this.unidad(actualizado)}`);
          this.cerrar();
        },
        error: (e: unknown) => this.errorFormulario.set(aplicarErrorApi(this.form, e)),
      });
  }
}
