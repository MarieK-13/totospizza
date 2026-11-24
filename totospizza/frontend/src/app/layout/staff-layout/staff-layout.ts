import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { LogOut, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-staff-layout',
  imports: [RouterOutlet, RouterLink, LucideAngularModule],
  templateUrl: './staff-layout.html',
  styleUrl: './staff-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffLayout {
  protected readonly title: string = inject(ActivatedRoute).snapshot.data['titulo'] ?? 'Operación';
  protected readonly LogoutIcon = LogOut;
}
