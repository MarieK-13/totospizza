import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowRight, Lock, LucideAngularModule, Mail, TriangleAlert } from 'lucide-angular';
import { finalize } from 'rxjs';
import type { UsuarioResponse } from '../../../../core/models/api';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { CheckboxField } from '../../../../shared/components/checkbox-field/checkbox-field';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { ARTE_ACCESO } from '../../auth-art';
import { AuthShell } from '../../components/auth-shell/auth-shell';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, TextField, CheckboxField, AuthShell],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly MailIcon = Mail;
  protected readonly LockIcon = Lock;
  protected readonly AlertIcon = TriangleAlert;
  protected readonly ArrowIcon = ArrowRight;
  protected readonly arte = ARTE_ACCESO.login;

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]],
    recordarme: [false],
  });

  protected enviar(): void {
    if (this.enviando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { correo, contrasena, recordarme } = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);

    this.auth
      .login({ correo: correo.trim(), contrasena }, recordarme)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (usuario) => this.alIngresar(usuario),
        error: (error: unknown) => this.alFallar(error),
      });
  }

  private alIngresar(usuario: UsuarioResponse): void {
    this.toast.success(`¡Hola, ${usuario.nombres.split(' ')[0]}!`, 'Sesión iniciada.');
    void this.router.navigateByUrl(this.destino());
  }

  private alFallar(error: unknown): void {
    if (esApiException(error) && error.errores.length > 0) {
      const sueltos = aplicarErroresDeCampo(this.form, error.errores);
      if (sueltos.length > 0) this.error.set(sueltos.join(' '));
      return;
    }
    this.error.set(mensajeDeError(error, 'No pudimos iniciar tu sesión. Intenta de nuevo.'));
  }

  /** Vuelve a donde la persona quería ir; solo rutas internas (evita redirecciones a otros sitios). */
  private destino(): string {
    const solicitado = this.route.snapshot.queryParamMap.get('returnUrl');
    const esInterna = solicitado !== null && solicitado.startsWith('/') && !solicitado.startsWith('//');
    return esInterna && !solicitado.startsWith('/login') ? solicitado : this.auth.rutaInicio();
  }
}
