import { Injectable, inject, signal } from '@angular/core';
import type { DireccionRequest, TipoEntrega } from '../models/api';
import { LocalesService } from './locales.service';

const CLAVE_ENTREGA = 'toto.entrega';

export interface EntregaDelivery {
  readonly tipo: Extract<TipoEntrega, 'DELIVERY'>;
  readonly sucursalId: number;
  readonly sucursalNombre: string | null;
  readonly direccion: DireccionRequest;
  readonly costoEnvio: number | null;
  readonly minutosEstimados: number | null;
}

export interface EntregaRecojo {
  readonly tipo: Extract<TipoEntrega, 'RECOJO'>;
  readonly sucursalId: number;
  readonly sucursalNombre: string;
}

export type Entrega = EntregaDelivery | EntregaRecojo;

@Injectable({ providedIn: 'root' })
export class EntregaService {
  private readonly locales = inject(LocalesService);
  private readonly _actual = signal<Entrega | null>(leer());

  readonly actual = this._actual.asReadonly();

  guardar(entrega: Entrega): void {
    this._actual.set(entrega);
    this.locales.seleccionar(entrega.sucursalId);
    try {
      sessionStorage.setItem(CLAVE_ENTREGA, JSON.stringify(entrega));
    } catch {
    }
  }

  limpiar(): void {
    this._actual.set(null);
    try {
      sessionStorage.removeItem(CLAVE_ENTREGA);
    } catch {
    }
  }
}

function leer(): Entrega | null {
  try {
    const valor = sessionStorage.getItem(CLAVE_ENTREGA);
    if (!valor) return null;
    const entrega = JSON.parse(valor) as Partial<Entrega>;
    return (entrega.tipo === 'DELIVERY' || entrega.tipo === 'RECOJO') && typeof entrega.sucursalId === 'number' ? (entrega as Entrega) : null;
  } catch {
    return null;
  }
}
