import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { LucideAngularModule, Pizza } from 'lucide-angular';

/** Botón flotante "Arma tu pedido": lleva al armador de pizzas (/arma-tu-pizza). */
@Component({
  selector: 'app-order-fab',
  imports: [LucideAngularModule],
  templateUrl: './order-fab.html',
  styleUrl: './order-fab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFab {
  private readonly router = inject(Router);

  /** Se oculta en el menú, el detalle y el propio armador: taparía los botones de agregar al carrito. */
  protected readonly visible = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => this.esVisible(e.urlAfterRedirects)),
      startWith(this.esVisible(this.router.url)),
    ),
    { requireSync: true },
  );

  protected readonly PizzaIcon = Pizza;

  protected irAArmarPedido(): Promise<boolean> {
    return this.router.navigate(['/arma-tu-pizza']);
  }

  private esVisible(url: string): boolean {
    return !/^\/(?:menu|arma-tu-pizza)(?:[/?#]|$)/.test(url);
  }
}
