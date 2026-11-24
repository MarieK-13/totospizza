import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { LucideAngularModule, Pizza } from 'lucide-angular';
import { NavegacionService } from '../../core/services/navegacion.service';

/** Botón flotante que lleva a la sección "Arma tu pedido" del inicio. */
@Component({
  selector: 'app-order-fab',
  imports: [LucideAngularModule],
  templateUrl: './order-fab.html',
  styleUrl: './order-fab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFab {
  private readonly navegacion = inject(NavegacionService);
  private readonly router = inject(Router);

  /** En el menú y el detalle se oculta: taparía los botones de agregar al carrito. */
  protected readonly visible = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => this.esVisible(e.urlAfterRedirects)),
      startWith(this.esVisible(this.router.url)),
    ),
    { requireSync: true },
  );

  protected readonly PizzaIcon = Pizza;

  protected irAArmarPedido(): Promise<void> {
    return this.navegacion.irAArmarPedido();
  }

  private esVisible(url: string): boolean {
    return !/^\/menu(?:[/?#]|$)/.test(url);
  }
}
