export type TipoEntregaMostrador = 'DELIVERY' | 'RECOJO';

export interface ProductoMostradorItem {
  cantidad: number;
  nombre: string;
}

export interface PedidoListoMostrador {
  id: number;
  codigo: string;
  horaListo: string;
  tipoEntrega: TipoEntregaMostrador;
  clienteNombre: string;
  clienteTelefono: string;
  direccionPrincipal: string;
  direccionReferencia: string;
  productos: ProductoMostradorItem[];
}