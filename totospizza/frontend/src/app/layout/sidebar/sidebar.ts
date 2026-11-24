import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { House, LogOut, LucideAngularModule, X } from 'lucide-angular';
import type { NavItem } from '../../core/models/nav-item.model';
import { iniciales } from '../../core/utils/roles';

/** Menú lateral oscuro del panel. Reutilizable: recibe los enlaces del rol. */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-open]': 'opened()' },
})
export class Sidebar {
  readonly items = input.required<readonly NavItem[]>();
  readonly userName = input('Usuario');
  readonly userRole = input('');
  readonly opened = input(false);

  readonly closed = output<void>();
  readonly logout = output<void>();

  protected readonly initials = computed(() => {
    const [nombre = '', apellido = ''] = this.userName().split(' ').filter(Boolean);
    return iniciales(nombre, apellido);
  });

  protected readonly LogoutIcon = LogOut;
  protected readonly HomeIcon = House;
  protected readonly CloseIcon = X;
}
