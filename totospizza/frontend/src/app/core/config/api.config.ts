import { InjectionToken } from '@angular/core';
import { environment } from './environment';

/** URL base de la API. Inyectable para poder cambiarla en pruebas. */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});
