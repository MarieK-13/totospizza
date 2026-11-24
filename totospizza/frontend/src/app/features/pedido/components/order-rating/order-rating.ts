import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { CircleAlert, LucideAngularModule, Star, X } from 'lucide-angular';
import type { ResenaResponse } from '../../../../core/models/api';
import { ClienteApi } from '../../../../core/services/api/cliente.api';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';

const TEXTOS = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', '¡Excelente!'] as const;

/** Producto del pedido que el cliente puede calificar por separado. */
export interface ProductoCalificable {
  readonly productoId: number;
  readonly nombre: string;
}
const MAX_COMENTARIO = 500;

@Component({
  selector: 'app-order-rating',
  imports: [LucideAngularModule],
  templateUrl: './order-rating.html',
  styleUrl: './order-rating.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderRating {
  readonly pedidoId = input.required<number>();
  readonly abierto = input(false);
  readonly productos = input<readonly ProductoCalificable[]>([]);
  readonly calificado = output<ResenaResponse | null>();
  readonly cerrado = output<void>();

  private readonly api = inject(ClienteApi);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  protected readonly estrellas = [1, 2, 3, 4, 5] as const;
  protected readonly calificacion = signal(0);
  protected readonly sobre = signal(0);
  protected readonly comentario = signal('');
  /** Estrellas por producto (0 = sin calificar; calificarlos es opcional). */
  protected readonly porProducto = signal<Readonly<Partial<Record<number, number>>>>({});
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly maxComentario = MAX_COMENTARIO;
  protected readonly textos = TEXTOS;

  protected readonly StarIcon = Star;
  protected readonly CloseIcon = X;
  protected readonly AlertIcon = CircleAlert;

  constructor() {
    effect(() => {
      const dialogo = this.dialogo().nativeElement;
      if (this.abierto() && !dialogo.open) {
        this.calificacion.set(0);
        this.porProducto.set({});
        this.comentario.set('');
        this.error.set(null);
        dialogo.showModal();
      } else if (!this.abierto() && dialogo.open) {
        dialogo.close();
      }
    });
  }

  protected calificarProducto(productoId: number, estrellas: number): void {
    this.porProducto.update((actual) => ({ ...actual, [productoId]: actual[productoId] === estrellas ? 0 : estrellas }));
  }

  protected escribir(evento: Event): void {
    this.comentario.set((evento.target as HTMLTextAreaElement).value);
  }

  protected teclado(evento: KeyboardEvent): void {
    const delta = evento.key === 'ArrowRight' || evento.key === 'ArrowUp' ? 1 : evento.key === 'ArrowLeft' || evento.key === 'ArrowDown' ? -1 : 0;
    if (!delta) return;
    evento.preventDefault();
    this.calificacion.update((n) => Math.min(5, Math.max(1, n + delta)));
  }

  protected enviar(): void {
    if (this.enviando()) return;
    if (this.calificacion() === 0) {
      this.error.set('Elige de 1 a 5 estrellas.');
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    this.api
      .crearResena({
        pedidoId: this.pedidoId(),
        calificacion: this.calificacion(),
        comentario: this.comentario().trim() || null,
        calificaciones: Object.entries(this.porProducto())
          .filter((par): par is [string, number] => (par[1] ?? 0) > 0)
          .map(([productoId, estrellas]) => ({ productoId: Number(productoId), estrellas })),
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (resena) => this.calificado.emit(resena),
        error: (error: unknown) => {
          if (esApiException(error) && error.codigo === 'RESENA_EXISTENTE') {
            this.calificado.emit(null);
            return;
          }
          this.error.set(mensajeDeError(error, 'No pudimos enviar tu opinión. Intenta de nuevo.'));
        },
      });
  }

  protected cerrar(): void {
    if (!this.enviando()) this.cerrado.emit();
  }

  protected alPulsar(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) this.cerrar();
  }

  protected alCancelar(evento: Event): void {
    evento.preventDefault();
    this.cerrar();
  }
}
