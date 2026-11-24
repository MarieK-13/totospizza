import { HttpContext, HttpContextToken } from '@angular/common/http';

export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export const PUBLIC_REQUEST = new HttpContextToken<boolean>(() => false);

export function peticionSilenciosa(): HttpContext {
  return new HttpContext().set(SKIP_ERROR_TOAST, true);
}
