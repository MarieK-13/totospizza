export type SeccionConfigKey =
  | 'PERFIL_NEGOCIO'
  | 'CONFIG_PEDIDOS'
  | 'METODOS_PAGO'
  | 'NOTIFICACIONES'
  | 'USUARIOS_PERMISOS'
  | 'SEGURIDAD';

export interface PerfilNegocioConfig {
  logoUrl: string | null;
  nombreNegocio: string;
  direccion: string;
  telefono: string;
  correo: string;
  horarioAtencion: string;
}

export interface ConfiguracionPedidos {
  tiempoEstimadoMin: number;
  costoDelivery: number;
  pedidoMinimo: number;
  deliveryActivo: boolean;
  recojoEnTiendaActivo: boolean;
}

export interface MetodoPagoItem {
  id: 'TARJETA' | 'YAPE' | 'PLIN' | 'OTROS';
  nombre: string;
  habilitado: boolean;
}

export interface NotificacionesConfig {
  nuevosPedidos: boolean;
  pedidosCancelados: boolean;
  pagosRecibidos: boolean;
  alertasStock: boolean;
}

export interface RolPermisoResumen {
  rol: 'ADMINISTRADOR' | 'DESPACHADOR' | 'PIZZERO' | 'MOTORIZADO';
  etiqueta: string;
  cantidadUsuarios: number;
  claseBadge: 'red' | 'blue' | 'amber' | 'green';
}

export interface SesionActivaItem {
  id: string;
  dispositivo: string;
  ubicacion: string;
  estadoTexto: string;
  esActual: boolean;
}

export interface ConfiguracionCompletaDTO {
  perfilNegocio: PerfilNegocioConfig;
  pedidos: ConfiguracionPedidos;
  metodosPago: MetodoPagoItem[];
  notificaciones: NotificacionesConfig;
  roles: RolPermisoResumen[];
  sesionesActivas: SesionActivaItem[];
  ultimaActualizacionTexto: string;
}

export interface CambiarContrasenaRequest {
  contrasenaActual: string;
  nuevaContrasena: string;
}

export interface ApiError {
  fecha: string;
  estado: number;
  codigo: string;
  mensaje: string;
  ruta: string;
  errores: { campo: string; mensaje: string }[];
}