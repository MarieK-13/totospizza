import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface SeccionLegal {
  /** Se usa también como ancla del índice. */
  readonly id: string;
  readonly titulo: string;
  readonly parrafos: readonly string[];
  readonly items?: readonly string[];
}

/**
 * Plantilla de documentos legales (términos, privacidad): índice lateral fijo en escritorio
 * y secciones numeradas, para leer de corrido o saltar a lo que se busca.
 */
@Component({
  selector: 'app-legal-document',
  imports: [RouterLink],
  templateUrl: './legal-document.html',
  styleUrl: './legal-document.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalDocument {
  readonly titulo = input.required<string>();
  readonly resumen = input.required<string>();
  readonly actualizado = input.required<string>();
  readonly secciones = input.required<readonly SeccionLegal[]>();
  /** Enlace al otro documento legal. */
  readonly relacionado = input<{ readonly etiqueta: string; readonly ruta: string }>();

  protected irA(id: string, evento: Event): void {
    evento.preventDefault();
    const destino = document.getElementById(id);
    if (!destino) return;
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    destino.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
    destino.focus({ preventScroll: true });
  }
}
