export type Rol = 'ADMINISTRADOR' | 'CLIENTE' | 'PIZZERO' | 'DESPACHADOR' | 'MOTORIZADO';

export type EstadoEmpleado = 'ACTIVO' | 'EN_TURNO' | 'DISPONIBLE' | 'INACTIVO' | 'CON_LICENCIA';

export type TipoDocumento = 'DNI' | 'CE' | 'PASAPORTE';

export type EstadoTurno = 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO';

export interface PageResponse<T> {
  contenido: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
}

export interface EmpleadoResponse {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  rol: Rol;
  sucursalId: number;
  sucursalNombre: string;
  estado: EstadoEmpleado;
  horaInicio: string; // LocalTime HH:mm
  horaFin: string;    // LocalTime HH:mm
  fechaIngreso: string; // LocalDate YYYY-MM-DD
  pagoBaseTurno: number;
  bonoPorEntrega: number;
}

export interface ResumenEmpleadosResponse {
  total: number;
  activos: number;
  enTurno: number;
  disponibles: number;
  inactivos: number;
  conLicencia: number;
}

export interface EmpleadoRequest {
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  contrasenaInicial?: string;
  rol: Rol;
  sucursalId: number;
  horaInicio: string;
  horaFin: string;
  fechaIngreso: string;
  pagoBaseTurno?: number;
  bonoPorEntrega?: number;
}

export interface CambiarEstadoEmpleadoRequest {
  estado: EstadoEmpleado;
}

export interface AsignarHorarioRequest {
  fecha: string;      // LocalDate YYYY-MM-DD (@FutureOrPresent)
  horaInicio: string; // LocalTime HH:mm
  horaFin: string;    // LocalTime HH:mm
  puesto?: string;
  sucursalId: number;
}

export interface TurnoResponse {
  id: number;
  empleadoId: number;
  empleadoNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoTurno;
  puesto: string | null;
}

export interface SucursalBasica {
  id: number;
  nombre: string;
}

export interface ApiError {
  fecha: string;
  estado: number;
  codigo: string;
  mensaje: string;
  ruta: string;
  errores: { campo: string; mensaje: string }[];
}