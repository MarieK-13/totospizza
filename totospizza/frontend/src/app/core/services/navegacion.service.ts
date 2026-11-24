import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

const SECCION_ARMAR_PEDIDO = 'arma-tu-pedido';

@Injectable({ providedIn: 'root' })
export class NavegacionService {
  private readonly router = inject(Router);

  async irAArmarPedido(): Promise<void> {
    if (this.router.url.split(/[?#]/)[0] !== '/') {
      await this.router.navigateByUrl('/');
    }
    setTimeout(() => {
      const destino = document.getElementById(SECCION_ARMAR_PEDIDO);
      const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      destino?.scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth', block: 'start' });
      destino?.focus({ preventScroll: true });
    }, 120);
  }
}
