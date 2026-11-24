import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CalendarDays, CircleAlert, IdCard, LucideAngularModule, Mail, Phone, UserRound } from 'lucide-angular';
import type { PerfilResponse } from '../../../../core/models/api';
import { AuthService } from '../../../../core/services/auth.service';
import { ClienteApi } from '../../../../core/services/api/cliente.api';
import { ToastService } from '../../../../core/services/toast.service';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';
import { ayerIso, fechaPasadaValidator } from '../../../../core/utils/documento';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { phoneValidator } from '../../../../core/utils/form-validators';
import { TextField } from '../../../../shared/components/text-field/text-field';

/** Datos personales del cliente. Documento y correo se muestran pero no se editan (son su identidad). */
@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule, LucideAngularModule, TextField],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileForm {
  readonly perfil = input.required<PerfilResponse>();
  readonly guardado = output<PerfilResponse>();

  private readonly api = inject(ClienteApi);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly form = this.fb.group({
    nombres: ['', [Validators.required, Validators.maxLength(80)]],
    apellidos: ['', [Validators.required, Validators.maxLength(80)]],
    telefono: ['', [Validators.required, phoneValidator]],
    fechaNacimiento: ['', [Validators.required, fechaPasadaValidator]],
  });

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly maxFecha = ayerIso();

  protected readonly UserIcon = UserRound;
  protected readonly PhoneIcon = Phone;
  protected readonly CalendarIcon = CalendarDays;
  protected readonly MailIcon = Mail;
  protected readonly IdIcon = IdCard;
  protected readonly AlertIcon = CircleAlert;

  constructor() {
    // Carga (o recarga) los valores cuando llega el perfil
    effect(() => this.restablecer(this.perfil()));
  }

  protected descartar(): void {
    this.restablecer(this.perfil());
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

    this.api
      .actualizarPerfil({
        nombres: v.nombres.trim(),
        apellidos: v.apellidos.trim(),
        telefono: v.telefono.replace(/\s/g, ''),
        fechaNacimiento: v.fechaNacimiento,
        avatarUrl: this.perfil().avatarUrl,
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (perfil) => {
          this.auth.actualizarUsuario({ nombres: perfil.nombres, apellidos: perfil.apellidos, telefono: perfil.telefono });
          this.form.markAsPristine();
          this.toast.success('Datos guardados', 'Tu perfil está actualizado.');
          this.guardado.emit(perfil);
        },
        error: (error: unknown) => {
          if (esApiException(error) && error.errores.length > 0) {
            const sueltos = aplicarErroresDeCampo(this.form, error.errores);
            this.error.set(sueltos.length > 0 ? sueltos.join(' ') : 'Revisa los campos marcados.');
            return;
          }
          this.error.set(mensajeDeError(error, 'No pudimos guardar tus datos. Intenta de nuevo.'));
        },
      });
  }

  private restablecer(p: PerfilResponse): void {
    this.form.reset({ nombres: p.nombres, apellidos: p.apellidos, telefono: p.telefono, fechaNacimiento: p.fechaNacimiento });
    this.error.set(null);
  }
}
