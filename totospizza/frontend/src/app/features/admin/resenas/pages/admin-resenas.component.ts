import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Eye, EyeOff, LucideAngularModule, MessageSquareQuote, Search, Star } from 'lucide-angular';
import type { ResenaResponse } from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { formatearFecha } from '../../../../core/utils/fechas';
import { iniciales } from '../../../../core/utils/roles';
import { normalizar, valorDe } from '../../../../core/utils/texto';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { PanelKpi } from '../../../../shared/components/panel-kpi/panel-kpi';

const TAMANO_PAGINA = 50;
type Filtro = 'todas' | 'destacadas' | 'ocultas' | 'bajas';

@Component({
  selector: 'app-admin-resenas',
  imports: [DecimalPipe, LucideAngularModule, PanelKpi, EstadoVacio],
  templateUrl: './admin-resenas.component.html',
  styleUrl: './admin-resenas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminResenasComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);

  protected readonly cargando = signal(true);
  protected readonly cargandoMas = signal(false);
  protected readonly resenas = signal<readonly ResenaResponse[]>([]);
  protected readonly total = signal(0);
  private readonly pagina = signal(0);
  protected readonly hayMas = signal(false);
  protected readonly filtro = signal<Filtro>('todas');
  protected readonly busqueda = signal('');
  protected readonly procesando = signal<number | null>(null);

  protected readonly filtradas = computed(() => {
    const q = normalizar(this.busqueda());
    const f = this.filtro();
    return this.resenas().filter(
      (r) =>
        (f !== 'destacadas' || r.destacada) &&
        (f !== 'ocultas' || !r.visible) &&
        (f !== 'bajas' || r.calificacion <= 2) &&
        (!q || normalizar(`${r.autor} ${r.comentario ?? ''}`).includes(q)),
    );
  });
  protected readonly promedio = computed(() => {
    const lista = this.resenas();
    return lista.length ? lista.reduce((a, r) => a + r.calificacion, 0) / lista.length : 0;
  });
  protected readonly destacadas = computed(() => this.resenas().filter((r) => r.destacada).length);
  protected readonly ocultas = computed(() => this.resenas().filter((r) => !r.visible).length);
  protected readonly bajas = computed(() => this.resenas().filter((r) => r.calificacion <= 2).length);

  protected readonly estrellas = [1, 2, 3, 4, 5];
  protected readonly valor = valorDe;
  protected readonly fecha = formatearFecha;
  protected readonly Icons = { Eye, EyeOff, MessageSquareQuote, Search, Star };

  constructor() {
    this.cargar(true);
  }

  protected cargar(reiniciar = false): void {
    const pagina = reiniciar ? 0 : this.pagina() + 1;
    (reiniciar ? this.cargando : this.cargandoMas).set(true);
    this.api
      .resenas({ pagina, tamano: TAMANO_PAGINA })
      .pipe(finalize(() => (reiniciar ? this.cargando : this.cargandoMas).set(false)))
      .subscribe((resp) => {
        this.resenas.update((l) => (reiniciar ? resp.contenido : [...l, ...resp.contenido]));
        this.pagina.set(pagina);
        this.total.set(resp.totalElementos);
        this.hayMas.set(!resp.ultima);
      });
  }

  protected inicialesDe(autor: string): string {
    const [nombre = '', apellido = ''] = autor.split(' ');
    return iniciales(nombre, apellido);
  }

  protected alternarDestacada(r: ResenaResponse): void {
    if (!r.visible && !r.destacada) {
      this.toast.warning('Primero hazla visible', 'Una reseña oculta no puede destacarse en el inicio.');
      return;
    }
    this.procesando.set(r.id);
    this.api
      .destacarResena(r.id, !r.destacada)
      .pipe(finalize(() => this.procesando.set(null)))
      .subscribe((act) => {
        this.reemplazar(act);
        this.toast.success(act.destacada ? 'Reseña destacada en el inicio' : 'Reseña quitada del inicio');
      });
  }

  protected alternarVisible(r: ResenaResponse): void {
    this.procesando.set(r.id);
    this.api
      .ocultarResena(r.id, !r.visible)
      .pipe(finalize(() => this.procesando.set(null)))
      .subscribe((act) => {
        this.reemplazar(act);
        this.toast.success(act.visible ? 'Reseña visible' : 'Reseña oculta', act.visible ? undefined : 'Ya no se muestra a los clientes.');
      });
  }

  private reemplazar(act: ResenaResponse): void {
    this.resenas.update((l) => l.map((r) => (r.id === act.id ? act : r)));
  }
}
