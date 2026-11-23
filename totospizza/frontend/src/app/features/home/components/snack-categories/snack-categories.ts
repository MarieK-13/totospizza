import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, PlusCircle, CheckCircle2 } from 'lucide-angular';

type CategoriaMenu = 'Pizzas Clasicas' | 'Especiales' | 'Vegetariana' | 'Bebidas';

interface ItemMenu {
  id: string;
  categoria: CategoriaMenu;
  etiqueta?: string;
  nombre: string;
  detalle: string;
  precio: number;
  imagen: string;
}

@Component({
  selector: 'app-snack-categories',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './snack-categories.html',
  styleUrl: './snack-categories.scss',
})
export class SnackCategories {
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusCircleIcon = PlusCircle;
  readonly CheckCircleIcon = CheckCircle2;

  readonly categorias: CategoriaMenu[] = [
    'Pizzas Clasicas',
    'Especiales',
    'Vegetariana',
    'Bebidas',
  ];

  readonly items: ItemMenu[] = [
    // Tab 1: Pizzas Clasicas (las 6 exactas de tu prototipo)
    {
      id: 'margherita',
      categoria: 'Pizzas Clasicas',
      etiqueta: 'CLÁSICA',
      nombre: 'Margherita',
      detalle: 'Pomodoro San Marzano, fior di latte, albahaca y oliva extra virgen.',
      precio: 32.9,
      imagen: 'images/margherita.jpg',
    },
    {
      id: 'pepperoni-casa',
      categoria: 'Pizzas Clasicas',
      etiqueta: 'MÁS PEDIDA',
      nombre: 'Pepperoni de la Casa',
      detalle: 'Pepperoni crocante, mozzarella y parmesano sobre nuestra salsa roja.',
      precio: 36.9,
      imagen: 'images/pepperoni.jpg',
    },
    {
      id: 'ternera',
      categoria: 'Pizzas Clasicas',
      nombre: 'Ternera',
      detalle: 'Mozzarella, gorgonzola, provolone, parmesano y ricotta.',
      precio: 41.9,
      imagen: 'images/ternera.jpg',
    },
    {
      id: 'carnivora',
      categoria: 'Pizzas Clasicas',
      nombre: 'Carnívora',
      detalle: 'Pepperoni, salchicha italiana, tocino, jamón y mozzarella.',
      precio: 45.9,
      imagen: 'images/carnivora.jpg',
    },
    {
      id: 'la-verde',
      categoria: 'Pizzas Clasicas',
      etiqueta: 'VEGGIE',
      nombre: 'La Verde',
      detalle: 'Pesto de albahaca, zucchini, alcachofa, aceituna y ricotta.',
      precio: 38.9,
      imagen: 'images/verde.jpg',
    },
    {
      id: 'andina',
      categoria: 'Pizzas Clasicas',
      etiqueta: 'SABOR PERUANO',
      nombre: 'Andina',
      detalle: 'Chorizo artesanal, rocoto, cebolla encurtida, choclo y huacatay.',
      precio: 42.9,
      imagen: 'images/andina.jpg',
    },

    // Tab 2: Especiales
    {
      id: 'burrata-pesto',
      categoria: 'Especiales',
      etiqueta: 'FAVORITA',
      nombre: 'La Burrata',
      detalle: 'Pomodoro artesanal, burrata fresca entera, pesto genovés y tomates confitados.',
      precio: 44.9,
      imagen: 'images/burrata.jpg',
    },
    {
      id: 'prosciutto-rucula',
      categoria: 'Especiales',
      etiqueta: 'PREMIUM',
      nombre: 'Prosciutto e Rúcula',
      detalle: 'Prosciutto crudo curado, rúcula selvática, lascas de parmesano y aceite de oliva.',
      precio: 45.9,
      imagen: 'images/prosciutto.jpg',
    },
    {
      id: 'diavola-miel',
      categoria: 'Especiales',
      etiqueta: 'PICANTITA',
      nombre: 'Diavola Picante',
      detalle: 'Salame picante italiano, mozzarella fior di latte, ají limo y miel de abeja.',
      precio: 40.9,
      imagen: 'images/diavola.jpg',
    },
    {
      id: 'tartufata-especial',
      categoria: 'Especiales',
      etiqueta: 'DE AUTOR',
      nombre: 'Tartufata',
      detalle: 'Crema de trufa negra, champiñones salteados, mozzarella y parmesano reggiano.',
      precio: 46.9,
      imagen: 'images/portobello.jpg',
    },

    // Tab 3: Vegetariana
    {
      id: 'portobello-confit',
      categoria: 'Vegetariana',
      etiqueta: 'VEGGIE',
      nombre: 'Portobello & Ajo Confitado',
      detalle: 'Hongos portobello asados, mozzarella, ajo confitado suave y tomillo fresco.',
      precio: 37.9,
      imagen: 'images/portobello.jpg',
    },
    {
      id: 'huerta-iquena',
      categoria: 'Vegetariana',
      etiqueta: 'DE TEMPORADA',
      nombre: 'Huerta Iqueña',
      detalle: 'Espárragos verdes a la brasa, pimientos asados, aceitunas botija y queso fresco.',
      precio: 38.9,
      imagen: 'images/menu-la-verde.jpg',
    },
    {
      id: 'cuatro-quesos-veggie',
      categoria: 'Vegetariana',
      nombre: 'Quattro Formaggi',
      detalle: 'Mozzarella, gorgonzola dulce, provolone ahumado y parmesano estacionado.',
      precio: 41.9,
      imagen: 'images/menu-margherita.jpg',
    },
    {
      id: 'caprese-fresca',
      categoria: 'Vegetariana',
      nombre: 'Caprese al Horno',
      detalle: 'Rodajas de tomate orgánico, bocconcini de mozzarella, albahaca y reducción balsámica.',
      precio: 36.9,
      imagen: 'images/pizza-burrata.jpg',
    },

    // Tab 4: Bebidas
    {
      id: 'limonada-frutos-rojos',
      categoria: 'Bebidas',
      etiqueta: 'ARTESANAL',
      nombre: 'Limonada de Frutos Rojos',
      detalle: 'Preparada al momento con fresas, arándanos, jugo de limón fresco y toque de menta.',
      precio: 12.9,
      imagen: 'images/combo-bebida-piqueo.jpg',
    },
    {
      id: 'limonada-hierbabuena',
      categoria: 'Bebidas',
      etiqueta: 'REFRESCANTE',
      nombre: 'Limonada con Hierbabuena',
      detalle: 'Limón sutil recién exprimido, hojas de hierbabuena fresca y hielo frappé.',
      precio: 10.9,
      imagen: 'images/combo-bebidaA.jpg',
    },
    {
      id: 'inca-kola-500',
      categoria: 'Bebidas',
      nombre: 'Inca Kola 500 ml',
      detalle: 'Botella personal helada para acompañar tu pizza recién salida del horno.',
      precio: 6.5,
      imagen: 'images/InkaK.jpg',
    },
    {
      id: 'coca-cola-500',
      categoria: 'Bebidas',
      nombre: 'Coca-Cola 500 ml',
      detalle: 'Botella personal helada (versión original o sin azúcar).',
      precio: 6.5,
      imagen: 'images/cocacola.jpg',
    },
  ];

  readonly categoriaActiva = signal<CategoriaMenu>('Pizzas Clasicas');
  readonly agregadoId = signal<string | null>(null);

  readonly itemsFiltrados = computed(() =>
    this.items.filter((item) => item.categoria === this.categoriaActiva())
  );

  seleccionarCategoria(cat: CategoriaMenu): void {
    this.categoriaActiva.set(cat);
  }

  agregarProducto(item: ItemMenu): void {
    this.agregadoId.set(item.id);
    setTimeout(() => {
      if (this.agregadoId() === item.id) {
        this.agregadoId.set(null);
      }
    }, 1400);
  }
}