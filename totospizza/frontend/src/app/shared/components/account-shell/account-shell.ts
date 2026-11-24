import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogOut, LucideAngularModule, Package, UserRound } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Marco común de "Mi cuenta": tarjeta del cliente + navegación lateral (pestañas en móvil)
 * y el contenido de cada página proyectado a la derecha.
 */
@Component({
  selector: 'app-account-shell',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './account-shell.html',
  styleUrl: './account-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountShell {
  readonly titulo = input.required<string>();
  readonly descripcion = input<string>();

  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly iniciales = computed(() => {
    const u = this.auth.usuario();
    if (!u) return '';
    return `${u.nombres.trim().charAt(0)}${u.apellidos.trim().charAt(0)}`.toUpperCase();
  });

  protected readonly enlaces = [
    { ruta: '/perfil', texto: 'Mi perfil', icono: UserRound },
    { ruta: '/mis-pedidos', texto: 'Mis pedidos', icono: Package },
  ] as const;

  protected readonly SalirIcon = LogOut;

  protected cerrarSesion(): void {
    this.auth.logout('/').subscribe(() => this.toast.info('Sesión cerrada', 'Vuelve pronto.'));
  }
}
