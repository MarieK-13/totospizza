import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ADMIN_NAV } from '../../core/constants/navigation';
import { Bell, LucideAngularModule } from 'lucide-angular';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, Sidebar, Topbar, LucideAngularModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeSidebar()' },
})
export class DashboardLayout {
  protected readonly nav = ADMIN_NAV;
  protected readonly title: string = inject(ActivatedRoute).snapshot.data['titulo'] ?? 'Administración';
  protected readonly BellIcon = Bell;
  protected readonly sidebarOpen = signal(false);

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
