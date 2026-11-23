import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, Plus, Check } from 'lucide-angular';

interface ComboOpcion {
  nombre: string;
  extraPrecio?: number;
}

interface ComboPideAhora {
  id: string;
  titulo: string;
  subtitulo: string;
  precioBase: number;
  imagen: string;
  opciones: ComboOpcion[];
}

@Component({
  selector: 'app-order-now',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './order-now.html',
  styleUrl: './order-now.scss',
})
export class OrderNow {
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Plus;
  readonly CheckIcon = Check;

  readonly combos: ComboPideAhora[] = [
    // Página 1 (las 3 tarjetas exactas de tu prototipo)
    {
      id: 'pack-pepperoni',
      titulo: 'Pack Pepperoni & CO',
      subtitulo: 'Selecciona tu bebida favorita para completar el combo:',
      precioBase: 32.9,
      imagen: 'images/combo-pack-pepperoni.jpg',
      opciones: [
        { nombre: 'Inca Kola 500ml' },
        { nombre: 'Coca-Cola 500ml' },
        { nombre: 'Limonada de fruto rojos (¡Artesanal de la casa!)', extraPrecio: 2.0 },
        { nombre: 'Limonada de menta', extraPrecio: 1.5 },
        { nombre: 'Agua 500 ml' },
      ],
    },
    {
      id: 'match-perfecto',
      titulo: 'Match Perfecto: Bebida & Piqueo',
      subtitulo: 'Elige el acompañante ideal para hacerle match a tu bebida:',
      precioBase: 16.0,
      imagen: 'images/combo-bebida-piqueo.jpg',
      opciones: [
        { nombre: 'Baston de masa con Mozzarella' },
        { nombre: 'Tequeños veganos con Huacamole', extraPrecio: 2.0 },
        { nombre: 'Cinnamon Roll' },
        { nombre: 'Pan al ajo' },
        { nombre: 'Alitas de pollo en Sala BBQ de la Casa', extraPrecio: 4.0 },
      ],
    },
    {
      id: 'antojo-compartido',
      titulo: 'Antojo Compartido',
      subtitulo:
        'Incluye para compartir: 1 porcion de alitas BBQ de la casa + 1 porcion de Papas Nativas',
      precioBase: 34.9,
      imagen: 'images/combo-antojo-compartido.jpg',
      opciones: [
        { nombre: 'Pizza Pepperoni Tradicional' },
        { nombre: 'Pizza Margarita con Queso' },
        { nombre: 'Pizza Suprema Artesanal (¡La infaltable!)', extraPrecio: 3.0 },
        { nombre: 'Pizza de Champiñones y extra queso', extraPrecio: 2.0 },
        { nombre: 'Pizza Artesanal Margarita' },
      ],
    },

    // Página 2 (combos adicionales para que el carrusel funcione)
    {
      id: 'duo-artesanal',
      titulo: 'Dúo Artesanal Nocturno',
      subtitulo: 'Elige tu entrada favorita para empezar la noche:',
      precioBase: 46.9,
      imagen: 'images/combo-antojo-compartido.jpg',
      opciones: [
        { nombre: 'Pan al ajo especial con mozzarella' },
        { nombre: 'Bastones de masa madre con pesto' },
        { nombre: 'Alitas BBQ de la casa (6 und.)', extraPrecio: 3.0 },
        { nombre: 'Ensalada fresca caprese' },
        { nombre: 'Nudos de ajo y parmesano' },
      ],
    },
    {
      id: 'tarde-dulce',
      titulo: 'Tarde Dulce & Café',
      subtitulo: 'Selecciona tu bebida caliente o fría para acompañar:',
      precioBase: 18.5,
      imagen: 'images/combo-bebida-piqueo.jpg',
      opciones: [
        { nombre: 'Americano pasado de altura' },
        { nombre: 'Cappuccino cremoso', extraPrecio: 1.5 },
        { nombre: 'Limonada de frutos rojos' },
        { nombre: 'Infusión de hierbaluisa y menta' },
        { nombre: 'Chocolate caliente artesanal', extraPrecio: 2.0 },
      ],
    },
    {
      id: 'banquete-toto',
      titulo: 'Banquete Familiar TOTO',
      subtitulo: 'Elige la segunda pizza artesanal de tu banquete:',
      precioBase: 64.9,
      imagen: 'images/combo-pack-pepperoni.jpg',
      opciones: [
        { nombre: 'La Burrata con pesto genovés', extraPrecio: 4.0 },
        { nombre: 'Diavola Picante con miel de ají' },
        { nombre: 'Prosciutto e Rúcula', extraPrecio: 4.0 },
        { nombre: 'Cuatro Quesos al horno de piedra' },
        { nombre: 'Portobello y ajo confitado' },
      ],
    },
  ];

  readonly paginaActual = signal(0);
  readonly totalPaginas = computed(() => Math.ceil(this.combos.length / 3));
  readonly paginasIndices = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i)
  );

  readonly combosVisibles = computed(() => {
    const inicio = this.paginaActual() * 3;
    return this.combos.slice(inicio, inicio + 3);
  });

  // Guarda qué opción eligió el usuario por cada combo
  readonly selecciones = signal<Record<string, number>>({});
  // Feedback visual temporal al agregar al carrito
  readonly recienAgregado = signal<Record<string, boolean>>({});

  seleccionarOpcion(comboId: string, indiceOpcion: number): void {
    this.selecciones.update((prev) => ({
      ...prev,
      [comboId]: indiceOpcion,
    }));
  }

  estaSeleccionada(comboId: string, indiceOpcion: number): boolean {
    return this.selecciones()[comboId] === indiceOpcion;
  }

  calcularPrecio(combo: ComboPideAhora): string {
    const idx = this.selecciones()[combo.id];
    const extra = idx !== undefined ? combo.opciones[idx]?.extraPrecio ?? 0 : 0;
    return (combo.precioBase + extra).toFixed(2);
  }

  agregarCombo(combo: ComboPideAhora): void {
    // Si aún no marcó opción, selecciona automáticamente la primera
    if (this.selecciones()[combo.id] === undefined) {
      this.seleccionarOpcion(combo.id, 0);
    }

    this.recienAgregado.update((prev) => ({ ...prev, [combo.id]: true }));
    setTimeout(() => {
      this.recienAgregado.update((prev) => ({ ...prev, [combo.id]: false }));
    }, 1400);
  }

  irAPagina(indice: number): void {
    this.paginaActual.set(indice);
  }
}