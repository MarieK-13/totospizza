import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CircleAlert, LockKeyhole, LucideAngularModule } from 'lucide-angular';
import { AuthApi } from '../../../../core/services/api/auth.api';
import { ToastService } from '../../../../core/services/toast.service';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { PASSWORD_RULES, matchFields, passwordValidator } from '../../../../core/utils/form-validators';
import { TextField } from '../../../../shared/components/text-field/text-field';

@Component({
  selector: 'app-password-form',
  imports: [ReactiveFormsModule, LucideAngularModule, TextField],
  templateUrl: './password-form.html',
  styleUrl: './password-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordForm {
  private readonly api = inject(AuthApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly form = this.fb.group(
    {
      contrasenaActual: ['', [Validators.required]],
      nuevaContrasena: ['', [Validators.required, passwordValidator]],
      confirmarContrasena: ['', [Validators.required]],
    },
    { validators: matchFields('nuevaContrasena', 'confirmarContrasena') },
  );

  protected readonly abierto = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly reglas = PASSWORD_RULES;

  protected readonly LockIcon = LockKeyhole;
  protected readonly AlertIcon = CircleAlert;

  protected alternar(): void {
    if (this.abierto()) this.cancelar();
    else this.abierto.set(true);
  }

  protected cancelar(): void {
    this.form.reset();
    this.error.set(null);
    this.abierto.set(false);
  }

  protected enviar(): void {
    if (this.enviando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);

    this.api
      .cambiarContrasena(this.form.getRawValue())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Contraseña actualizada', 'Úsala la próxima vez que inicies sesión.');
          this.cancelar();
        },
        error: (error: unknown) => {
          if (esApiException(error) && error.errores.length > 0) {
            const sueltos = aplicarErroresDeCampo(this.form, error.errores);
            this.error.set(sueltos.length > 0 ? sueltos.join(' ') : 'Revisa los campos marcados.');
            return;
          }
          this.error.set(mensajeDeError(error, 'No pudimos cambiar tu contraseña. Intenta de nuevo.'));
        },
      });
  }
}
