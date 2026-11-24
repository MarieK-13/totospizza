import type { DiaSemana, HorarioSucursalResponse, Hora } from '../models/api';

export const ORDEN_SEMANA: readonly DiaSemana[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const DIA_POR_INDICE: readonly DiaSemana[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const ETIQUETA_DIA: Readonly<Record<DiaSemana, string>> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

export function diaActual(fecha: Date = new Date()): DiaSemana {
  return DIA_POR_INDICE[fecha.getDay()];
}

export function etiquetaDia(dia: DiaSemana): string {
  return ETIQUETA_DIA[dia];
}

export function horaCorta(hora: Hora | null): string {
  return hora ? hora.slice(0, 5) : '';
}

export function textoHorario(horario: HorarioSucursalResponse | undefined): string {
  if (!horario || horario.cerrado || !horario.horaApertura || !horario.horaCierre) return 'Cerrado';
  return `${horaCorta(horario.horaApertura)} – ${horaCorta(horario.horaCierre)}`;
}

export function horarioDelDia(horarios: readonly HorarioSucursalResponse[], dia: DiaSemana): HorarioSucursalResponse | undefined {
  return horarios.find((h) => h.diaSemana === dia);
}

export function ordenarSemana(horarios: readonly HorarioSucursalResponse[]): readonly HorarioSucursalResponse[] {
  return ORDEN_SEMANA.map((dia) => horarioDelDia(horarios, dia)).filter((h): h is HorarioSucursalResponse => h !== undefined);
}

const ABREVIATURA_DIA: Readonly<Record<DiaSemana, string>> = {
  MONDAY: 'Lun',
  TUESDAY: 'Mar',
  WEDNESDAY: 'Mié',
  THURSDAY: 'Jue',
  FRIDAY: 'Vie',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
};

export function resumirHorarios(horarios: readonly HorarioSucursalResponse[]): string {
  const grupos: { desde: DiaSemana; hasta: DiaSemana; texto: string }[] = [];
  for (const dia of ORDEN_SEMANA) {
    const horario = horarioDelDia(horarios, dia);
    const texto = textoHorario(horario);
    if (texto === 'Cerrado') continue;
    const ultimo = grupos.at(-1);
    const esSeguido = ultimo !== undefined && ORDEN_SEMANA.indexOf(ultimo.hasta) === ORDEN_SEMANA.indexOf(dia) - 1;
    if (ultimo && esSeguido && ultimo.texto === texto) ultimo.hasta = dia;
    else grupos.push({ desde: dia, hasta: dia, texto });
  }
  if (grupos.length === 0) return 'Cerrado';
  return grupos
    .map((g) => {
      const dias = g.desde === g.hasta ? ABREVIATURA_DIA[g.desde] : `${ABREVIATURA_DIA[g.desde]}–${ABREVIATURA_DIA[g.hasta]}`;
      return `${dias} · ${g.texto.replace(' – ', '–')}`;
    })
    .join(' / ');
}

function aMinutos(hora: Hora): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function estaAbierto(horarios: readonly HorarioSucursalResponse[], ahora: Date = new Date()): boolean {
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const hoy = horarioDelDia(horarios, diaActual(ahora));
  if (hoy && !hoy.cerrado && hoy.horaApertura && hoy.horaCierre) {
    const apertura = aMinutos(hoy.horaApertura);
    const cierre = aMinutos(hoy.horaCierre);
    if (cierre > apertura ? minutos >= apertura && minutos < cierre : minutos >= apertura) return true;
  }
  const ayerFecha = new Date(ahora);
  ayerFecha.setDate(ahora.getDate() - 1);
  const ayer = horarioDelDia(horarios, diaActual(ayerFecha));
  if (ayer && !ayer.cerrado && ayer.horaApertura && ayer.horaCierre) {
    const apertura = aMinutos(ayer.horaApertura);
    const cierre = aMinutos(ayer.horaCierre);
    return cierre <= apertura && minutos < cierre;
  }
  return false;
}
