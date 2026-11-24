import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, Check, ChevronLeft, ChevronRight, LucideAngularModule, Plus } from 'lucide-angular';
import { finalize } from 'rxjs';
import type { PromocionResponse } from '../../../../core/models/api';
import { AgregarRapidoService } from '../../../../core/services/agregar-rapido.service';
import { formatearSoles } from '../../../../core/utils/money';

type TemaPromo = 'rojo' | 'verde' | 'blanco';

interface HeroSlide {
  readonly promo: PromocionResponse;
  readonly tema: TemaPromo;
  readonly precioAnterior: string | null;
  readonly precioActual: string;
  readonly imagen: string;
}

const INTERVALO_MS = 6500;
const IMAGEN_POR_DEFECTO = 'images/hero-combo.jpg';

@Component({
  selector: 'app-hero-carousel',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCarousel {
  private readonly agregarRapido = inject(AgregarRapidoService);

  readonly promociones = input<readonly PromocionResponse[]>([]);
  readonly cargando = input(false);

  protected readonly ChevronLeftIcon = ChevronLeft;
  protected readonly ChevronRightIcon = ChevronRight;
  protected readonly ArrowRightIcon = ArrowRight;
  protected readonly PlusIcon = Plus;
  protected readonly CheckIcon = Check;
  protected readonly intervaloMs = INTERVALO_MS;

  protected readonly slides = computed<readonly HeroSlide[]>(() =>
    this.promociones().map((promo) => ({
      promo,
      tema: promo.colorFondo.toLowerCase() as TemaPromo,
      precioAnterior: promo.precioAnterior && promo.precioAnterior > promo.precioPromocional ? formatearSoles(promo.precioAnterior) : null,
      precioActual: formatearSoles(promo.precioPromocional),
      imagen: promo.imagenUrl ?? IMAGEN_POR_DEFECTO,
    })),
  );

  protected readonly actual = signal(0);
  protected readonly ciclo = signal(0);
  protected readonly pausado = signal(false);
  protected readonly agregandoId = signal<number | null>(null);
  protected readonly agregadoId = signal<number | null>(null);

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => {
      const total = this.slides().length;
      if (this.actual() >= total) this.actual.set(0);
      if (total > 1) this.iniciar();
      else clearInterval(this.timer);
    });
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected siguiente(): void {
    this.ir((this.actual() + 1) % this.slides().length);
  }

  protected anterior(): void {
    this.ir((this.actual() - 1 + this.slides().length) % this.slides().length);
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

  protected pedir(promo: PromocionResponse): void {
    if (this.agregandoId() !== null) return;
    this.agregandoId.set(promo.id);
    this.agregarRapido
      .agregarPromocion(promo)
      .pipe(finalize(() => this.agregandoId.set(null)))
      .subscribe({
        next: (resultado) => {
          if (resultado !== 'agregado') return;
          this.agregadoId.set(promo.id);
          setTimeout(() => this.agregadoId.set(null), 2000);
        },
        error: () => undefined,
      });
  }

  private iniciar(): void {
    clearInterval(this.timer);
    if (this.slides().length > 1 && !this.pausado()) this.timer = setInterval(() => this.siguiente(), INTERVALO_MS);
  }
}
