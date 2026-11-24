import { Injectable } from '@angular/core';
import type { Sesion } from '../models/sesion.model';

const CLAVE = 'toto.sesion';

/**
 * Guarda la sesión. Por defecto en sessionStorage (se borra al cerrar la pestaña);
 * con "Recordarme" en localStorage. Todo acceso está protegido: puede fallar en modo privado.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorage {
  leer(): Sesion | null {
    return this.parsear(this.intentar(() => sessionStorage.getItem(CLAVE))) ?? this.parsear(this.intentar(() => localStorage.getItem(CLAVE)));
  }

  guardar(sesion: Sesion, recordar?: boolean): void {
    // Si no se indica, se conserva donde ya estaba
    const persistente = recordar ?? this.intentar(() => localStorage.getItem(CLAVE)) !== null;
    this.borrar();
    const json = JSON.stringify(sesion);
    this.intentar(() => (persistente ? localStorage : sessionStorage).setItem(CLAVE, json));
  }

  borrar(): void {
    this.intentar(() => sessionStorage.removeItem(CLAVE));
    this.intentar(() => localStorage.removeItem(CLAVE));
  }

  private parsear(json: string | null): Sesion | null {
    if (!json) return null;
    try {
      const dato = JSON.parse(json) as Partial<Sesion>;
      return dato.accessToken && dato.refreshToken && dato.usuario ? (dato as Sesion) : null;
    } catch {
      return null;
    }
  }

  private intentar<T>(accion: () => T): T | null {
    try {
      return accion();
    } catch {
      return null;
    }
  }
}
