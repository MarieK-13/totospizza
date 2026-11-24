import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, MailCheck, TriangleAlert } from 'lucide-angular';
import { finalize } from 'rxjs';
import { AuthApi } from '../../../../core/services/api/auth.api';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { ARTE_ACCESO } from '../../auth-art';
import { AuthShell } from '../../components/auth-shell/auth-shell';

@Component({
  selector: 'app-olvide-contrasena',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, TextField, AuthShell],
  templateUrl: './olvide-contrasena.html',
  styleUrl: './olvide-contrasena.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OlvideContrasena {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly api = inject(AuthApi);

  protected readonly MailIcon = Mail;
  protected readonly SentIcon = MailCheck;
  protected readonly AlertIcon = TriangleAlert;
  protected readonly arte = ARTE_ACCESO.login;

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly enviadoA = signal<string | null>(null);

  protected readonly form = this.fb.group({
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
  });

  protected enviar(): void {
    if (this.enviando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const correo = this.form.getRawValue().correo.trim();
    this.enviando.set(true);
    this.error.set(null);

    this.api
      .olvidoContrasena({ correo })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        // El backend responde igual exista o no el correo (no revela quién tiene cuenta)
        next: () => this.enviadoA.set(correo),
        error: (error: unknown) => this.alFallar(error),
      });
  }

  protected corregirCorreo(): void {
    this.enviadoA.set(null);
  }

  private alFallar(error: unknown): void {
    if (esApiException(error) && error.errores.length > 0) {
      const sueltos = aplicarErroresDeCampo(this.form, error.errores);
      if (sueltos.length > 0) this.error.set(sueltos.join(' '));
      return;
    }
    this.error.set(mensajeDeError(error, 'No pudimos enviar el enlace. Intenta de nuevo.'));
  }
}
