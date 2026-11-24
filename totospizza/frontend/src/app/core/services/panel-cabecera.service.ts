import { Injectable, TemplateRef, signal } from '@angular/core';

/**
 * Puente entre cada página del panel y la barra superior del layout:
 * la página entrega sus acciones (botones, filtros) y el layout las dibuja a la derecha del título.
 */
@Injectable({ providedIn: 'root' })
export class PanelCabeceraService {
  readonly acciones = signal<TemplateRef<unknown> | null>(null);
}
