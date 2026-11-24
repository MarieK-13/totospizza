import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_URL } from '../../config/api.config';

type Valor = string | number | boolean | null | undefined;
export type Parametros = object;

export interface OpcionesPeticion {
  readonly params?: Parametros;
  readonly context?: HttpContext;
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  get<T>(ruta: string, opciones: OpcionesPeticion = {}): Observable<T> {
    return this.http.get<T>(this.url(ruta), this.config(opciones));
  }

  post<T>(ruta: string, cuerpo: unknown = null, opciones: OpcionesPeticion = {}): Observable<T> {
    return this.http.post<T>(this.url(ruta), cuerpo, this.config(opciones));
  }

  put<T>(ruta: string, cuerpo: unknown, opciones: OpcionesPeticion = {}): Observable<T> {
    return this.http.put<T>(this.url(ruta), cuerpo, this.config(opciones));
  }

  patch<T>(ruta: string, cuerpo: unknown, opciones: OpcionesPeticion = {}): Observable<T> {
    return this.http.patch<T>(this.url(ruta), cuerpo, this.config(opciones));
  }

  delete<T>(ruta: string, opciones: OpcionesPeticion = {}): Observable<T> {
    return this.http.delete<T>(this.url(ruta), this.config(opciones));
  }

  private url(ruta: string): string {
    return `${this.baseUrl}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  }

  private config(opciones: OpcionesPeticion): { params?: Record<string, string | number | boolean>; context?: HttpContext } {
    return { params: limpiar(opciones.params), context: opciones.context };
  }
}

function limpiar(params?: Parametros): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const salida: Record<string, string | number | boolean> = {};
  for (const [clave, valor] of Object.entries(params as Record<string, Valor>)) {
    if (valor !== null && valor !== undefined && valor !== '') salida[clave] = valor;
  }
  return salida;
}
