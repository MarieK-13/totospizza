import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bike, Clock, LocateFixed, LucideAngularModule, MapPin, Wallet } from 'lucide-angular';
import { peticionSilenciosa } from '../../core/interceptors/http-context';
import type { CoberturaResponse } from '../../core/models/api';
import { PublicoApi } from '../../core/services/api/publico.api';
import { LocalesService } from '../../core/services/locales.service';
import { NavegacionService } from '../../core/services/navegacion.service';
import { mensajeDeError } from '../../core/utils/api-exception';
import { formatearSoles } from '../../core/utils/money';

type Consulta =
  | { readonly tipo: 'inicial' }
  | { readonly tipo: 'buscando' }
  | { readonly tipo: 'resultado'; readonly cobertura: CoberturaResponse }
  | { readonly tipo: 'error'; readonly mensaje: string };

const MENSAJES_GEOLOCALIZACION: Readonly<Record<number, string>> = {
  1: 'Necesitamos permiso para ver tu ubicación. Actívalo en el navegador e intenta de nuevo.',
  2: 'No pudimos detectar tu ubicación. Revisa que el GPS esté activo.',
  3: 'Tardamos demasiado en detectar tu ubicación. Intenta de nuevo.',
};

/** Consulta si Toto's llega a la ubicación del cliente y muestra los costos de envío por zona. */
@Component({
  selector: 'app-zona-de-reparto',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './zona-de-reparto.html',
  styleUrl: './zona-de-reparto.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZonaDeReparto {
  private readonly api = inject(PublicoApi);
  private readonly localesService = inject(LocalesService);
  private readonly navegacion = inject(NavegacionService);

  protected readonly LocateIcon = LocateFixed;
  protected readonly BikeIcon = Bike;
  protected readonly ClockIcon = Clock;
  protected readonly WalletIcon = Wallet;
  protected readonly PinIcon = MapPin;

  protected readonly consulta = signal<Consulta>({ tipo: 'inicial' });
  protected readonly buscando = computed(() => this.consulta().tipo === 'buscando');
  protected readonly localesConZonas = computed(() => this.localesService.locales().filter((l) => l.zonas.length > 0));

  protected readonly soles = formatearSoles;

  protected consultar(): void {
    if (!('geolocation' in navigator)) {
      this.consulta.set({ tipo: 'error', mensaje: 'Tu navegador no permite detectar la ubicación.' });
      return;
    }
    this.consulta.set({ tipo: 'buscando' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => this.consultarCobertura(coords.latitude, coords.longitude),
      (error) => this.consulta.set({ tipo: 'error', mensaje: MENSAJES_GEOLOCALIZACION[error.code] ?? MENSAJES_GEOLOCALIZACION[2] }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  protected armarPedido(): void {
    void this.navegacion.irAArmarPedido();
  }

  private consultarCobertura(latitud: number, longitud: number): void {
    this.api.cobertura({ latitud, longitud }, { context: peticionSilenciosa() }).subscribe({
      next: (cobertura) => this.consulta.set({ tipo: 'resultado', cobertura }),
      error: (error: unknown) => this.consulta.set({ tipo: 'error', mensaje: mensajeDeError(error) }),
    });
  }
}
