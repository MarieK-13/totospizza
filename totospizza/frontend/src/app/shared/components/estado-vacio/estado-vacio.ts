import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Inbox, LoaderCircle, LucideAngularModule, type LucideIconData } from 'lucide-angular';

/**
 * Estado vacío reutilizable: ícono, título y mensaje cuando una lista no tiene datos.
 * Mientras `cargando` es verdadero muestra un indicador en lugar del mensaje.
 * Lo que se proyecte (por ejemplo un botón "Crear") aparece debajo del texto.
 */
@Component({
  selector: 'app-estado-vacio',
  imports: [LucideAngularModule],
  templateUrl: './estado-vacio.html',
  styleUrl: './estado-vacio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status', '[class.is-compacto]': 'compacto()' },
})
export class EstadoVacio {
  readonly titulo = input('No hay datos');
  readonly mensaje = input('');
  readonly icono = input<LucideIconData>(Inbox);
  readonly cargando = input(false);
  readonly compacto = input(false);

  protected readonly LoaderIcon = LoaderCircle;
}
