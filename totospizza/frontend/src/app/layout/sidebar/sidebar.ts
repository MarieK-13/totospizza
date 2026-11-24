import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogOut, LucideAngularModule, X } from 'lucide-angular';
import type { NavItem } from '../../core/models/nav-item.model';

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
  /** Controla el panel deslizante en pantallas pequeñas. */
  readonly opened = input(false);

  readonly closed = output<void>();
  readonly logout = output<void>();

  protected readonly initials = computed(() =>
    this.userName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );

  protected readonly LogoutIcon = LogOut;
  protected readonly CloseIcon = X;
}
