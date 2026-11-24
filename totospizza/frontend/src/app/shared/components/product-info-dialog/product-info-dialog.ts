import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Pizza, ShieldCheck, TriangleAlert, X } from 'lucide-angular';
import type { ProductoResumenResponse } from '../../../core/models/api';
import { formatearSoles } from '../../../core/utils/money';
import { nombreCorto, separarEtiquetas } from '../../../core/utils/etiquetas';
import { imagenDeProducto } from '../../../core/utils/producto-imagen';

export type FichaProducto = Pick<ProductoResumenResponse, 'nombre' | 'slug' | 'descripcion' | 'ingredientes' | 'etiquetas' | 'precioDesde' | 'imagenUrl'>;

@Component({
  selector: 'app-product-info-dialog',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './product-info-dialog.html',
  styleUrl: './product-info-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInfoDialog {
  readonly producto = input<FichaProducto | null>(null);
  readonly conEnlace = input(true);
  readonly cerrado = output<void>();

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  protected readonly grupos = computed(() => separarEtiquetas(this.producto()?.etiquetas ?? []));
  protected readonly contiene = computed(() => this.grupos().contiene.map(nombreCorto));
  protected readonly libres = computed(() => this.grupos().libres.map((e) => e.nombre));
  protected readonly ingredientes = computed(() =>
    (this.producto()?.ingredientes ?? '')
      .split(/,|\sy\s/)
      .map((i) => i.trim().replace(/\.$/, ''))
      .filter(Boolean)
      .map((i) => i.charAt(0).toUpperCase() + i.slice(1)),
  );
  protected readonly imagen = computed(() => {
    const p = this.producto();
    return p ? imagenDeProducto(p) : null;
  });
  protected readonly precio = computed(() => formatearSoles(this.producto()?.precioDesde ?? 0));

  protected readonly CloseIcon = X;
  protected readonly PizzaIcon = Pizza;
  protected readonly AlertIcon = TriangleAlert;
  protected readonly SafeIcon = ShieldCheck;

  constructor() {
    effect(() => {
      const dialogo = this.dialogo().nativeElement;
      if (this.producto()) {
        if (!dialogo.open) dialogo.showModal();
      } else if (dialogo.open) {
        dialogo.close();
      }
    });
  }

  protected cerrar(): void {
    this.cerrado.emit();
  }

  protected alPulsar(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) this.cerrar();
  }

  protected alCancelar(evento: Event): void {
    evento.preventDefault();
    this.cerrar();
  }
}
