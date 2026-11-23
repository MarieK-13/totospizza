import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, CheckCircle2 } from 'lucide-angular';

@Component({
  selector: 'app-cta-banner',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './cta-banner.html',
  styleUrl: './cta-banner.scss',
})
export class CtaBanner {
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckCircleIcon = CheckCircle2;

  readonly garantias = [
    'Pago seguro',
    'Delivery en 35 min',
    'Puntos en cada compra',
  ];
}