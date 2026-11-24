import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

let siguienteId = 0;

/**
 * Diálogo del panel. Proyecta el contenido y, con el atributo `acciones`, la fila de botones del pie.
 * Se cierra con Escape, con la X o al hacer clic fuera.
 *
 * <app-panel-modal titulo="Nueva categoría" (cerrar)="...">
 *   ...campos...
 *   <div acciones>...botones...</div>
 * </app-panel-modal>
 */
@Component({
  selector: 'app-panel-modal',
  imports: [LucideAngularModule],
  templateUrl: './panel-modal.html',
  styleUrl: './panel-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cerrar.emit()' },
})
export class PanelModal implements AfterViewInit {
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
  readonly ancho = input<'md' | 'lg' | 'xl'>('md');
  readonly cerrar = output<void>();

  protected readonly idTitulo = `modal-titulo-${++siguienteId}`;
  protected readonly CloseIcon = X;
  private readonly tarjeta = viewChild.required<ElementRef<HTMLElement>>('tarjeta');

  ngAfterViewInit(): void {
    const primero = this.tarjeta().nativeElement.querySelector<HTMLElement>('input, select, textarea');
    (primero ?? this.tarjeta().nativeElement).focus();
  }
}
