import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, Menu } from 'lucide-angular';

@Component({
  selector: 'app-topbar',
  imports: [LucideAngularModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar {
  readonly title = input('');
  readonly showMenuButton = input(true);

  readonly menuToggle = output<void>();

  protected readonly MenuIcon = Menu;
}
