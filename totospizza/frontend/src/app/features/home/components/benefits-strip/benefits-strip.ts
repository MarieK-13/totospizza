import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Bike, Flame, Leaf, LucideAngularModule, Wheat } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';

interface Beneficio {
  readonly icono: LucideIconData;
  readonly titulo: string;
  readonly texto: string;
  readonly tono: 'rojo' | 'verde' | 'amarillo';
}

@Component({
  selector: 'app-benefits-strip',
  imports: [LucideAngularModule],
  templateUrl: './benefits-strip.html',
  styleUrl: './benefits-strip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefitsStrip {
  protected readonly beneficios: readonly Beneficio[] = [
    { icono: Flame, titulo: 'Horno de piedra', texto: '450° de puro sabor', tono: 'rojo' },
    { icono: Wheat, titulo: 'Masa de 48 horas', texto: 'Ligera y crujiente', tono: 'amarillo' },
    { icono: Bike, titulo: 'Delivery rápido', texto: 'En 35 minutos', tono: 'verde' },
    { icono: Leaf, titulo: 'Ingredientes frescos', texto: 'Selección diaria', tono: 'verde' },
  ];
}
