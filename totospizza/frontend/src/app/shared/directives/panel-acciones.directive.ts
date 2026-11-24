import { DestroyRef, Directive, TemplateRef, inject } from '@angular/core';
import { PanelCabeceraService } from '../../core/services/panel-cabecera.service';

/**
 * Uso en una página del panel:
 * `<ng-template appPanelAcciones><button>Nuevo empleado</button></ng-template>`
 * El contenido aparece en la barra superior del layout mientras la página está abierta.
 */
@Directive({ selector: 'ng-template[appPanelAcciones]' })
export class PanelAccionesDirective {
  constructor() {
    const cabecera = inject(PanelCabeceraService);
    const plantilla = inject(TemplateRef);
    cabecera.acciones.set(plantilla);
    inject(DestroyRef).onDestroy(() => {
      if (cabecera.acciones() === plantilla) cabecera.acciones.set(null);
    });
  }
}
