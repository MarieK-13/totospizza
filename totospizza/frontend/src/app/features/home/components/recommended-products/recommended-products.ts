import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ProductoResumenResponse } from '../../../../core/models/api';
import { imagenDeProducto } from '../../../../core/utils/producto-imagen';
import { AgregarProductoDirective } from '../../../../shared/directives/agregar-producto.directive';

/** "Antojitos": productos de la categoría Antojitos (GET /publico/menu). Tocar uno lo agrega al carrito. */
@Component({
  selector: 'app-recommended-products',
  imports: [AgregarProductoDirective],
  templateUrl: './recommended-products.html',
  styleUrl: './recommended-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendedProducts {
  readonly productos = input<readonly ProductoResumenResponse[]>([]);

  protected readonly imagen = imagenDeProducto;
}
