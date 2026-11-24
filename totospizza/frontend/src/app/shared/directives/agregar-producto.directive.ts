import { DestroyRef, Directive, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';
import type { ProductoResumenResponse } from '../../core/models/api';
import { AgregarRapidoService } from '../../core/services/agregar-rapido.service';

const DURACION_AGREGADO_MS = 1600;

/**
 * Convierte cualquier botón en "agregar al carrito" para un producto del menú.
 * Producto simple: lo agrega (con o sin sesión). Pizza: lleva al detalle para elegir tamaño y masa.
 *
 *   <button [appAgregarProducto]="producto" #agregar="agregar">
 *     {{ agregar.agregado() ? 'Agregado' : 'Agregar' }}
 *   </button>
 */
@Directive({
  selector: '[appAgregarProducto]',
  exportAs: 'agregar',
  host: {
    '(click)': 'agregar()',
    '[class.is-added]': 'agregado()',
    '[attr.aria-busy]': 'ocupado()',
  },
})
export class AgregarProductoDirective {
  private readonly agregarRapido = inject(AgregarRapidoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly producto = input.required<ProductoResumenResponse>({ alias: 'appAgregarProducto' });

  readonly ocupado = signal(false);
  readonly agregado = signal(false);

  protected agregar(): void {
    if (this.ocupado()) return;
    const { slug, nombre } = this.producto();
    this.ocupado.set(true);
    this.agregarRapido
      .agregar(slug, nombre)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: (resultado) => {
          if (resultado !== 'agregado') return;
          this.agregado.set(true);
          const espera = setTimeout(() => this.agregado.set(false), DURACION_AGREGADO_MS);
          this.destroyRef.onDestroy(() => clearTimeout(espera));
        },
        error: () => undefined, // el aviso de error lo muestra el interceptor
      });
  }
}
