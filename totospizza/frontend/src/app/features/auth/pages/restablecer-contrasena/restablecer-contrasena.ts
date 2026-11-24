import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Lock, LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { finalize, startWith } from 'rxjs';
import { AuthApi } from '../../../../core/services/api/auth.api';
import { ToastService } from '../../../../core/services/toast.service';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { matchFields, passwordValidator } from '../../../../core/utils/form-validators';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { ARTE_ACCESO } from '../../auth-art';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { PasswordStrength } from '../../components/password-strength/password-strength';

@Component({
  selector: 'app-restablecer-contrasena',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, TextField, PasswordStrength, AuthShell],
  templateUrl: './restablecer-contrasena.html',
  styleUrl: './restablecer-contrasena.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestablecerContrasena {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly LockIcon = Lock;
  protected readonly AlertIcon = TriangleAlert;
  protected readonly arte = ARTE_ACCESO.login;

  private readonly tokenUrl = inject(ActivatedRoute).snapshot.queryParamMap.get('token')?.trim() ?? '';
  protected readonly pideToken = this.tokenUrl === '';

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly tokenVencido = signal(false);

  protected readonly form = this.fb.group(
    {
      token: [this.tokenUrl, this.pideToken ? [Validators.required] : []],
      nuevaContrasena: ['', [Validators.required, passwordValidator, Validators.maxLength(72)]],
      confirmarContrasena: ['', [Validators.required]],
    },
    { validators: matchFields('nuevaContrasena', 'confirmarContrasena') },
  );

  protected readonly contrasena = toSignal(
    this.form.controls.nuevaContrasena.valueChanges.pipe(startWith('')),
    { requireSync: true },
  );

  protected enviar(): void {
    if (this.enviando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);
    this.tokenVencido.set(false);

    this.api
      .restablecerContrasena({ token: v.token.trim(), nuevaContrasena: v.nuevaContrasena, confirmarContrasena: v.confirmarContrasena })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Contraseña actualizada', 'Ya puedes iniciar sesión.');
          void this.router.navigateByUrl('/login');
        },
        error: (error: unknown) => this.alFallar(error),
      });
  }

  private alFallar(error: unknown): void {
    if (esApiException(error)) {
      if (error.codigo === 'TOKEN_INVALIDO') this.tokenVencido.set(true);
      if (error.codigo === 'CONTRASENA_REPETIDA') {
        aplicarErroresDeCampo(this.form, [{ campo: 'nuevaContrasena', mensaje: error.message }]);
        return;
      }
      if (error.errores.length > 0) {
        const sueltos = aplicarErroresDeCampo(this.form, error.errores);
        if (sueltos.length > 0) this.error.set(sueltos.join(' '));
        return;
      }
    }
    this.error.set(mensajeDeError(error, 'No pudimos cambiar tu contraseña. Intenta de nuevo.'));
  }
}
