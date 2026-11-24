import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteHeader } from '../../../../layout/header/header';
import { Cherry, Flame, Leaf, LucideAngularModule, Pizza, Sprout, Wheat, type LucideIconData } from 'lucide-angular';

interface Garabato {
  readonly icono: LucideIconData;
  readonly clase: string;
}

/**
 * Estructura de las pantallas de acceso: columna del formulario (título, logo y línea roja)
 * y panel de arte al lado. El contenido se proyecta así:
 *
 *   <app-auth-shell titulo="..." posicionArte="derecha" variante="ilustracion">
 *     ...formulario...
 *     <div arte>...textos sobre el arte...</div>
 *   </app-auth-shell>
 */
@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink, LucideAngularModule, SiteHeader],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShell {
  readonly titulo = input.required<string>();
  readonly posicionArte = input<'izquierda' | 'derecha'>('derecha');
  /** `ilustracion`: panel rojo con la pizza · `foto`: foto a pantalla completa con degradado. */
  readonly variante = input<'ilustracion' | 'foto'>('ilustracion');
  /** Imagen exportada de Figma. Si es null se usa la versión armada con CSS. */
  readonly imagenArte = input<string | null>(null);

  protected readonly garabatos: readonly Garabato[] = [
    { icono: Cherry, clase: 'g1' },
    { icono: Leaf, clase: 'g2' },
    { icono: Pizza, clase: 'g3' },
    { icono: Sprout, clase: 'g4' },
    { icono: Wheat, clase: 'g5' },
    { icono: Flame, clase: 'g6' },
    { icono: Leaf, clase: 'g7' },
    { icono: Cherry, clase: 'g8' },
  ];
}
