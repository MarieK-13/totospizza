import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { type EnvironmentProviders, makeEnvironmentProviders, provideAppInitializer, inject } from '@angular/core';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { AuthService } from '../services/auth.service';

export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor, authInterceptor])),
    provideAppInitializer(() => inject(AuthService).restaurarSesion()),
  ]);
}
