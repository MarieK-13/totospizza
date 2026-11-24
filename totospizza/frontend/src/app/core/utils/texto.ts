/** Minúsculas y sin tildes, para buscar sin importar cómo se escribió. */
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Valor de un input o select a partir de su evento. */
export function valorDe(evento: Event): string {
  return (evento.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
}

/** Texto recortado o null si quedó vacío (para campos opcionales del backend). */
export function textoONull(valor: string | null | undefined): string | null {
  const limpio = (valor ?? '').trim();
  return limpio || null;
}

/** Número o null si el campo está vacío. */
export function numeroONull(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined || String(valor).trim() === '') return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}
