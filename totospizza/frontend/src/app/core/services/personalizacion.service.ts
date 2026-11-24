import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { environment } from '../config/environment';
import { OPCIONES_PERSONALIZACION_PRUEBA } from '../data/personalizacion-prueba';
import type {
  CotizacionPizzaResponse,
  IngredienteResponse,
  OpcionesPersonalizacionResponse,
  TamanoPizzaResponse,
  TipoMasaResponse,
} from '../models/api';
import { PublicoApi } from './api/publico.api';
import type { OpcionesPeticion } from './api/api-client';

const ES_MASA_DE_STOCK = /^masa(\s+de\s+pizza)?$/i;

@Injectable({ providedIn: 'root' })
export class PersonalizacionService {
  private readonly api = inject(PublicoApi);

  opciones(opciones?: OpcionesPeticion): Observable<OpcionesPersonalizacionResponse> {
    const fuente$ = environment.menuDatosDePrueba ? of(OPCIONES_PERSONALIZACION_PRUEBA).pipe(delay(250)) : this.api.opcionesPersonalizacion(opciones);
    return fuente$.pipe(
      map((o) => ({
        ...o,
        pasos: o.pasos.map((p) => ({ ...p, opciones: p.opciones.filter((i) => i.disponible && !ES_MASA_DE_STOCK.test(i.nombre.trim())) })),
      })),
    );
  }
}

export function cotizarPizza(
  tamano: TamanoPizzaResponse | null,
  masa: TipoMasaResponse | null,
  ingredientes: readonly IngredienteResponse[],
): CotizacionPizzaResponse | null {
  if (!tamano || !masa) return null;
  const redondear = (n: number) => Math.round(n * 100) / 100;
  const totalIngredientes = redondear(ingredientes.reduce((suma, i) => suma + i.precioExtra, 0));
  return {
    precioTamano: tamano.precioBase,
    recargoMasa: masa.recargo,
    totalIngredientes,
    total: redondear(tamano.precioBase + masa.recargo + totalIngredientes),
  };
}
