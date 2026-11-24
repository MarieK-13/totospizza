import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../../core/services/toast.service';

interface Antojito {
  readonly id: string;
  readonly nombre: string;
  readonly imagen: string;
  readonly porcion: string;
  readonly precio: number;
}

@Component({
  selector: 'app-recommended-products',
  templateUrl: './recommended-products.html',
  styleUrl: './recommended-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendedProducts {
  private readonly toast = inject(ToastService);

  protected readonly antojitos: readonly Antojito[] = [
    { id: 'alitas', nombre: 'Alitas', imagen: 'images/antojo-alitas.png', porcion: '8 unidades', precio: 22.9 },
    { id: 'papas-fritas', nombre: 'Papas fritas', imagen: 'images/antojo-papas.png', porcion: 'Para compartir', precio: 14.9 },
    { id: 'nuggets', nombre: 'Nuggets', imagen: 'images/antojo-nuggets.png', porcion: '10 unidades', precio: 17.9 },
    { id: 'pan-de-ajo', nombre: 'Pan de ajo', imagen: 'images/antojo-pan-ajo.png', porcion: '4 rebanadas', precio: 13.9 },
    { id: 'onion-rings', nombre: 'Onion rings', imagen: 'images/antojo-onion-rings.png', porcion: '12 unidades', precio: 15.9 },
    { id: 'tequenos', nombre: 'Tequeños', imagen: 'images/antojo-tequenos.png', porcion: '6 unidades', precio: 16.9 },
    { id: 'croquetas', nombre: 'Croquetas', imagen: 'images/antojo-croquetas.png', porcion: '6 unidades', precio: 18.9 },
  ];

  protected agregar(item: Antojito): void {
    this.toast.success('Agregado a tu pedido', `${item.nombre} · S/ ${item.precio.toFixed(2)}`);
  }
}
