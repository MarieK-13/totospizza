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

const DIA_ISO = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Lima' });

/** Fecha "yyyy-MM-dd" en Lima, desplazada `offsetDias` desde hoy. */
export function fechaISO(offsetDias = 0): string {
  return DIA_ISO.format(new Date(Date.now() + offsetDias * 86_400_000));
}

/** Día de la semana (0 = domingo) de una fecha "yyyy-MM-dd". */
export function diaSemana(fecha: string): number {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

const dos = (n: number) => String(n).padStart(2, '0');

/** Instante ISO → valor de un `<input type="datetime-local">` en la hora del navegador. */
export function aInputFechaHora(iso: string | null | undefined): string {
  if (!iso) return '';
  const f = new Date(iso);
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}T${dos(f.getHours())}:${dos(f.getMinutes())}`;
}

/** Valor de un `<input type="datetime-local">` → instante ISO (UTC). */
export function deInputFechaHora(valor: string): string {
  return new Date(valor).toISOString();
}
