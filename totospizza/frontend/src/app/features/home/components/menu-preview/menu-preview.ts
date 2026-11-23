import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, Plus, Star } from 'lucide-angular';

interface PizzaRecomendada {
  nombre: string;
  etiqueta: string;
  rating: string;
  detalle: string;
  precio: string;
  imagen: string;
}

@Component({
  selector: 'app-menu-preview',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './menu-preview.html',
  styleUrl: './menu-preview.scss',
})
export class MenuPreview {
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Plus;
  readonly StarIcon = Star;
  readonly estrellas = [1, 2, 3, 4, 5];

  // 12 pizzas distribuidas en 3 páginas de 4 tarjetas para el carrusel
  readonly productos: PizzaRecomendada[] = [
    // Página 1 (las 4 exactas de tu prototipo)
    {
      nombre: 'La Burrata',
      etiqueta: 'FAVORITA',
      rating: '4.9',
      detalle: 'Pomodoro, burrata cremosa, pesto y tomates confitados.',
      precio: '42.90',
      imagen: 'images/burrata.jpg',
    },
    {
      nombre: 'Diavola Picante',
      etiqueta: 'PICANTITA',
      rating: '4.9',
      detalle: 'Salame italiano, mozzarella, ají limo y miel picante.',
      precio: '39.90',
      imagen: 'images/diavola.jpg',
    },
    {
      nombre: 'Prosciutto e Rúcula',
      etiqueta: 'PREMIUM',
      rating: '4.9',
      detalle: 'Prosciutto, rúcula, parmesano y aceite de oliva.',
      precio: '44.90',
      imagen: 'images/prosciutto.jpg',
    },
    {
      nombre: 'Portobello',
      etiqueta: 'VEGGIE',
      rating: '4.9',
      detalle: 'Hongos, mozzarella, ajo confitado y tomillo fresco.',
      precio: '37.90',
      imagen: 'images/portobello.jpg',
    },

    // Página 2
    {
      nombre: 'Margherita Verace',
      etiqueta: 'CLÁSICA',
      rating: '4.9',
      detalle: 'Salsa San Marzano, fior di latte, albahaca fresca y oliva.',
      precio: '32.90',
      imagen: 'images/burrata.jpg',
    },
    {
      nombre: 'Cuatro Quesos',
      etiqueta: 'CREMOSA',
      rating: '4.8',
      detalle: 'Mozzarella, gorgonzola dulce, parmesano reggiano y provolone.',
      precio: '41.90',
      imagen: 'images/prosciutto.jpg',
    },
    {
      nombre: 'Pepperoni Artesanal',
      etiqueta: 'TOP VENTAS',
      rating: '4.9',
      detalle: 'Doble pepperoni crocante, mozzarella fundida y orégano de campo.',
      precio: '38.90',
      imagen: 'images/diavola.jpg',
    },
    {
      nombre: 'Hawaiana al Horno',
      etiqueta: 'DULCE & SALADA',
      rating: '4.8',
      detalle: 'Piña caramelizada al horno de piedra, jamón artesanal y queso.',
      precio: '36.90',
      imagen: 'images/portobello.jpg',
    },

    // Página 3
    {
      nombre: 'Tartufata',
      etiqueta: 'DE AUTOR',
      rating: '5.0',
      detalle: 'Crema de trufa negra, champiñones salteados y lascas de parmesano.',
      precio: '46.90',
      imagen: 'images/portobello.jpg',
    },
    {
      nombre: 'Mediterránea',
      etiqueta: 'VEGGIE',
      rating: '4.8',
      detalle: 'Alcachofas, aceitunas botija, pimientos asados y queso feta.',
      precio: '38.90',
      imagen: 'images/pizza-burrata.jpg',
    },
    {
      nombre: 'Carnívora TOTO',
      etiqueta: 'INTENSA',
      rating: '4.9',
      detalle: 'Salchicha italiana, tocino ahumado, pepperoni y cebolla morada.',
      precio: '45.90',
      imagen: 'images/pizza-diavola.jpg',
    },
    {
      nombre: 'Pera & Gorgonzola',
      etiqueta: 'GOURMET',
      rating: '4.9',
      detalle: 'Peras asadas, queso azul, nueces tostadas y reducción balsámica.',
      precio: '43.90',
      imagen: 'images/pizza-prosciutto.jpg',
    },
  ];

  readonly paginaActual = signal(0);
  readonly totalPaginas = computed(() => Math.ceil(this.productos.length / 4));
  readonly paginasIndices = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i)
  );

  readonly productosVisibles = computed(() => {
    const inicio = this.paginaActual() * 4;
    return this.productos.slice(inicio, inicio + 4);
  });

  irAPagina(indice: number): void {
    this.paginaActual.set(indice);
  }
}