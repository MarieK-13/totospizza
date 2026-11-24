import type { EstadoEmpleado, EstadoTurno, Fecha, Hora, Instante, Rol, TipoDocumento } from './enums.model';

export interface LoginRequest {
  readonly correo: string;
  readonly contrasena: string;
}

export interface RegistroRequest {
  readonly nombres: string;
  readonly apellidos: string;
  readonly tipoDocumento: TipoDocumento;
  readonly numeroDocumento: string;
  readonly fechaNacimiento: Fecha;
  readonly telefono: string;
  readonly correo: string;
  readonly contrasena: string;
  readonly confirmarContrasena: string;
  readonly aceptaTerminos: boolean;
}

export interface RefreshTokenRequest {
  readonly refreshToken: string;
}

export interface OlvidoContrasenaRequest {
  readonly correo: string;
}

export interface RestablecerContrasenaRequest {
  readonly token: string;
  readonly nuevaContrasena: string;
  readonly confirmarContrasena: string;
}

export interface CambiarContrasenaRequest {
  readonly contrasenaActual: string;
  readonly nuevaContrasena: string;
  readonly confirmarContrasena: string;
}

export interface UsuarioResponse {
  readonly id: number;
  readonly nombres: string;
  readonly apellidos: string;
  readonly correo: string;
  readonly telefono: string;
  readonly rol: Rol;
  readonly activo: boolean;
  readonly avatarUrl: string | null;
  readonly ultimoAcceso: Instante | null;
}

export interface TokenResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tipo: string;
  readonly expiraEnSegundos: number;
  readonly usuario: UsuarioResponse;
}

export interface DireccionRequest {
  readonly direccion: string;
  readonly referencia?: string | null;
  readonly distrito: string;
  readonly latitud: number;
  readonly longitud: number;
}

export interface DireccionResponse {
  readonly direccion: string;
  readonly referencia: string | null;
  readonly distrito: string;
  readonly latitud: number;
  readonly longitud: number;
}

export interface DireccionClienteRequest {
  readonly etiqueta: string;
  readonly direccion: DireccionRequest;
  readonly favorita: boolean;
}

export interface DireccionClienteResponse {
  readonly id: number;
  readonly etiqueta: string;
  readonly direccion: DireccionResponse;
  readonly favorita: boolean;
}

export interface ActualizarPerfilRequest {
  readonly nombres: string;
  readonly apellidos: string;
  readonly telefono: string;
  readonly fechaNacimiento: Fecha;
  readonly avatarUrl?: string | null;
}

export interface PerfilResponse {
  readonly id: number;
  readonly nombres: string;
  readonly apellidos: string;
  readonly tipoDocumento: TipoDocumento;
  readonly numeroDocumento: string;
  readonly fechaNacimiento: Fecha;
  readonly telefono: string;
  readonly correo: string;
  readonly rol: Rol;
  readonly avatarUrl: string | null;
  readonly direcciones: readonly DireccionClienteResponse[];
}

export interface EmpleadoRequest {
  readonly nombres: string;
  readonly apellidos: string;
  readonly tipoDocumento: TipoDocumento;
  readonly numeroDocumento: string;
  readonly telefono: string;
  readonly correo: string;
  readonly contrasenaInicial?: string | null;
  readonly rol: Rol;
  readonly sucursalId: number;
  readonly horaInicio: Hora;
  readonly horaFin: Hora;
  readonly fechaIngreso: Fecha;
  readonly pagoBaseTurno?: number | null;
  readonly bonoPorEntrega?: number | null;
}

export interface EmpleadoResponse {
  readonly id: number;
  readonly usuarioId: number;
  readonly nombreCompleto: string;
  readonly correo: string;
  readonly telefono: string;
  readonly rol: Rol;
  readonly sucursalId: number;
  readonly sucursalNombre: string;
  readonly estado: EstadoEmpleado;
  readonly horaInicio: Hora;
  readonly horaFin: Hora;
  readonly fechaIngreso: Fecha;
  readonly pagoBaseTurno: number | null;
  readonly bonoPorEntrega: number | null;
}

export interface FiltroEmpleados {
  readonly sucursalId?: number;
  readonly rol?: Rol;
  readonly estado?: EstadoEmpleado;
  readonly q?: string;
  readonly pagina?: number;
  readonly tamano?: number;
}

export interface AsignarHorarioRequest {
  readonly fecha: Fecha;
  readonly horaInicio: Hora;
  readonly horaFin: Hora;
  readonly puesto?: string | null;
  readonly sucursalId: number;
}

export interface TurnoResponse {
  readonly id: number;
  readonly empleadoId: number;
  readonly empleadoNombre: string;
  readonly fecha: Fecha;
  readonly horaInicio: Hora;
  readonly horaFin: Hora;
  readonly estado: EstadoTurno;
  readonly puesto: string | null;
}

export interface ResumenEmpleadosResponse {
  readonly total: number;
  readonly activos: number;
  readonly enTurno: number;
  readonly disponibles: number;
  readonly inactivos: number;
  readonly conLicencia: number;
}
