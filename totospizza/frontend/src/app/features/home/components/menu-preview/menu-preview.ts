import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, ChevronLeft, ChevronRight, LucideAngularModule, Plus } from 'lucide-angular';
import { ToastService } from '../../../../core/services/toast.service';

type Categoria = 'Clásicas' | 'Especiales' | 'Vegetarianas' | 'Picantes';
type TipoTag = 'alergeno' | 'dieta' | 'picante';

/** Etiquetas que existen en el backend (tabla etiquetas). */
interface Tag {
  readonly label: string;
  readonly tipo: TipoTag;
}

interface Pizza {
  readonly nombre: string;
  readonly etiqueta: string;
  readonly categoria: Categoria;
  readonly rating: number;
  readonly detalle: string;
  readonly precio: number;
  readonly imagen: string;
  readonly tags: readonly Tag[];
}

const GLUTEN: Tag = { label: 'Contiene Gluten', tipo: 'alergeno' };
const LACTEOS: Tag = { label: 'Contiene Lácteos', tipo: 'alergeno' };
const FRUTOS_SECOS: Tag = { label: 'Contiene Frutos Secos', tipo: 'alergeno' };
const VEGETARIANA: Tag = { label: 'Vegetariana', tipo: 'dieta' };
const PICANTE: Tag = { label: 'Picante', tipo: 'picante' };

@Component({
  selector: 'app-menu-preview',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './menu-preview.html',
  styleUrl: './menu-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPreview {
  private readonly toast = inject(ToastService);

  protected readonly ArrowRightIcon = ArrowRight;
  protected readonly PlusIcon = Plus;
  protected readonly PrevIcon = ChevronLeft;
  protected readonly NextIcon = ChevronRight;

  protected readonly pizzas: readonly Pizza[] = [
    { nombre: 'La Burrata', etiqueta: 'Favorita', categoria: 'Especiales', rating: 4.9, detalle: 'Pomodoro, burrata cremosa, pesto y tomates confitados.', precio: 42.9, imagen: 'images/burrata.jpg', tags: [GLUTEN, LACTEOS, FRUTOS_SECOS, VEGETARIANA] },
    { nombre: 'Diavola Picante', etiqueta: 'Picantita', categoria: 'Picantes', rating: 4.9, detalle: 'Salame italiano, mozzarella, ají limo y miel picante.', precio: 39.9, imagen: 'images/diavola.jpg', tags: [GLUTEN, LACTEOS, PICANTE] },
    { nombre: 'Prosciutto e Rúcula', etiqueta: 'Premium', categoria: 'Especiales', rating: 4.9, detalle: 'Prosciutto, rúcula, parmesano y aceite de oliva.', precio: 44.9, imagen: 'images/prosciutto.jpg', tags: [GLUTEN, LACTEOS] },
    { nombre: 'Portobello', etiqueta: 'Veggie', categoria: 'Vegetarianas', rating: 4.9, detalle: 'Hongos, mozzarella, ajo confitado y tomillo fresco.', precio: 37.9, imagen: 'images/portobello.jpg', tags: [GLUTEN, LACTEOS, VEGETARIANA] },
    { nombre: 'Margherita Verace', etiqueta: 'Clásica', categoria: 'Clásicas', rating: 4.9, detalle: 'Salsa San Marzano, fior di latte, albahaca fresca y oliva.', precio: 32.9, imagen: 'images/margherita.jpg', tags: [GLUTEN, LACTEOS, VEGETARIANA] },
    { nombre: 'Cuatro Quesos', etiqueta: 'Cremosa', categoria: 'Clásicas', rating: 4.8, detalle: 'Mozzarella, gorgonzola dulce, parmesano y provolone.', precio: 41.9, imagen: 'images/ternera.jpg', tags: [GLUTEN, LACTEOS, VEGETARIANA] },
    { nombre: 'Pepperoni Artesanal', etiqueta: 'Top ventas', categoria: 'Clásicas', rating: 4.9, detalle: 'Doble pepperoni crocante, mozzarella fundida y orégano.', precio: 38.9, imagen: 'images/pepperoni.jpg', tags: [GLUTEN, LACTEOS] },
    { nombre: 'Andina', etiqueta: 'Sabor peruano', categoria: 'Picantes', rating: 4.8, detalle: 'Chorizo artesanal, rocoto, cebolla encurtida, choclo y huacatay.', precio: 42.9, imagen: 'images/andina.jpg', tags: [GLUTEN, LACTEOS, PICANTE] },
    { nombre: 'La Verde', etiqueta: 'Veggie', categoria: 'Vegetarianas', rating: 4.8, detalle: 'Pesto de albahaca, zucchini, alcachofa, aceituna y ricotta.', precio: 38.9, imagen: 'images/verde.jpg', tags: [GLUTEN, LACTEOS, FRUTOS_SECOS, VEGETARIANA] },
    { nombre: 'Carnívora TOTO', etiqueta: 'Intensa', categoria: 'Especiales', rating: 4.9, detalle: 'Salchicha italiana, tocino ahumado, pepperoni y cebolla morada.', precio: 45.9, imagen: 'images/carnivora.jpg', tags: [GLUTEN, LACTEOS] },
  ];

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly canPrev = signal(false);
  protected readonly canNext = signal(true);

  protected onScroll(): void {
    const el = this.track().nativeElement;
    this.canPrev.set(el.scrollLeft > 4);
    this.canNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  /** Avanza o retrocede una "página" de tarjetas visibles. */
  protected mover(direccion: 1 | -1): void {
    const el = this.track().nativeElement;
    el.scrollBy({ left: direccion * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  protected agregar(pizza: Pizza): void {
    this.toast.success('Agregada a tu pedido', `${pizza.nombre} · S/ ${pizza.precio.toFixed(2)}`);
  }
}
