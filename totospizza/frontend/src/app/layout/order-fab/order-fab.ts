import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { LucideAngularModule, Pizza } from 'lucide-angular';

@Component({
  selector: 'app-order-fab',
  imports: [LucideAngularModule],
  templateUrl: './order-fab.html',
  styleUrl: './order-fab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFab {
  private readonly router = inject(Router);

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
