import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, CheckCircle2, LucideAngularModule, PlusCircle } from 'lucide-angular';
import type { ProductoResumenResponse } from '../../../../core/models/api';
import { imagenDeProducto } from '../../../../core/utils/producto-imagen';
import { AgregarProductoDirective } from '../../../../shared/directives/agregar-producto.directive';

/** Orden de las pestañas; las categorías nuevas de la base aparecen al final. */
const ORDEN_CATEGORIAS = ['Pizzas', 'Antojitos', 'Bebidas', 'Salsas'];
/** Cuántos productos se muestran por pestaña; el resto, en el menú completo. */
const MAXIMO_POR_CATEGORIA = 6;

/** "Explora nuestro menú": productos reales de la base agrupados por categoría (GET /publico/menu). */
@Component({
  selector: 'app-snack-categories',
  imports: [RouterLink, LucideAngularModule, AgregarProductoDirective],
  templateUrl: './snack-categories.html',
  styleUrl: './snack-categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackCategories {
  readonly productos = input<readonly ProductoResumenResponse[]>([]);
  readonly cargando = input(false);

  protected readonly ArrowRightIcon = ArrowRight;
  protected readonly PlusCircleIcon = PlusCircle;
  protected readonly CheckCircleIcon = CheckCircle2;

  protected readonly categorias = computed(() => {
    const presentes = [...new Set(this.productos().map((p) => p.categoria))];
    const posicion = (c: string) => {
      const i = ORDEN_CATEGORIAS.indexOf(c);
      return i === -1 ? ORDEN_CATEGORIAS.length : i;
    };
    return presentes.sort((a, b) => posicion(a) - posicion(b));
  });

  private readonly elegida = signal<string | null>(null);
  /** La pestaña elegida, o la primera disponible. */
  protected readonly categoriaActiva = computed(() => {
    const elegida = this.elegida();
    return elegida && this.categorias().includes(elegida) ? elegida : (this.categorias()[0] ?? null);
  });

  protected readonly itemsFiltrados = computed(() =>
    this.productos()
      .filter((p) => p.categoria === this.categoriaActiva())
      .slice(0, MAXIMO_POR_CATEGORIA),
  );

  protected readonly imagen = imagenDeProducto;

  protected seleccionarCategoria(categoria: string): void {
    this.elegida.set(categoria);
  }

  /** Insignia de la tarjeta: "Favorito" para los destacados, o su dieta (Vegetariana, Picante...). */
  protected insignia(producto: ProductoResumenResponse): string | null {
    if (producto.destacado) return 'Favorito';
    return producto.etiquetas.find((e) => !e.slug.startsWith('contiene-') && !e.slug.startsWith('sin-'))?.nombre ?? null;
  }
}
