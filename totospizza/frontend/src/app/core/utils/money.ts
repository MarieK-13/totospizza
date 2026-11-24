const formato = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 42.9 → "S/ 42.90" */
export function formatearSoles(monto: number | null | undefined): string {
  return formato.format(monto ?? 0).replace(/\s/g, ' ');
}
