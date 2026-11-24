import type { MetodoPago, TipoParametro } from './enums.model';

export interface MetodoPagoDisponibleResponse {
  readonly metodo: MetodoPago;
  readonly etiqueta: string;
  readonly orden: number;
}

export interface ConfiguracionPublicaResponse {
  readonly nombreComercial: string;
  readonly logoUrl: string | null;
  readonly whatsapp: string | null;
  readonly instagramUrl: string | null;
  readonly facebookUrl: string | null;
  readonly envioGratisDesde: number | null;
  readonly costoDeliveryBase: number | null;
  readonly radioCoberturaKm: number | null;
  readonly metodosPago: readonly MetodoPagoDisponibleResponse[];
}

export interface PerfilNegocioRequest {
  readonly nombreComercial: string;
  readonly razonSocial: string | null;
  readonly ruc: string | null;
  readonly logoUrl?: string | null;
  readonly correoContacto: string | null;
  readonly telefonoContacto: string | null;
  readonly direccionFiscal: string | null;
  readonly instagramUrl?: string | null;
  readonly facebookUrl?: string | null;
  readonly whatsapp?: string | null;
}

export type PerfilNegocioResponse = PerfilNegocioRequest;

export interface ParametroSistemaResponse {
  readonly clave: string;
  readonly valor: string;
  readonly tipo: TipoParametro;
  readonly descripcion: string;
}

export interface ParametroSistemaRequest {
  readonly valor: string;
}

export interface MetodoPagoHabilitadoRequest {
  readonly metodo: MetodoPago;
  readonly activo: boolean;
  readonly orden?: number | null;
}

export interface MetodoPagoHabilitadoResponse {
  readonly metodo: MetodoPago;
  readonly etiqueta: string;
  readonly activo: boolean;
  readonly orden: number;
}
