import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-angular';

interface HeroSlide {
  tema: 'rojo' | 'blanco' | 'verde';
  etiqueta: string;
  titulo: string;
  descripcion: string;
  precioAnterior: string;
  precioActual: string;
  ctaTexto: string;
  ctaRuta: string;
  notaLegal: string;
  imagen: string;
  imagenAlt: string;
  mostrarSello?: boolean;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.scss',
})
export class HeroCarousel implements OnInit, OnDestroy {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly ArrowRightIcon = ArrowRight;

  readonly slides: HeroSlide[] = [
    {
      tema: 'rojo',
      etiqueta: 'PROMO FAMILIAR',
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
      mostrarSello: true,
    },
    {
      tema: 'blanco',
      etiqueta: 'COMBO',
      titulo: 'Pizza + palitos + gaseosa',
      descripcion:
        'La cena rápida para dos con masa artesanal y sabor casero.',
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
      etiqueta: 'OFERTA',
      titulo: 'Pizza veggie + ensalada',
      descripcion:
        'Una opción fresca y artesanal para compartir con ingredientes de temporada.',
      precioAnterior: 'S/ 59.90',
      precioActual: 'S/ 49.90',
      ctaTexto: 'Ver oferta',
      ctaRuta: '/menu',
      notaLegal: '*Válido de lunes a jueves. Personaliza tus pizzas sin costo adicional.',
      imagen: 'images/hero-oferta-veggie.jpg',
      imagenAlt: 'Pizza vegetariana artesanal sobre tabla de madera',
    },
  ];

  readonly actual = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.iniciarAutoplay();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  iniciarAutoplay(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.siguiente(), 6000);
  }

  siguiente(): void {
    this.actual.update((i) => (i + 1) % this.slides.length);
  }

  anterior(): void {
    this.actual.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }

  ir(i: number): void {
    this.actual.set(i);
    this.iniciarAutoplay();
  }
}