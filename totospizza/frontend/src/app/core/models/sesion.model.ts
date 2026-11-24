import type { UsuarioResponse } from './api';

export interface Sesion {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly usuario: UsuarioResponse;
}
