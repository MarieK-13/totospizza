import { ChangeDetectionStrategy, Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, Check, ChevronLeft, ChevronRight, LucideAngularModule, Plus } from 'lucide-angular';
import type { EtiquetaResponse, ProductoResumenResponse } from '../../../../core/models/api';
import { imagenDeProducto } from '../../../../core/utils/producto-imagen';
import { AgregarProductoDirective } from '../../../../shared/directives/agregar-producto.directive';

type TipoTag = 'alergeno' | 'dieta' | 'picante';

interface Tag {
  readonly label: string;
  readonly tipo: TipoTag;
}

interface Tarjeta {
  readonly producto: ProductoResumenResponse;
  readonly imagen: string | null;
  readonly insignia: string;
  readonly valoracion: string | null;
  readonly tags: readonly Tag[];
}

function tipoDeEtiqueta(etiqueta: EtiquetaResponse): TipoTag {
  if (etiqueta.slug.startsWith('contiene-')) return 'alergeno';
  if (etiqueta.slug === 'picante') return 'picante';
  return 'dieta';
}

@Component({
  selector: 'app-menu-preview',
  imports: [RouterLink, LucideAngularModule, AgregarProductoDirective],
  templateUrl: './menu-preview.html',
  styleUrl: './menu-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPreview {
  readonly productos = input<readonly ProductoResumenResponse[]>([]);
  readonly cargando = input(false);

  protected readonly tarjetas = computed<readonly Tarjeta[]>(() =>
    this.productos().map((producto) => ({
      producto,
      imagen: imagenDeProducto(producto),
      insignia: producto.etiquetas.find((e) => tipoDeEtiqueta(e) !== 'alergeno')?.nombre ?? 'Favorita',
      valoracion: (producto.totalResenas ?? 0) > 0 ? (producto.calificacionPromedio ?? 0).toFixed(1) : null,
      tags: producto.etiquetas.map((e) => ({ label: e.nombre, tipo: tipoDeEtiqueta(e) })),
    })),
  );

  protected readonly ArrowRightIcon = ArrowRight;
  protected readonly PlusIcon = Plus;
  protected readonly CheckIcon = Check;
  protected readonly PrevIcon = ChevronLeft;
  protected readonly NextIcon = ChevronRight;

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  protected readonly canPrev = signal(false);
  protected readonly canNext = signal(true);

  protected onScroll(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    this.canPrev.set(el.scrollLeft > 4);
    this.canNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  protected mover(direccion: 1 | -1): void {
    const el = this.track()?.nativeElement;
    el?.scrollBy({ left: direccion * el.clientWidth * 0.9, behavior: 'smooth' });
  }
}
