import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, Bike, Clock, LucideAngularModule, ShieldCheck } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';

interface Garantia {
  readonly icono: LucideIconData;
  readonly texto: string;
}

@Component({
  selector: 'app-cta-banner',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './cta-banner.html',
  styleUrl: './cta-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaBanner {
  protected readonly ArrowRightIcon = ArrowRight;

  protected readonly garantias: readonly Garantia[] = [
    { icono: ShieldCheck, texto: 'Pago 100% seguro' },
    { icono: Bike, texto: 'Delivery en tu zona' },
    { icono: Clock, texto: 'Sigue tu pedido en vivo' },
  ];
}
