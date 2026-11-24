export type EstadoEntregaMotorizado = 'EN_CAMINO' | 'PENDIENTE_SALIDA';

export interface ProductoEntregaItem {
  cantidad: number;
  nombre: string;
}

export interface EntregaAsignada {
  id: number;
  ordenNumero: string;
  codigoPedido: string;
  estado: EstadoEntregaMotorizado;
  horaInfoSuperior: string;
  clienteNombre: string;
  clienteTelefono: string;
  direccion: string;
  referencia: string;
  productos: ProductoEntregaItem[];
  metodoPagoTexto: string;
  callePrincipalMapa: string;
  calleSecundariaMapa: string;
  distanciaKm: number;
}