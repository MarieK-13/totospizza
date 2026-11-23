import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, Plus, Check, X } from 'lucide-angular';

interface Antojito {
  id: string;
  nombre: string;
  imagen: string;
  detalle: string;
  porcion: string;
  precio: number;
}

@Component({
  selector: 'app-recommended-products',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './recommended-products.html',
  styleUrl: './recommended-products.scss',
})
export class RecommendedProducts {
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Plus;
  readonly CheckIcon = Check;
  readonly CloseIcon = X;

  readonly antojitos: Antojito[] = [
    {
      id: 'alitas',
      nombre: 'Alitas',
      imagen: 'images/antojo-alitas.png',
      detalle: 'Alitas crocantes bañadas en salsa BBQ artesanal de la casa con dip ranch.',
      porcion: '8 unidades',
      precio: 22.9,
    },
    {
      id: 'papas-fritas',
      nombre: 'Papas Fritas',
      imagen: 'images/antojo-papas.png',
      detalle: 'Papas nativas doradas al momento con sal de maras y orégano fresco.',
      porcion: 'Porción personal / compartir',
      precio: 14.9,
    },
    {
      id: 'nuggets',
      nombre: 'Nuggets',
      imagen: 'images/antojo-nuggets.png',
      detalle: 'Bocados de pechuga de pollo empanizados al estilo italiano con salsa tártara.',
      porcion: '10 unidades',
      precio: 17.9,
    },
    {
      id: 'pan-de-ajo',
      nombre: 'Pan de Ajo',
      imagen: 'images/antojo-pan-ajo.png',
      detalle: 'Pan artesanal horneado con mantequilla de ajo confitado, mozzarella y perejil.',
      porcion: '4 rebanadas',
      precio: 13.9,
    },
    {
      id: 'onion-rings',
      nombre: 'Onion Rings',
      imagen: 'images/antojo-onion-rings.png',
      detalle: 'Aros de cebolla crujientes acompañados de salsa honey mustard.',
      porcion: '12 unidades',
      precio: 15.9,
    },
    {
      id: 'tequenos',
      nombre: 'Tequeños',
      imagen: 'images/antojo-tequenos.png',
      detalle: 'Rellenos de queso mozzarella fundido con guacamole fresco de la casa.',
      porcion: '6 unidades',
      precio: 16.9,
    },
    {
      id: 'croquetas',
      nombre: 'Croquetas',
      imagen: 'images/antojo-croquetas.png',
      detalle: 'Croquetas cremosas de jamón artesanal y queso parmesano doradas al horno.',
      porcion: '6 unidades',
      precio: 18.9,
    },
  ];

  readonly seleccionadoId = signal<string | null>(null);
  readonly agregadoId = signal<string | null>(null);

  readonly antojitoActivo = computed(() =>
    this.antojitos.find((item) => item.id === this.seleccionadoId()) ?? null
  );

  seleccionarAntojito(id: string): void {
    this.seleccionadoId.update((actual) => (actual === id ? null : id));
  }

  agregarAntojito(item: Antojito): void {
    this.agregadoId.set(item.id);
    setTimeout(() => {
      if (this.agregadoId() === item.id) {
        this.agregadoId.set(null);
      }
    }, 1500);
  }
}