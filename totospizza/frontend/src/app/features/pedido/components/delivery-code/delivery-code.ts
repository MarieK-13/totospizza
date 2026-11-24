import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Bike, KeyRound, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-delivery-code',
  imports: [LucideAngularModule],
  templateUrl: './delivery-code.html',
  styleUrl: './delivery-code.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-invertido]': 'invertido()' },
})
export class DeliveryCode {
  readonly codigo = input<string | null>(null);
  readonly motorizado = input<string | null>(null);
  /** Colores para ir sobre un fondo de color. */
  readonly invertido = input(false);

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
