import type { AbstractControl, FormGroup } from '@angular/forms';
import { take } from 'rxjs';
import type { CampoError } from '../models/api';
import { esApiException } from './api-exception';

export function aplicarErroresDeCampo(form: FormGroup, errores: readonly CampoError[]): readonly string[] {
  const sueltos: string[] = [];
  for (const { campo, mensaje } of errores) {
    const control: AbstractControl | null = form.get(campo);
    if (!control) {
      sueltos.push(mensaje);
      continue;
    }
    control.setErrors({ ...control.errors, servidor: { message: mensaje } });
    control.markAsTouched();
    control.valueChanges.pipe(take(1)).subscribe(() => quitarErrorDeServidor(control));
  }
  return sueltos;
}

function quitarErrorDeServidor(control: AbstractControl): void {
  if (!control.errors?.['servidor']) return;
  const { servidor: _servidor, ...resto } = control.errors;
  control.setErrors(Object.keys(resto).length > 0 ? resto : null);
}

/**
 * Lleva los errores de validación del backend a los campos del formulario.
 * Devuelve el texto de los errores que no tienen un campo donde mostrarse (o null).
 */
export function aplicarErrorApi(form: FormGroup, error: unknown): string | null {
  if (!esApiException(error) || !error.errores.length) return null;
  const sueltos = aplicarErroresDeCampo(form, error.errores);
  return sueltos.length ? sueltos.join(' ') : null;
}
