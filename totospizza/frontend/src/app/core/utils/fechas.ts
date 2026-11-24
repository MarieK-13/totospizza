const FECHA = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Lima' });
const FECHA_HORA = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' });
const HORA = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' });

/** "24 nov. 2026" */
export function formatearFecha(iso: string | null | undefined): string {
  return iso ? FECHA.format(new Date(iso)) : '';
}

/** "24 nov., 19:45" */
export function formatearFechaHora(iso: string | null | undefined): string {
  return iso ? FECHA_HORA.format(new Date(iso)) : '';
}

/** "19:45" */
export function formatearHora(iso: string | null | undefined): string {
  return iso ? HORA.format(new Date(iso)) : '';
}
