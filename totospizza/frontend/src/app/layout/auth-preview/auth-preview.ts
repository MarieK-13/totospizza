import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Lock, Mail } from 'lucide-angular';
import { PASSWORD_RULES, passwordValidator } from '../../core/utils/form-validators';
import { ToastService } from '../../core/services/toast.service';
import { TextField } from '../../shared/components/text-field/text-field';

@Component({
  selector: 'app-auth-preview',
  imports: [ReactiveFormsModule, TextField],
  templateUrl: './auth-preview.html',
  styleUrl: './auth-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPreview {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);

  protected readonly MailIcon = Mail;
  protected readonly LockIcon = Lock;
  protected readonly rules = PASSWORD_RULES;

  protected readonly form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, passwordValidator]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Revisa el formulario', 'Hay campos con errores.');
      return;
    }
    this.toast.success('¡Bienvenido a Toto\'s!', 'Sesión iniciada correctamente.');
  }
}
