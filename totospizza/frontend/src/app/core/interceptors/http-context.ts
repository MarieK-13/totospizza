import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Evita el toast automático de error (la pantalla muestra el error a su manera). */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** No agrega el token ni intenta renovarlo (login, registro, refresh...). */
export const PUBLIC_REQUEST = new HttpContextToken<boolean>(() => false);

/** Contexto para cargas pasivas (header, home): si fallan, la pantalla usa su respaldo sin mostrar toast. */
export function peticionSilenciosa(): HttpContext {
  return new HttpContext().set(SKIP_ERROR_TOAST, true);
}
