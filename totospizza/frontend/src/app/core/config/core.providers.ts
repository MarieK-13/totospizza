import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { type EnvironmentProviders, makeEnvironmentProviders, provideAppInitializer, inject } from '@angular/core';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { AuthService } from '../services/auth.service';

/**
 * Todo lo que el core necesita registrar: HttpClient con sus interceptores
 * (el de errores va primero para ver el resultado final, después de renovar el token)
 * y la restauración de la sesión al arrancar.
 */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor, authInterceptor])),
    provideAppInitializer(() => inject(AuthService).restaurarSesion()),
  ]);
}
