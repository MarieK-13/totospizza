import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Check, ChevronDown, LucideAngularModule, MapPin } from 'lucide-angular';
import type { SucursalResponse } from '../../core/models/api';
import { LocalesService } from '../../core/services/locales.service';

/** Barra verde: avisos en movimiento a la izquierda y selector de local a la derecha. */
@Component({
  selector: 'app-announcement-bar',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './announcement-bar.html',
  styleUrl: './announcement-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class AnnouncementBar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly localesService = inject(LocalesService);

  protected readonly PinIcon = MapPin;
  protected readonly ChevronIcon = ChevronDown;
  protected readonly CheckIcon = Check;

  protected readonly messages = [
    'Envío gratis desde S/ 49',
    'Abierto todos los días de 12:00 a 23:00',
    'Masa artesanal y horno de piedra',
    'Paga online con tarjeta, Yape o Plin',
  ] as const;

  /** El grupo se repite dos veces para que el bucle no tenga cortes. */
  protected readonly copies = [0, 1] as const;

  protected readonly locales = this.localesService.locales;
  protected readonly selected = this.localesService.seleccionada;

  protected readonly open = signal(false);

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected choose(local: SucursalResponse): void {
    this.localesService.seleccionar(local.id);
    this.close();
  }

  protected onDocumentClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
