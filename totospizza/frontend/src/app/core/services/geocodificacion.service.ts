import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of, switchMap, type Observable } from 'rxjs';
import { peticionSilenciosa } from '../interceptors/http-context';

/** Punto encontrado a partir de un texto de dirección. */
export interface PuntoGeocodificado {
  readonly latitud: number;
  readonly longitud: number;
  readonly descripcion: string;
}

interface ResultadoNominatim {
  readonly lat: string;
  readonly lon: string;
  readonly display_name: string;
}

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

/**
 * Convierte una dirección escrita en coordenadas con OpenStreetMap (Nominatim), para quien no está
 * en el lugar y no puede usar el GPS. Prueba varias búsquedas, de la más precisa a la más general,
 * y devuelve la primera que encuentre (o null).
 */
@Injectable({ providedIn: 'root' })
export class GeocodificacionService {
  private readonly http = inject(HttpClient);

  buscar(consultas: readonly string[]): Observable<PuntoGeocodificado | null> {
    const [primera, ...resto] = consultas.map((c) => c.trim()).filter(Boolean);
    if (!primera) return of(null);
    return this.consultar(primera).pipe(switchMap((punto) => (punto || !resto.length ? of(punto) : this.buscar(resto))));
  }

  private consultar(texto: string): Observable<PuntoGeocodificado | null> {
    return this.http
      .get<readonly ResultadoNominatim[]>(NOMINATIM, {
        params: { q: texto, format: 'json', limit: 1, countrycodes: 'pe', 'accept-language': 'es' },
        context: peticionSilenciosa(),
      })
      .pipe(
        map(([r]) => (r ? { latitud: Number(r.lat), longitud: Number(r.lon), descripcion: r.display_name } : null)),
        catchError(() => of(null)),
      );
  }
}
