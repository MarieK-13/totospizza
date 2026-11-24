import type { AbstractControl, FormGroup } from '@angular/forms';
import { take } from 'rxjs';
import type { CampoError } from '../models/api';

/**
 * Pasa los errores de validación del backend a los controles del formulario.
 * Cada error queda en `control.errors.servidor` y se quita solo cuando la persona vuelve a escribir.
 * Devuelve los mensajes que no corresponden a ningún campo (para mostrarlos arriba del formulario).
 */
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
