import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { FormaIngrediente } from '../pizza-preview/pizza-preview';

@Component({
  selector: 'g[appFormaIngrediente]',
  templateUrl: './forma-ingrediente.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormaIngredienteComponent {
  readonly forma = input.required<FormaIngrediente>();
}
