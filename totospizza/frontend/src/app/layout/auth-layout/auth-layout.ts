import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

/** Estructura de inicio de sesión y registro: panel de marca + formulario. */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, LucideAngularModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  protected readonly BackIcon = ArrowLeft;
}
