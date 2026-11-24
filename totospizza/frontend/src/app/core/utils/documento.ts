import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import type { TipoDocumento } from '../models/api';

interface ReglaDocumento {
  readonly etiqueta: string;
  readonly patron: RegExp;
  readonly ayuda: string;
}

/**
 * Formato de cada documento. Todos caben dentro de lo que acepta el backend
 * (8 a 20 caracteres alfanuméricos), pero son más estrictos según el tipo.
 */
export const REGLAS_DOCUMENTO: Readonly<Record<TipoDocumento, ReglaDocumento>> = {
  DNI: { etiqueta: 'DNI', patron: /^\d{8}$/, ayuda: 'El DNI tiene 8 dígitos' },
  CE: { etiqueta: 'Carné de extranjería', patron: /^\d{9}$/, ayuda: 'El carné de extranjería tiene 9 dígitos' },
  PASAPORTE: { etiqueta: 'Pasaporte', patron: /^[A-Za-z0-9]{8,12}$/, ayuda: 'El pasaporte tiene de 8 a 12 letras o números' },
};

export const OPCIONES_DOCUMENTO = (Object.keys(REGLAS_DOCUMENTO) as TipoDocumento[]).map((valor) => ({
  valor,
  etiqueta: REGLAS_DOCUMENTO[valor].etiqueta,
}));

/** Valida el número según el tipo elegido en el control hermano `tipoDocumento`. */
export function documentoValidator(campoTipo = 'tipoDocumento'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '');
    if (!valor) return null; // `required` se encarga del vacío
    const tipo = control.parent?.get(campoTipo)?.value as TipoDocumento | undefined;
    const regla = tipo ? REGLAS_DOCUMENTO[tipo] : undefined;
    return !regla || regla.patron.test(valor) ? null : { documento: { message: regla.ayuda } };
  };
}

/** La fecha debe ser pasada (igual que el backend con @Past) y razonable. */
export const fechaPasadaValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '');
  if (!valor) return null;
  const fecha = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return { fecha: { message: 'Ingresa una fecha válida' } };
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha >= hoy) return { fecha: { message: 'La fecha de nacimiento debe ser pasada' } };
  if (fecha.getFullYear() < 1900) return { fecha: { message: 'Ingresa una fecha válida' } };
  return null;
};

/** Hoy en formato yyyy-MM-dd, para el atributo `max` del campo de fecha. */
export function ayerIso(): string {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const mes = String(ayer.getMonth() + 1).padStart(2, '0');
  const dia = String(ayer.getDate()).padStart(2, '0');
  return `${ayer.getFullYear()}-${mes}-${dia}`;
}
