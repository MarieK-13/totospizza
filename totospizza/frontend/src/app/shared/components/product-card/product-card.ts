import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Check, Info, LoaderCircle, LucideAngularModule, Pizza, Plus } from 'lucide-angular';
import { finalize } from 'rxjs';
import type { ProductoResumenResponse } from '../../../core/models/api';
import { AgregarRapidoService } from '../../../core/services/agregar-rapido.service';
import { formatearSoles } from '../../../core/utils/money';
import { imagenDeProducto } from '../../../core/utils/producto-imagen';

/**
 * Tarjeta de producto del menú: foto, nombre, descripción y precio. Toda la tarjeta lleva al detalle;
 * el botón "+" agrega al carrito (o lleva a elegir opciones si el producto las pide) y el "i" abre
 * la ficha de alérgenos. Alérgenos y valoraciones no se muestran en la tarjeta.
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.es-lista]': "vista() === 'lista'" },
})
export class ProductCard {
  private readonly agregarRapido = inject(AgregarRapidoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly producto = input.required<ProductoResumenResponse>();
  readonly vista = input<'grilla' | 'lista'>('grilla');
  /** Si hay quien escuche, la tarjeta muestra el botón "i" que pide la ficha de alérgenos. */
  readonly conInfo = input(false);
  readonly informacion = output<ProductoResumenResponse>();

  protected readonly imagen = computed(() => imagenDeProducto(this.producto()));
  protected readonly precio = computed(() => formatearSoles(this.producto().precioDesde));

  protected readonly ocupado = signal(false);
  protected readonly agregado = signal(false);

  protected readonly PizzaIcon = Pizza;
  protected readonly InfoIcon = Info;
  protected readonly PlusIcon = Plus;
  protected readonly CheckIcon = Check;
  protected readonly LoadingIcon = LoaderCircle;

  protected verInformacion(): void {
    this.informacion.emit(this.producto());
  }

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
          const espera = setTimeout(() => this.agregado.set(false), 1600);
          this.destroyRef.onDestroy(() => clearTimeout(espera));
        },
        error: () => undefined, // el aviso de error ya lo muestra el interceptor
      });
  }
}
