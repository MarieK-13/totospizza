import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PASSWORD_RULES } from '../../../../core/utils/form-validators';

export interface NivelSeguridad {
  /** 0 = vacío, 1 a 4 = cuántos tramos se llenan. */
  readonly nivel: 0 | 1 | 2 | 3 | 4;
  readonly etiqueta: string;
  /** Primer requisito del backend que falta, si hay alguno. */
  readonly falta: string | null;
}

const ETIQUETAS = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'] as const;

/**
 * Débil: no cumple lo que pide el backend (8–72 caracteres, letra y número).
 * Regular: lo cumple. Buena y Fuerte: además tiene 12+ caracteres y/o mezcla mayúsculas, minúsculas o símbolos.
 */
export function nivelDeSeguridad(valor: string): NivelSeguridad {
  if (!valor) return { nivel: 0, etiqueta: '', falta: null };
  const faltante = PASSWORD_RULES.find((regla) => !regla.test(valor));
  if (faltante) return { nivel: 1, etiqueta: ETIQUETAS[1], falta: faltante.label };

  const larga = valor.length >= 12;
  const variada = (/[a-z]/.test(valor) && /[A-Z]/.test(valor)) || /[^A-Za-z0-9]/.test(valor);
  const nivel = (2 + Number(larga) + Number(variada)) as 2 | 3 | 4;
  return { nivel, etiqueta: ETIQUETAS[nivel], falta: null };
}

/** Barra de 4 tramos con la seguridad de la contraseña, como en el diseño del registro. */
@Component({
  selector: 'app-password-strength',
  templateUrl: './password-strength.html',
  styleUrl: './password-strength.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordStrength {
  readonly valor = input('');

  protected readonly estado = computed(() => nivelDeSeguridad(this.valor()));
  protected readonly tramos = [1, 2, 3, 4] as const;
}
