import type { Rol } from '../models/api';

export const ETIQUETA_ROL: Readonly<Record<Rol, string>> = {
  ADMINISTRADOR: 'Administrador',
  CLIENTE: 'Cliente',
  PIZZERO: 'Pizzero',
  DESPACHADOR: 'Despachador',
  MOTORIZADO: 'Motorizado',
};

/** "María López" → "ML" */
export function iniciales(nombres: string, apellidos = ''): string {
  return `${nombres.trim().charAt(0)}${apellidos.trim().charAt(0)}`.toUpperCase();
}

/** Saludo según la hora de Lima. */
export function saludo(fecha = new Date()): string {
  const hora = Number(new Intl.DateTimeFormat('es-PE', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Lima' }).format(fecha));
  return hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
}
