import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { Bell, LucideAngularModule } from 'lucide-angular';
import { peticionSilenciosa } from '../../../core/interceptors/http-context';
import type { NotificacionResponse } from '../../../core/models/api';
import { OperacionApi } from '../../../core/services/api/operacion.api';
import { formatearFechaHora } from '../../../core/utils/fechas';

const REFRESCO_MS = 60_000;

/**
 * Campana con las notificaciones del usuario (GET /notificaciones). Se usa en el panel del personal
 * y en la cabecera del sitio para el cliente. Se cierra al hacer clic fuera o con Escape.
 */
@Component({
  selector: 'app-campana-notificaciones',
  imports: [LucideAngularModule],
  templateUrl: './campana-notificaciones.html',
  styleUrl: './campana-notificaciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'alClicFuera($event)',
    '(document:keydown.escape)': 'cerrar()',
  },
})
export class CampanaNotificaciones {
  /** 'panel' = estilo del panel del personal; 'sitio' = cabecera pública. */
  readonly variante = input<'panel' | 'sitio'>('panel');

  private readonly api = inject(OperacionApi);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly noLeidas = signal(0);
  protected readonly notificaciones = signal<readonly NotificacionResponse[]>([]);
  protected readonly abierta = signal(false);
  protected readonly cargando = signal(false);
  protected readonly fechaHora = formatearFechaHora;
  protected readonly BellIcon = Bell;

  constructor() {
    this.contarNoLeidas();
    const id = setInterval(() => !document.hidden && this.contarNoLeidas(), REFRESCO_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }

  cerrar(): void {
    this.abierta.set(false);
  }

  protected alternar(): void {
    const abrir = !this.abierta();
    this.abierta.set(abrir);
    if (!abrir) return;
    this.cargando.set(true);
    this.api
      .notificaciones({ pagina: 0, tamano: 10 })
      .pipe(catchError(() => of(null)))
      .subscribe((pagina) => {
        this.cargando.set(false);
        if (pagina) this.notificaciones.set(pagina.contenido);
      });
  }

  protected alClicFuera(evento: Event): void {
    if (!this.host.nativeElement.contains(evento.target as Node)) this.cerrar();
  }

  protected leer(n: NotificacionResponse): void {
    if (n.leida) return;
    this.api.marcarNotificacionLeida(n.id).subscribe(() => {
      this.notificaciones.update((lista) => lista.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
      this.noLeidas.update((c) => Math.max(0, c - 1));
    });
  }

  protected leerTodas(): void {
    this.api.marcarTodasLeidas().subscribe(() => {
      this.notificaciones.update((lista) => lista.map((x) => ({ ...x, leida: true })));
      this.noLeidas.set(0);
    });
  }

  private contarNoLeidas(): void {
    this.api
      .contarNoLeidas({ context: peticionSilenciosa() })
      .pipe(catchError(() => of(null)))
      .subscribe((c) => c && this.noLeidas.set(c.total));
  }
}
