import type { DiaSemana, HorarioSucursalResponse, SucursalResponse } from '../models/api';
import { estaAbierto } from '../utils/horario';

const DIAS: readonly DiaSemana[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function semana(apertura: string, cierre: string, cerrados: readonly DiaSemana[] = []): readonly HorarioSucursalResponse[] {
  return DIAS.map((diaSemana) => ({
    diaSemana,
    horaApertura: cerrados.includes(diaSemana) ? null : apertura,
    horaCierre: cerrados.includes(diaSemana) ? null : cierre,
    cerrado: cerrados.includes(diaSemana),
  }));
}

function sede(datos: Omit<SucursalResponse, 'abiertoAhora' | 'activa' | 'zonas' | 'telefono' | 'radioCoberturaKm'>): SucursalResponse {
  return { ...datos, telefono: '', activa: true, radioCoberturaKm: 5, zonas: [], abiertoAhora: estaAbierto(datos.horarios) };
}


export const LOCALES_RESPALDO: readonly SucursalResponse[] = [
  sede({
    id: 1,
    nombre: "Toto's Pizza Av. San Martín",
    direccion: { direccion: 'Av. San Martín 1432', referencia: null, distrito: 'Ica', latitud: 0, longitud: 0 },
    imagenUrl: 'images/local-san-martin-web.jpg',
    horarios: semana('12:00:00', '23:00:00'),
  }),
  sede({
    id: 2,
    nombre: "Toto's Pizza Calle Lima",
    direccion: { direccion: 'Calle Lima 425', referencia: null, distrito: 'Ica', latitud: 0, longitud: 0 },
    imagenUrl: 'images/local-calle-lima-web.jpg',
    horarios: semana('12:00:00', '23:00:00'),
  }),
  sede({
    id: 3,
    nombre: "Toto's Pizza Ficus",
    direccion: { direccion: 'Los Ficus, camino a Huacachina / Sector II Mz. "C" Lt. 16', referencia: null, distrito: 'Ica', latitud: 0, longitud: 0 },
    imagenUrl: 'images/local-ficus.jpg',
    horarios: semana('13:00:00', '00:00:00', ['MONDAY']),
  }),
];
