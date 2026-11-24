import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { formatearHora } from '../../../../core/utils/fechas';

const RADIO = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

/**
 * Reloj de cuenta regresiva hasta la entrega estimada.
 * El anillo se vacía a medida que pasa el tiempo; al llegar a cero muestra "Llegando".
 */
@Component({
  selector: 'app-eta-countdown',
  templateUrl: './eta-countdown.html',
  styleUrl: './eta-countdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtaCountdown {
  /** Instante ISO de la entrega estimada (del seguimiento). */
  readonly entregaEstimada = input.required<string>();
  /** Duración total estimada, para dibujar cuánto del anillo queda. */
  readonly minutosTotales = input<number | null>(null);
  readonly etiqueta = input('Tiempo estimado');

  private readonly ahora = signal(Date.now());

  protected readonly circunferencia = CIRCUNFERENCIA;
  protected readonly radio = RADIO;

  protected readonly segundosRestantes = computed(() =>
    Math.max(0, Math.round((new Date(this.entregaEstimada()).getTime() - this.ahora()) / 1000)),
  );

  protected readonly reloj = computed(() => {
    const s = this.segundosRestantes();
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  });

  /** Fracción que queda (1 = recién empezó, 0 = ya debería llegar). */
  protected readonly fraccion = computed(() => {
    const total = (this.minutosTotales() ?? 0) * 60;
    if (total <= 0) return this.segundosRestantes() > 0 ? 1 : 0;
    return Math.min(1, this.segundosRestantes() / total);
  });

  protected readonly desfase = computed(() => CIRCUNFERENCIA * (1 - this.fraccion()));
  protected readonly horaEstimada = computed(() => formatearHora(this.entregaEstimada()));
  protected readonly vencido = computed(() => this.segundosRestantes() === 0);
  /** Lectores de pantalla: solo minutos, para no anunciar cada segundo. */
  protected readonly textoAccesible = computed(() => {
    const m = Math.ceil(this.segundosRestantes() / 60);
    return this.vencido() ? 'Tu pedido está por llegar' : `Faltan unos ${m} minutos`;
  });

  constructor() {
    const id = setInterval(() => this.ahora.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
}
