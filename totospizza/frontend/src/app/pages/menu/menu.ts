import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowDownUp, ChevronDown, LayoutGrid, LucideAngularModule, RefreshCw, Rows3, Search, SearchX, User, Users, X } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, timeout } from 'rxjs';
import { peticionSilenciosa } from '../../core/interceptors/http-context';
import type { FiltroMenu, ProductoResumenResponse } from '../../core/models/api';
import { CatalogoService } from '../../core/services/catalogo.service';
import { OPCIONES_ORDEN, esOrdenMenu, ordenarMenu, type OrdenMenu } from '../../core/utils/orden-menu';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductInfoDialog } from '../../shared/components/product-info-dialog/product-info-dialog';

const TAMANO_PAGINA = 100;
const ESPERA_MAXIMA_MS = 15_000;
const CLAVE_VISTA = 'toto.menu.vista';

type Vista = 'grilla' | 'lista';

@Component({
  selector: 'app-menu',
  imports: [LucideAngularModule, ProductCard, ProductInfoDialog],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  private readonly api = inject(CatalogoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly categoria = computed(() => this.params().get('categoria') ?? '');
  protected readonly etiqueta = computed(() => this.params().get('etiqueta') ?? '');
  protected readonly busqueda = computed(() => this.params().get('q') ?? '');
  protected readonly tamanoPizza = computed(() => {
    const valor = Number(this.params().get('tamano'));
    return Number.isInteger(valor) && valor > 0 ? valor : null;
  });
  protected readonly orden = computed<OrdenMenu>(() => {
    const valor = this.params().get('orden');
    return esOrdenMenu(valor) ? valor : 'recomendado';
  });
  protected readonly hayFiltros = computed(() => !!(this.categoria() || this.etiqueta() || this.busqueda() || this.tamanoPizza()));

  protected readonly texto = signal(this.route.snapshot.queryParamMap.get('q') ?? '');
  protected readonly vista = signal<Vista>(leerVista());
  protected readonly infoProducto = signal<ProductoResumenResponse | null>(null);
  protected readonly buscando = signal(!!this.route.snapshot.queryParamMap.get('q'));

  protected readonly filtros = rxResource({
    stream: () => this.api.filtros({ context: peticionSilenciosa() }).pipe(timeout(ESPERA_MAXIMA_MS)),
  });

  protected readonly resultados = rxResource({
    params: () =>
      ({
        categoria: this.categoria() || undefined,
        etiqueta: this.etiqueta() || undefined,
        q: this.busqueda() || undefined,
        tamanoPizza: this.tamanoPizza() ?? undefined,
        tamano: TAMANO_PAGINA,
      }) satisfies FiltroMenu,
    stream: ({ params }) => this.api.menu(params, { context: peticionSilenciosa() }).pipe(timeout(ESPERA_MAXIMA_MS)),
  });

  protected readonly respuesta = computed(() => this.resultados.value());
  protected readonly tamanos = computed(() => this.filtros.value()?.tamanos ?? []);
  protected readonly productos = computed(() => ordenarMenu(this.respuesta()?.contenido ?? [], this.orden()));
  protected readonly cargando = this.resultados.isLoading;
  protected readonly incompleto = computed(() => {
    const r = this.respuesta();
    return !!r && r.totalElementos > r.contenido.length;
  });

  protected readonly esqueletos = Array.from({ length: 8 }, (_, i) => i);
  protected readonly opcionesOrden = OPCIONES_ORDEN;

  protected readonly SearchIcon = Search;
  protected readonly ClearIcon = X;
  protected readonly EmptyIcon = SearchX;
  protected readonly RetryIcon = RefreshCw;
  protected readonly SortIcon = ArrowDownUp;
  protected readonly ChevronIcon = ChevronDown;
  protected readonly GridIcon = LayoutGrid;
  protected readonly ListIcon = Rows3;
  protected readonly PersonIcon = User;
  protected readonly GroupIcon = Users;

  constructor() {
    toObservable(this.texto)
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((valor) => {
        if (valor.trim() !== this.busqueda()) this.navegar({ q: valor.trim() || null }, true);
      });

    effect(() => {
      const enUrl = this.busqueda();
      untracked(() => {
        if (enUrl !== this.texto().trim()) this.texto.set(enUrl);
        if (enUrl) this.buscando.set(true);
      });
    });
  }

  protected alEscribir(evento: Event): void {
    this.texto.set((evento.target as HTMLInputElement).value);
  }

  protected abrirBusqueda(): void {
    this.buscando.set(true);
    setTimeout(() => document.getElementById('buscar')?.focus());
  }

  protected cerrarBusqueda(): void {
    this.texto.set('');
    if (!this.busqueda()) this.buscando.set(false);
  }

  protected elegirCategoria(slug: string): void {
    this.navegar({ categoria: slug || null });
  }

  protected alternarTamano(id: number): void {
    this.navegar({ tamano: this.tamanoPizza() === id ? null : String(id) });
  }

  protected personas(min: number, max: number): string {
    if (min === max) return min === 1 ? '1 persona' : `${min} personas`;
    return `${min} a ${max} personas`;
  }

  protected alternarEtiqueta(slug: string): void {
    this.navegar({ etiqueta: this.etiqueta() === slug ? null : slug });
  }

  protected cambiarOrden(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value as OrdenMenu;
    this.navegar({ orden: valor === 'recomendado' ? null : valor }, true);
  }

  protected cambiarVista(vista: Vista): void {
    this.vista.set(vista);
    try {
      localStorage.setItem(CLAVE_VISTA, vista);
    } catch {
    }
  }

  protected limpiar(): void {
    this.texto.set('');
    this.buscando.set(false);
    this.navegar({ categoria: null, etiqueta: null, q: null, tamano: null });
  }

  protected reintentar(): void {
    this.resultados.reload();
  }

  private navegar(cambios: Record<string, string | null>, reemplazar = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cambios,
      queryParamsHandling: 'merge',
      replaceUrl: reemplazar,
    });
  }
}

function leerVista(): Vista {
  try {
    return localStorage.getItem(CLAVE_VISTA) === 'lista' ? 'lista' : 'grilla';
  } catch {
    return 'grilla';
  }
}
