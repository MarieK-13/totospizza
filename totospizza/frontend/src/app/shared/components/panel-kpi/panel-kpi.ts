import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

export type TonoKpi = 'rojo' | 'verde' | 'ambar' | 'azul';

/** Tarjeta de indicador del panel, con el mismo diseño de Resumen, Empleados y Finanzas. */
@Component({
  selector: 'app-panel-kpi',
  imports: [LucideAngularModule],
  template: `
    <div class="kpi__top">
      <span class="kpi__label">{{ etiqueta() }}</span>
      @if (icono(); as ic) {
        <span class="kpi__icono" [class]="'kpi__icono kpi__icono--' + tono()" aria-hidden="true">
          <lucide-icon [img]="ic" [size]="17" [strokeWidth]="1.8"></lucide-icon>
        </span>
      }
    </div>
    <strong class="kpi__valor">{{ valor() }}</strong>
    @if (pie()) {
      <span class="kpi__pie">{{ pie() }}</span>
    }
  `,
  styleUrl: './panel-kpi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelKpi {
  readonly etiqueta = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly icono = input<LucideIconData>();
  readonly tono = input<TonoKpi>('rojo');
  readonly pie = input('');
}
