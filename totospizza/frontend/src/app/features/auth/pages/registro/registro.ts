import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowLeft, Lock, LucideAngularModule, Mail, TriangleAlert, User } from 'lucide-angular';
import { finalize, startWith } from 'rxjs';
import type { TipoDocumento, UsuarioResponse } from '../../../../core/models/api';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';
import { OPCIONES_DOCUMENTO, REGLAS_DOCUMENTO, ayerIso, documentoValidator, fechaPasadaValidator } from '../../../../core/utils/documento';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { matchFields, passwordValidator, phoneValidator } from '../../../../core/utils/form-validators';
import { CheckboxField } from '../../../../shared/components/checkbox-field/checkbox-field';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { ARTE_ACCESO } from '../../auth-art';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { PasswordStrength } from '../../components/password-strength/password-strength';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, TextField, SelectField, CheckboxField, PasswordStrength, AuthShell],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registro {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly location = inject(Location);

  protected readonly UserIcon = User;
  protected readonly MailIcon = Mail;
  protected readonly LockIcon = Lock;
  protected readonly AlertIcon = TriangleAlert;
  protected readonly BackIcon = ArrowLeft;
  protected readonly arte = ARTE_ACCESO.registro;
  protected readonly opcionesDocumento = OPCIONES_DOCUMENTO;
  protected readonly fechaMaxima = ayerIso();

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group(
    {
      nombres: ['', [Validators.required, Validators.maxLength(80)]],
      apellidos: ['', [Validators.required, Validators.maxLength(80)]],
      tipoDocumento: ['DNI' as TipoDocumento, [Validators.required]],
      numeroDocumento: ['', [Validators.required, documentoValidator()]],
      fechaNacimiento: ['', [Validators.required, fechaPasadaValidator]],
      telefono: ['', [Validators.required, phoneValidator]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      contrasena: ['', [Validators.required, passwordValidator, Validators.maxLength(72)]],
      confirmarContrasena: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]],
    },
    { validators: matchFields('contrasena', 'confirmarContrasena') },
  );

  protected readonly contrasena = toSignal(
    this.form.controls.contrasena.valueChanges.pipe(startWith(this.form.controls.contrasena.value)),
    { requireSync: true },
  );
  private readonly tipoDocumento = toSignal(
    this.form.controls.tipoDocumento.valueChanges.pipe(startWith(this.form.controls.tipoDocumento.value)),
    { requireSync: true },
  );

  constructor() {
    this.form.controls.tipoDocumento.valueChanges.subscribe(() => {
      this.form.controls.numeroDocumento.updateValueAndValidity();
    });
  }

  protected ayudaDocumento(): string {
    return REGLAS_DOCUMENTO[this.tipoDocumento()].ayuda;
  }

  protected volver(): void {
    if (window.history.length > 1) this.location.back();
    else void this.router.navigateByUrl('/');
  }

  protected enviar(): void {
    if (this.enviando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);

    this.auth
      .registrar({
        nombres: v.nombres.trim(),
        apellidos: v.apellidos.trim(),
        tipoDocumento: v.tipoDocumento,
        numeroDocumento: v.numeroDocumento.trim(),
        fechaNacimiento: v.fechaNacimiento,
        telefono: v.telefono.replace(/\s/g, ''),
        correo: v.correo.trim(),
        contrasena: v.contrasena,
        confirmarContrasena: v.confirmarContrasena,
        aceptaTerminos: v.aceptaTerminos,
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (usuario) => this.alRegistrar(usuario),
        error: (error: unknown) => this.alFallar(error),
      });
  }

  private alRegistrar(usuario: UsuarioResponse): void {
    this.toast.success(`¡Bienvenido a la familia, ${usuario.nombres.split(' ')[0]}!`, 'Tu cuenta está lista.');
    void this.router.navigateByUrl(this.destino());
  }

  private alFallar(error: unknown): void {
    if (esApiException(error) && error.errores.length > 0) {
      const sueltos = aplicarErroresDeCampo(this.form, error.errores);
      this.error.set(sueltos.length > 0 ? sueltos.join(' ') : 'Revisa los campos marcados.');
      return;
    }
    this.error.set(mensajeDeError(error, 'No pudimos crear tu cuenta. Intenta de nuevo.'));
  }

  private destino(): string {
    const solicitado = this.route.snapshot.queryParamMap.get('returnUrl');
    const esInterna = solicitado !== null && solicitado.startsWith('/') && !solicitado.startsWith('//');
    return esInterna && !solicitado.startsWith('/registro') && !solicitado.startsWith('/login') ? solicitado : this.auth.rutaInicio();
  }
}
