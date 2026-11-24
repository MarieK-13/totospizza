import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

const SECCION_ARMAR_PEDIDO = 'arma-tu-pedido';

/** Navegación compartida entre páginas (botón flotante, Nosotros, Locales...). */
@Injectable({ providedIn: 'root' })
export class NavegacionService {
  private readonly router = inject(Router);

  /** Lleva a la sección "Arma tu pedido" del inicio, aunque se esté en otra página. */
  async irAArmarPedido(): Promise<void> {
    if (this.router.url.split(/[?#]/)[0] !== '/') {
      await this.router.navigateByUrl('/');
    }
    // Espera a que el inicio termine de pintarse (y de volver arriba) antes de desplazar
    setTimeout(() => {
      const destino = document.getElementById(SECCION_ARMAR_PEDIDO);
      const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      destino?.scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth', block: 'start' });
      destino?.focus({ preventScroll: true });
    }, 120);
  }
}
