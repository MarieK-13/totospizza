import type { DiaSemana, Hora, Rol } from './enums.model';
import type { DireccionRequest, DireccionResponse } from './seguridad.model';

export interface HorarioSucursalRequest {
  readonly diaSemana: DiaSemana;
  readonly horaApertura: Hora | null;
  readonly horaCierre: Hora | null;
  readonly cerrado: boolean;
}

export type HorarioSucursalResponse = HorarioSucursalRequest;

export interface ZonaRepartoRequest {
  readonly nombre: string;
  readonly distanciaDesdeKm: number;
  readonly distanciaHastaKm: number;
  readonly costoEnvio: number;
  readonly activa: boolean;
}

export interface ZonaRepartoResponse {
  readonly id: number;
  readonly nombre: string;
  readonly distanciaDesdeKm: number;
  readonly distanciaHastaKm: number;
  readonly costoEnvio: number;
}

export interface SucursalRequest {
  readonly nombre: string;
  readonly direccion: DireccionRequest;
  readonly telefono: string;
  readonly imagenUrl?: string | null;
  readonly activa: boolean;
  readonly radioCoberturaKm: number;
  readonly horarios: readonly HorarioSucursalRequest[];
  readonly zonas: readonly ZonaRepartoRequest[];
}

export interface SucursalResponse {
  readonly id: number;
  readonly nombre: string;
  readonly direccion: DireccionResponse;
  readonly telefono: string;
  readonly imagenUrl: string | null;
  readonly activa: boolean;
  readonly radioCoberturaKm: number;
  readonly abiertoAhora: boolean;
  readonly horarios: readonly HorarioSucursalResponse[];
  readonly zonas: readonly ZonaRepartoResponse[];
  /** Roles sin ningún empleado activo; si hay alguno, la sede no recibe delivery. */
  readonly personalFaltante?: readonly Rol[];
}

export interface LocalesResponse {
  readonly sucursales: readonly SucursalResponse[];
}

export interface ConsultaCoberturaRequest {
  readonly latitud: number;
  readonly longitud: number;
  readonly sucursalId?: number | null;
}

export interface CoberturaResponse {
  readonly dentroCobertura: boolean;
  readonly distanciaKm: number | null;
  readonly sucursalId: number | null;
  readonly sucursalNombre: string | null;
  readonly costoEnvio: number | null;
  readonly minutosEstimados: number | null;
  readonly mensaje: string;
}
