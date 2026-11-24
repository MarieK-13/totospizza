import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarDays, ChevronDown, ExternalLink, LogOut, LucideAngularModule, Menu } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { PanelCabeceraService } from '../../core/services/panel-cabecera.service';
import { ETIQUETA_ROL, iniciales } from '../../core/utils/roles';
import { CampanaNotificaciones } from '../../shared/components/campana-notificaciones/campana-notificaciones';

const FECHA_BARRA = new Intl.DateTimeFormat('es-PE', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Lima',
});

/**
 * Barra superior del panel: título de la sección, acciones de la página,
 * fecha en vivo, campana de notificaciones y menú del usuario.
 */
@Component({
  selector: 'app-topbar',
  imports: [LucideAngularModule, NgTemplateOutlet, CampanaNotificaciones],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'cerrarMenus()' },
})
export class Topbar {
  readonly title = input('');
  readonly subtitle = input('');
  readonly showMenuButton = input(true);
  readonly menuToggle = output<void>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly cabecera = inject(PanelCabeceraService);

  protected readonly fecha = signal(FECHA_BARRA.format(new Date()));
  protected readonly menuAbierto = signal(false);

  protected readonly usuario = this.auth.usuario;
  protected readonly nombre = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombres.split(' ')[0]} ${u.apellidos.split(' ')[0]}` : '';
  });
  protected readonly rol = computed(() => {
    const r = this.auth.rol();
    return r ? ETIQUETA_ROL[r] : '';
  });
  protected readonly iniciales = computed(() => {
    const u = this.usuario();
    return u ? iniciales(u.nombres, u.apellidos) : '';
  });

  protected readonly MenuIcon = Menu;
  protected readonly CalendarIcon = CalendarDays;
  protected readonly ChevronIcon = ChevronDown;
  protected readonly LogoutIcon = LogOut;
  protected readonly SiteIcon = ExternalLink;

  constructor() {
    const reloj = setInterval(() => this.fecha.set(FECHA_BARRA.format(new Date())), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(reloj));
  }

  protected alternarMenu(evento: Event): void {
    evento.stopPropagation();
    this.menuAbierto.update((v) => !v);
  }

  protected cerrarMenus(): void {
    this.menuAbierto.set(false);
  }

  protected irAlSitio(): void {
    void this.router.navigateByUrl('/');
  }

  protected cerrarSesion(): void {
    this.auth.logout('/login').subscribe();
  }
}
