import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface PasswordRule {
  readonly id: string;
  readonly label: string;
  readonly test: (value: string) => boolean;
}

/** Mismas reglas que el backend: 8–72 caracteres, con letras y números. */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  { id: 'length', label: 'Entre 8 y 72 caracteres', test: (v) => v.length >= 8 && v.length <= 72 },
  { id: 'letter', label: 'Al menos una letra', test: (v) => /[A-Za-z]/.test(v) },
  { id: 'number', label: 'Al menos un número', test: (v) => /\d/.test(v) },
];

export const passwordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null; // `required` se encarga del vacío
  return PASSWORD_RULES.every((rule) => rule.test(value))
    ? null
    : { password: { message: 'La contraseña no cumple los requisitos' } };
};

/** Celular peruano: 9 dígitos y empieza con 9 (igual que el backend). */
export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  // Acepta "987 654 321": se ignoran los espacios al validar
  const value = String(control.value ?? '').replace(/\s/g, '');
  if (!value) return null;
  return /^9\d{8}$/.test(value)
    ? null
    : { phone: { message: 'Debe tener 9 dígitos y empezar con 9' } };
};

/** Validador de grupo: que dos campos coincidan (confirmar contraseña). */
export function matchFields(field: string, confirmField: string, message = 'Las contraseñas no coinciden'): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const confirm = group.get(confirmField);
    if (!confirm) return null;
    const mismatch = group.get(field)?.value !== confirm.value;
    const errors = { ...(confirm.errors ?? {}) };
    if (mismatch) {
      errors['mismatch'] = { message };
      confirm.setErrors(errors);
    } else if (errors['mismatch']) {
      delete errors['mismatch'];
      confirm.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  };
}
