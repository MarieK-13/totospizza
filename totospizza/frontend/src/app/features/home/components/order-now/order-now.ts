import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Check, LucideAngularModule, Plus, Sparkles } from 'lucide-angular';
import { ToastService } from '../../../../core/services/toast.service';

type Insignia = 'Nuevo' | 'Poco pedido';

interface Opcion {
  readonly nombre: string;
  readonly detalle?: string;
  readonly imagen?: string;
  readonly extra?: number;
  readonly insignia?: Insignia;
}

interface Combo {
  readonly id: string;
  readonly nombre: string;
  readonly resumen: string;
  readonly pregunta: string;
  readonly precioBase: number;
  readonly imagen: string;
  readonly opciones: readonly Opcion[];
}

/**
 * Armador de combos: la imagen es el producto principal y el cliente elige UNA
 * opción para completarlo. Las opciones menos vendidas o nuevas se destacan
 * con una insignia para que el cliente siempre descubra algo distinto.
 */
@Component({
  selector: 'app-order-now',
  imports: [LucideAngularModule],
  templateUrl: './order-now.html',
  styleUrl: './order-now.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderNow {
  private readonly toast = inject(ToastService);

  protected readonly CheckIcon = Check;
  protected readonly PlusIcon = Plus;
  protected readonly SparkIcon = Sparkles;

  protected readonly combos: readonly Combo[] = [
    {
      id: 'pack-pepperoni',
      nombre: 'Pack Pepperoni & Co',
      resumen: 'Pizza pepperoni artesanal mediana + 1 bebida a tu elección.',
      pregunta: 'Elige tu bebida',
      precioBase: 32.9,
      imagen: 'images/pepperoni.jpg',
      opciones: [
        { nombre: 'Inca Kola 500 ml' },
        { nombre: 'Coca-Cola 500 ml', imagen: 'images/cocacola.jpg' },
        { nombre: 'Limonada de frutos rojos', detalle: 'Artesanal de la casa', extra: 2, insignia: 'Nuevo' },
        { nombre: 'Limonada de menta', extra: 1.5, insignia: 'Poco pedido' },
        { nombre: 'Agua 500 ml' },
      ],
    },
    {
      id: 'match-perfecto',
      nombre: 'Match Perfecto',
      resumen: 'Bebida de la casa + 1 piqueo para compartir.',
      pregunta: 'Elige tu piqueo',
      precioBase: 16,
      imagen: 'images/combo-bebida-piqueo.jpg',
      opciones: [
        { nombre: 'Pan de ajo', imagen: 'images/antojo-pan-ajo.png' },
        { nombre: 'Tequeños', detalle: 'Con guacamole', imagen: 'images/antojo-tequenos.png', extra: 2, insignia: 'Poco pedido' },
        { nombre: 'Croquetas', imagen: 'images/antojo-croquetas.png', insignia: 'Nuevo' },
        { nombre: 'Alitas BBQ', detalle: 'Salsa de la casa', imagen: 'images/antojo-alitas.png', extra: 4 },
        { nombre: 'Onion rings', imagen: 'images/antojo-onion-rings.png', insignia: 'Poco pedido' },
      ],
    },
    {
      id: 'antojo-compartido',
      nombre: 'Antojo Compartido',
      resumen: 'Alitas BBQ + papas nativas, más la pizza que tú elijas.',
      pregunta: 'Elige tu pizza',
      precioBase: 34.9,
      imagen: 'images/margherita.jpg',
      opciones: [
        { nombre: 'Margherita Verace', imagen: 'images/margherita.jpg' },
        { nombre: 'La Verde', detalle: 'Pesto y ricotta', imagen: 'images/verde.jpg', insignia: 'Nuevo' },
        { nombre: 'Andina', detalle: 'Rocoto y huacatay', imagen: 'images/andina.jpg', extra: 3, insignia: 'Nuevo' },
        { nombre: 'Portobello', imagen: 'images/portobello.jpg', extra: 2, insignia: 'Poco pedido' },
        { nombre: 'Cuatro Quesos', imagen: 'images/ternera.jpg' },
      ],
    },
    {
      id: 'banquete-toto',
      nombre: 'Banquete Familiar',
      resumen: 'Dos pizzas grandes: la Carnívora TOTO y otra a tu elección.',
      pregunta: 'Elige tu segunda pizza',
      precioBase: 64.9,
      imagen: 'images/carnivora.jpg',
      opciones: [
        { nombre: 'La Burrata', imagen: 'images/burrata.jpg', extra: 4 },
        { nombre: 'Diavola Picante', imagen: 'images/diavola.jpg', insignia: 'Poco pedido' },
        { nombre: 'Prosciutto e Rúcula', imagen: 'images/prosciutto.jpg', extra: 4, insignia: 'Poco pedido' },
        { nombre: 'Andina', imagen: 'images/andina.jpg', insignia: 'Nuevo' },
      ],
    },
  ];

  protected readonly comboActual = signal(0);
  private readonly elecciones = signal<Readonly<Record<string, number>>>({});

  protected readonly combo = computed(() => this.combos[this.comboActual()]);
  protected readonly indiceElegido = computed<number | null>(() => this.elecciones()[this.combo().id] ?? null);
  protected readonly opcionElegida = computed(() => {
    const i = this.indiceElegido();
    return i === null ? null : this.combo().opciones[i];
  });
  protected readonly total = computed(() => this.combo().precioBase + (this.opcionElegida()?.extra ?? 0));

  protected elegirCombo(indice: number): void {
    this.comboActual.set(indice);
  }

  protected elegirOpcion(indice: number): void {
    this.elecciones.update((prev) => ({ ...prev, [this.combo().id]: indice }));
  }

  protected agregar(): void {
    const opcion = this.opcionElegida();
    if (!opcion) {
      this.toast.warning('Falta un paso', `${this.combo().pregunta} para completar tu combo.`);
      return;
    }
    this.toast.success('Combo agregado', `${this.combo().nombre} + ${opcion.nombre} · S/ ${this.total().toFixed(2)}`);
  }
}
