import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { FormaIngrediente } from '../pizza-preview/pizza-preview';

/**
 * Dibujo de un trozo de ingrediente (pepperoni, champiñón, aceituna...) centrado en 0,0, de unos 26 de ancho.
 * Se usa dentro de un <svg>: sobre la pizza de la vista previa y como ícono en las tarjetas de opciones.
 */
@Component({
  selector: 'g[appFormaIngrediente]',
  templateUrl: './forma-ingrediente.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormaIngredienteComponent {
  readonly forma = input.required<FormaIngrediente>();
}
