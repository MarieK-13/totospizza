import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { navegacionPanel } from '../../core/constants/navigation';
import { AuthService } from '../../core/services/auth.service';
import { ETIQUETA_ROL } from '../../core/utils/roles';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

interface DatosSeccion {
  readonly titulo: string;
  readonly subtitulo: string;
}

/**
 * Layout de todos los paneles del personal (administrador, cocina, despacho y reparto):
 * menú lateral con las secciones del rol + barra superior + la sección activa.
 * El título y el subtítulo de cada sección salen del `data` de su ruta.
 */
@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeSidebar()' },
})
export class DashboardLayout {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  protected readonly nav = computed(() => navegacionPanel(this.auth.rol()));
  protected readonly sidebarOpen = signal(false);

  protected readonly seccion = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.datosSeccion()),
    ),
    { initialValue: this.datosSeccion() },
  );

  protected readonly nombre = computed(() => {
    const u = this.auth.usuario();
    return u ? `${u.nombres.split(' ')[0]} ${u.apellidos.split(' ')[0]}` : 'Personal';
  });
  protected readonly rol = computed(() => {
    const r = this.auth.rol();
    return r ? ETIQUETA_ROL[r] : '';
  });

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected cerrarSesion(): void {
    this.auth.logout('/login').subscribe();
  }

  private datosSeccion(): DatosSeccion {
    let actual = this.route.snapshot;
    while (actual.firstChild) actual = actual.firstChild;
    const { data } = actual;
    return { titulo: data['titulo'] ?? 'Panel', subtitulo: data['subtitulo'] ?? '' };
  }
}
