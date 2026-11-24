import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Leaf, LucideAngularModule, ShieldCheck, TriangleAlert } from 'lucide-angular';
import type { EtiquetaResponse } from '../../../core/models/api';
import { nombreCorto, separarEtiquetas } from '../../../core/utils/etiquetas';

/**
 * Etiquetas de un producto. `compacto` cabe en una tarjeta; `completo` es la ficha del detalle
 * con los alérgenos en su propio bloque, para que no se pasen por alto.
 */
@Component({
  selector: 'app-product-tags',
  imports: [LucideAngularModule],
  templateUrl: './product-tags.html',
  styleUrl: './product-tags.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTags {
  readonly etiquetas = input.required<readonly EtiquetaResponse[]>();
  readonly modo = input<'compacto' | 'completo'>('compacto');

  protected readonly grupos = computed(() => separarEtiquetas(this.etiquetas()));
  protected readonly resumenContiene = computed(() => this.grupos().contiene.map(nombreCorto).join(', '));
  protected readonly vacio = computed(() => this.etiquetas().length === 0);

  protected readonly AlertIcon = TriangleAlert;
  protected readonly SafeIcon = ShieldCheck;
  protected readonly LeafIcon = Leaf;
  protected readonly nombreCorto = nombreCorto;
}
