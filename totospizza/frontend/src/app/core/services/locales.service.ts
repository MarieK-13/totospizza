import { Injectable, computed, inject, signal } from '@angular/core';
import { LOCALES_RESPALDO } from '../data/locales.respaldo';
import { peticionSilenciosa } from '../interceptors/http-context';
import type { SucursalResponse } from '../models/api';
import { PublicoApi } from './api/publico.api';

export type EstadoCarga = 'cargando' | 'listo' | 'respaldo';

const CLAVE_LOCAL = 'toto.local';

/**
 * Locales de Toto's y el local elegido por el cliente.
 * Una sola carga para toda la app (header, página Locales, checkout).
 * Si la API no responde se usan los locales de respaldo, sin toast de error.
 */
@Injectable({ providedIn: 'root' })
export class LocalesService {
  private readonly api = inject(PublicoApi);

  private readonly _locales = signal<readonly SucursalResponse[]>(LOCALES_RESPALDO);
  private readonly _estado = signal<EstadoCarga>('cargando');
  private readonly _seleccionadaId = signal<number | null>(this.leerSeleccion());

  readonly estado = this._estado.asReadonly();
  readonly locales = computed(() => this._locales().filter((l) => l.activa));
  readonly seleccionada = computed(() => this.locales().find((l) => l.id === this._seleccionadaId()) ?? null);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this._estado.set('cargando');
    this.api.locales({ context: peticionSilenciosa() }).subscribe({
      next: ({ sucursales }) => {
        this._locales.set(sucursales);
        this._estado.set('listo');
      },
      error: () => {
        this._locales.set(LOCALES_RESPALDO);
        this._estado.set('respaldo');
      },
    });
  }

  seleccionar(id: number | null): void {
    this._seleccionadaId.set(id);
    try {
      if (id === null) sessionStorage.removeItem(CLAVE_LOCAL);
      else sessionStorage.setItem(CLAVE_LOCAL, String(id));
    } catch {
      // modo privado: la selección vive solo en memoria
    }
  }

  private leerSeleccion(): number | null {
    try {
      const valor = sessionStorage.getItem(CLAVE_LOCAL);
      return valor ? Number(valor) : null;
    } catch {
      return null;
    }
  }
}
