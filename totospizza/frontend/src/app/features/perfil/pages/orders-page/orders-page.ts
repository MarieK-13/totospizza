import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import type { PedidoResumenResponse } from '../../../../core/models/api';
import { ClienteApi } from '../../../../core/services/api/cliente.api';
import { mensajeDeError } from '../../../../core/utils/api-exception';
import { pedidoEnCurso } from '../../../../core/utils/estado-pedido';
import { AccountShell } from '../../../../shared/components/account-shell/account-shell';
import { OrderHistoryItem } from '../../components/order-history-item/order-history-item';

const POR_PAGINA = 10;

@Component({
  selector: 'app-orders-page',
  imports: [RouterLink, AccountShell, OrderHistoryItem],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage {
  private readonly api = inject(ClienteApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly pedidos = signal<readonly PedidoResumenResponse[]>([]);
  private readonly pagina = signal(0);
  protected readonly total = signal(0);
  protected readonly hayMas = signal(false);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly enCurso = computed(() => this.pedidos().filter((p) => pedidoEnCurso(p.estado)));
  protected readonly anteriores = computed(() => this.pedidos().filter((p) => !pedidoEnCurso(p.estado)));
  protected readonly vacio = computed(() => !this.cargando() && !this.error() && this.pedidos().length === 0);
  protected readonly primeraCarga = computed(() => this.cargando() && this.pedidos().length === 0);

  constructor() {
    this.cargar(0);
  }

  protected verMas(): void {
    if (!this.cargando()) this.cargar(this.pagina() + 1);
  }

  protected reintentar(): void {
    this.cargar(this.pagina());
  }

  private cargar(pagina: number): void {
    this.cargando.set(true);
    this.error.set(null);
    this.api
      .misPedidos({ pagina, tamano: POR_PAGINA })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.pedidos.update((actuales) => {
            const ids = new Set(actuales.map((p) => p.id));
            return [...actuales, ...respuesta.contenido.filter((p) => !ids.has(p.id))];
          });
          this.pagina.set(respuesta.pagina);
          this.total.set(respuesta.totalElementos);
          this.hayMas.set(!respuesta.ultima);
          this.cargando.set(false);
        },
        error: (error: unknown) => {
          this.error.set(mensajeDeError(error, 'No pudimos cargar tus pedidos.'));
          this.cargando.set(false);
        },
      });
  }
}
