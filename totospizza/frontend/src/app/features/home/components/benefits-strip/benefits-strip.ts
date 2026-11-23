import { Component } from '@angular/core';
import { LucideAngularModule, Flame, Wheat, Bike, Leaf } from 'lucide-angular';

@Component({
  selector: 'app-benefits-strip',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './benefits-strip.html',
  styleUrl: './benefits-strip.scss',
})
export class BenefitsStrip {
  readonly beneficios = [
    { icono: Flame, titulo: 'Horno de piedra', texto: '450° de puro sabor' },
    { icono: Wheat, titulo: 'Masa de 48 horas', texto: 'Ligera y crujiente' },
    { icono: Bike, titulo: 'Delivery rápido', texto: 'En 35 minutos' },
    { icono: Leaf, titulo: 'Ingredientes frescos', texto: 'Selección diaria' },
  ];
}