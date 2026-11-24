export type EtapaCocina = 'PENDIENTE' | 'EN_HORNO' | 'LISTA';
export type TipoEntregaCocina = 'DELIVERY' | 'RECOJO';

export interface ProductoCocinaItem {
  cantidad: number;
  nombre: string;
}

export interface PedidoCocina {
  id: number;
  codigo: string;
  tipoEntrega: TipoEntregaCocina;
  etapa: EtapaCocina;
  horaIngreso: string;
  horaFinalizado?: string;
  minutosEspera: number;
  minutosEnHorno: number;
  tiempoObjetivoMin: number;
  minutosDesdeListo?: number;
  productos: ProductoCocinaItem[];
  notaEspecial?: string;
}