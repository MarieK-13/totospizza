import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChefHat, FileText, Info, LucideAngularModule, ShieldCheck, TriangleAlert, X } from 'lucide-angular';
import type { ProductoResumenResponse } from '../../../core/models/api';
import { formatearSoles } from '../../../core/utils/money';
import { nombreCorto, separarEtiquetas } from '../../../core/utils/etiquetas';

/** Datos mínimos que necesita la ficha; sirven tanto el resumen del menú como el detalle. */
export type FichaProducto = Pick<ProductoResumenResponse, 'nombre' | 'slug' | 'descripcion' | 'ingredientes' | 'etiquetas' | 'precioDesde'>;

/**
 * Ficha informativa de un producto (alérgenos y descripción) en un modal.
 * Usa <dialog> nativo: trampa de foco, Esc para cerrar y fondo inerte sin código extra.
 * Se abre al recibir un producto y avisa con `cerrado` al cerrarse.
 */
@Component({
  selector: 'app-product-info-dialog',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './product-info-dialog.html',
  styleUrl: './product-info-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInfoDialog {
  readonly producto = input<FichaProducto | null>(null);
  /** En el menú ofrece ir al detalle; en el propio detalle se oculta. */
  readonly conEnlace = input(true);
  readonly cerrado = output<void>();

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  protected readonly grupos = computed(() => separarEtiquetas(this.producto()?.etiquetas ?? []));
  protected readonly contiene = computed(() => this.grupos().contiene.map(nombreCorto).join(', '));
  protected readonly libres = computed(() =>
    this.grupos()
      .libres.map((e) => e.nombre.replace(/^sin\s+/i, ''))
      .join(', '),
  );
  protected readonly precio = computed(() => formatearSoles(this.producto()?.precioDesde ?? 0));

  protected readonly CloseIcon = X;
  protected readonly InfoIcon = Info;
  protected readonly DescIcon = FileText;
  protected readonly IngredientesIcon = ChefHat;
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

  /** Clic en el fondo (fuera del panel) cierra. */
  protected alPulsar(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) this.cerrar();
  }

  /** Esc: se cierra por el estado del padre, no solo por el navegador. */
  protected alCancelar(evento: Event): void {
    evento.preventDefault();
    this.cerrar();
  }
}
