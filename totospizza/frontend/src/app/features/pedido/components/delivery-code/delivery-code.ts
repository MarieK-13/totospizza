import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Bike, KeyRound, LucideAngularModule } from 'lucide-angular';

/** PIN que el cliente le dicta al motorizado para confirmar la entrega, y quién lo lleva. */
@Component({
  selector: 'app-delivery-code',
  imports: [LucideAngularModule],
  templateUrl: './delivery-code.html',
  styleUrl: './delivery-code.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryCode {
  readonly codigo = input<string | null>(null);
  readonly motorizado = input<string | null>(null);

  protected readonly digitos = computed(() => (this.codigo() ?? '').split(''));
  protected readonly iniciales = computed(() =>
    (this.motorizado() ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join(''),
  );

  protected readonly KeyIcon = KeyRound;
  protected readonly BikeIcon = Bike;
}
