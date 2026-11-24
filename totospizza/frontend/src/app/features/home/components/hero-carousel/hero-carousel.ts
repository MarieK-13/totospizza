import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';

/** Mismos tres colores de fondo que el backend (ColorPromocion). */
type TemaPromo = 'rojo' | 'verde' | 'blanco';

interface HeroSlide {
  readonly tema: TemaPromo;
  readonly etiqueta: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly precioAnterior: string;
  readonly precioActual: string;
  readonly ctaTexto: string;
  readonly ctaRuta: string;
  readonly notaLegal: string;
  readonly imagen: string;
  readonly imagenAlt: string;
}

const INTERVALO_MS = 6500;

/** Carrusel de promociones: imagen de banner a todo el ancho y el contenido a la izquierda. */
@Component({
  selector: 'app-hero-carousel',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCarousel implements OnInit, OnDestroy {
  protected readonly ChevronLeftIcon = ChevronLeft;
  protected readonly ChevronRightIcon = ChevronRight;
  protected readonly ArrowRightIcon = ArrowRight;
  protected readonly intervaloMs = INTERVALO_MS;

  protected readonly slides: readonly HeroSlide[] = [
    {
      tema: 'rojo',
      etiqueta: 'Promo familiar',
      titulo: 'La noche sabe mejor en familia',
      descripcion:
        '2 pizzas grandes + palitos al ajo + gaseosa de 1.5 L. Masa artesanal, horno de piedra y mucho queso.',
      precioAnterior: 'S/ 89.90',
      precioActual: 'S/ 69.90',
      ctaTexto: 'Pedir esta promo',
      ctaRuta: '/menu',
      notaLegal: '*Válido de lunes a jueves. Personaliza tus pizzas sin costo adicional.',
      imagen: 'images/hero-promo-familiar.jpg',
      imagenAlt: 'Familia compartiendo dos pizzas artesanales y palitos al ajo',
    },
    {
      tema: 'blanco',
      etiqueta: 'Combo',
      titulo: 'Pizza + palitos + gaseosa',
      descripcion: 'La cena rápida para dos con masa artesanal y sabor casero.',
      precioAnterior: 'S/ 49.90',
      precioActual: 'S/ 39.90',
      ctaTexto: 'Ver combo',
      ctaRuta: '/menu',
      notaLegal: '*Válido de lunes a jueves. Personaliza tus pizzas sin costo adicional.',
      imagen: 'images/hero-combo.jpg',
      imagenAlt: 'Pizza artesanal recién salida del horno en caja',
    },
    {
      tema: 'verde',
      etiqueta: 'Oferta',
      titulo: 'Pizza veggie + ensalada',
      descripcion: 'Una opción fresca y artesanal para compartir con ingredientes de temporada.',
      precioAnterior: 'S/ 59.90',
      precioActual: 'S/ 49.90',
      ctaTexto: 'Ver oferta',
      ctaRuta: '/menu',
      notaLegal: '*Válido de lunes a jueves. Personaliza tus pizzas sin costo adicional.',
      imagen: 'images/hero-oferta-veggie.jpg',
      imagenAlt: 'Pizza vegetariana artesanal sobre tabla de madera',
    },
  ];

  protected readonly actual = signal(0);
  /** Cambia en cada avance para reiniciar la barra de progreso. */
  protected readonly ciclo = signal(0);
  protected readonly pausado = signal(false);

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.iniciar();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  protected siguiente(): void {
    this.ir((this.actual() + 1) % this.slides.length);
  }

  protected anterior(): void {
    this.ir((this.actual() - 1 + this.slides.length) % this.slides.length);
  }

  protected ir(indice: number): void {
    this.actual.set(indice);
    this.ciclo.update((n) => n + 1);
    this.iniciar();
  }

  protected pausar(valor: boolean): void {
    this.pausado.set(valor);
    if (valor) {
      clearInterval(this.timer);
    } else {
      this.iniciar();
    }
  }

  private iniciar(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.siguiente(), INTERVALO_MS);
  }
}
