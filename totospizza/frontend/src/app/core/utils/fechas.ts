const FECHA = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Lima' });
const FECHA_HORA = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' });
const HORA = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' });

export function formatearFecha(iso: string | null | undefined): string {
  return iso ? FECHA.format(new Date(iso)) : '';
}

export function formatearFechaHora(iso: string | null | undefined): string {
  return iso ? FECHA_HORA.format(new Date(iso)) : '';
}

export function formatearHora(iso: string | null | undefined): string {
  return iso ? HORA.format(new Date(iso)) : '';
}
