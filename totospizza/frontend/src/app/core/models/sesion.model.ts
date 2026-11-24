import type { UsuarioResponse } from './api';

/** Lo que se guarda en el navegador mientras la persona tiene la sesión abierta. */
export interface Sesion {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly usuario: UsuarioResponse;
}
