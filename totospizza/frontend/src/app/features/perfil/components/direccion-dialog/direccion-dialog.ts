import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CircleAlert, CircleCheck, Crosshair, LucideAngularModule, MapPin, Search, TriangleAlert, X } from 'lucide-angular';
import type { CoberturaResponse, DireccionClienteRequest, DireccionClienteResponse } from '../../../../core/models/api';
import { ClienteApi } from '../../../../core/services/api/cliente.api';
import { PublicoApi } from '../../../../core/services/api/publico.api';
import { GeocodificacionService } from '../../../../core/services/geocodificacion.service';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { CheckboxField } from '../../../../shared/components/checkbox-field/checkbox-field';
import { TextField } from '../../../../shared/components/text-field/text-field';

type Ubicacion =
  | { readonly tipo: 'ninguna' }
  | { readonly tipo: 'buscando'; readonly texto: string }
  | {
      readonly tipo: 'lista';
      readonly latitud: number;
      readonly longitud: number;
      readonly cobertura: CoberturaResponse | null;
      /** Si salió de buscar la dirección en el mapa: lo que encontró, para que el cliente lo verifique. */
      readonly encontrada?: string;
    }
  | { readonly tipo: 'error'; readonly mensaje: string };

const MENSAJES_GEOLOCALIZACION: Readonly<Record<number, string>> = {
  1: 'Necesitamos permiso para ver tu ubicación. Actívalo en el navegador e intenta de nuevo.',
  2: 'No pudimos detectar tu ubicación. Revisa que el GPS esté activo.',
  3: 'Tardamos demasiado en detectar tu ubicación. Intenta de nuevo.',
};

const ETIQUETAS_RAPIDAS = ['Casa', 'Trabajo', 'Universidad'] as const;

@Component({
  selector: 'app-direccion-dialog',
  imports: [ReactiveFormsModule, LucideAngularModule, TextField, CheckboxField],
  templateUrl: './direccion-dialog.html',
  styleUrl: './direccion-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DireccionDialog {
  readonly direccion = input<DireccionClienteResponse | null | undefined>(undefined);
  readonly esPrimera = input(false);
  readonly guardada = output<DireccionClienteResponse>();
  readonly cerrado = output<void>();

  private readonly api = inject(ClienteApi);
  private readonly publico = inject(PublicoApi);
  private readonly geo = inject(GeocodificacionService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  protected readonly form = this.fb.group({
    etiqueta: ['', [Validators.required, Validators.maxLength(40)]],
    direccion: ['', [Validators.required, Validators.maxLength(200)]],
    distrito: ['Ica', [Validators.required, Validators.maxLength(80)]],
    referencia: ['', [Validators.maxLength(200)]],
    favorita: [false],
  });

  protected readonly ubicacion = signal<Ubicacion>({ tipo: 'ninguna' });
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly faltaUbicacion = signal(false);
  protected readonly editando = computed(() => !!this.direccion());
  protected readonly etiquetasRapidas = ETIQUETAS_RAPIDAS;

  protected readonly CloseIcon = X;
  protected readonly GpsIcon = Crosshair;
  protected readonly PinIcon = MapPin;
  protected readonly OkIcon = CircleCheck;
  protected readonly WarnIcon = TriangleAlert;
  protected readonly AlertIcon = CircleAlert;
  protected readonly SearchIcon = Search;

  constructor() {
    effect(() => {
      const actual = this.direccion();
      const dialogo = this.dialogo().nativeElement;
      if (actual === undefined) {
        if (dialogo.open) dialogo.close();
        return;
      }
      this.preparar(actual);
      if (!dialogo.open) dialogo.showModal();
    });
  }

  protected elegirEtiqueta(etiqueta: string): void {
    this.form.controls.etiqueta.setValue(etiqueta);
    this.form.controls.etiqueta.markAsDirty();
  }

  protected ubicar(): void {
    if (!('geolocation' in navigator)) {
      this.ubicacion.set({ tipo: 'error', mensaje: 'Tu navegador no permite detectar la ubicación.' });
      return;
    }
    this.ubicacion.set({ tipo: 'buscando', texto: 'Detectando tu ubicación…' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => this.consultarCobertura(coords.latitude, coords.longitude),
      (e) => this.ubicacion.set({ tipo: 'error', mensaje: MENSAJES_GEOLOCALIZACION[e.code] ?? MENSAJES_GEOLOCALIZACION[2] }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  /** Para quien no está en el lugar: busca en el mapa la dirección (o su referencia) que escribió. */
  protected buscarPorDireccion(): void {
    const { direccion, distrito, referencia } = this.form.getRawValue();
    if (!direccion.trim()) {
      this.form.controls.direccion.markAsTouched();
      this.ubicacion.set({ tipo: 'error', mensaje: 'Escribe primero la dirección y el distrito para buscarla en el mapa.' });
      return;
    }
    this.ubicacion.set({ tipo: 'buscando', texto: 'Buscando la dirección en el mapa…' });
    const zona = [distrito.trim(), 'Ica', 'Perú'].filter(Boolean).join(', ');
    this.geo
      .buscar([`${direccion}, ${zona}`, referencia ? `${referencia}, ${zona}` : '', `${direccion}, Perú`])
      .subscribe((punto) => {
        if (!punto) {
          this.ubicacion.set({
            tipo: 'error',
            mensaje: 'No encontramos esa dirección en el mapa. Prueba con una referencia conocida (por ejemplo "UTP Ica") o usa tu ubicación.',
          });
          return;
        }
        this.consultarCobertura(punto.latitud, punto.longitud, punto.descripcion);
      });
  }

  protected mapaDe(latitud: number, longitud: number): string {
    return `https://www.openstreetmap.org/?mlat=${latitud}&mlon=${longitud}#map=18/${latitud}/${longitud}`;
  }

  protected enviar(): void {
    if (this.enviando()) return;
    const ubicacion = this.ubicacion();
    this.faltaUbicacion.set(ubicacion.tipo !== 'lista');
    if (this.form.invalid || ubicacion.tipo !== 'lista') {
      this.form.markAllAsTouched();
      this.error.set(
        ubicacion.tipo !== 'lista'
          ? 'Falta ubicar la dirección: usa tu ubicación o búscala en el mapa con "Buscar dirección".'
          : 'Revisa los campos marcados.',
      );
      return;
    }

    const v = this.form.getRawValue();
    const cuerpo: DireccionClienteRequest = {
      etiqueta: v.etiqueta.trim(),
      favorita: v.favorita,
      direccion: {
        direccion: v.direccion.trim(),
        distrito: v.distrito.trim(),
        referencia: v.referencia.trim() || null,
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud,
      },
    };
    const actual = this.direccion();
    const peticion$ = actual ? this.api.actualizarDireccion(actual.id, cuerpo) : this.api.agregarDireccion(cuerpo);

    this.enviando.set(true);
    this.error.set(null);
    peticion$.pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: (guardada) => this.guardada.emit(guardada),
      error: (error: unknown) => {
        if (esApiException(error) && error.errores.length > 0) {
          const errores = error.errores.map((e) => ({ ...e, campo: e.campo.replace(/^direccion\.(?!direccion$)/, '') }));
          const sueltos = aplicarErroresDeCampo(this.form, errores);
          this.error.set(sueltos.length > 0 ? sueltos.join(' ') : 'Revisa los campos marcados.');
          return;
        }
        this.error.set(mensajeDeError(error, 'No pudimos guardar la dirección. Intenta de nuevo.'));
      },
    });
  }

  protected cerrar(): void {
    if (!this.enviando()) this.cerrado.emit();
  }

  protected alPulsar(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) this.cerrar();
  }

  protected alCancelar(evento: Event): void {
    evento.preventDefault();
    this.cerrar();
  }

  private preparar(actual: DireccionClienteResponse | null): void {
    this.error.set(null);
    this.faltaUbicacion.set(false);
    if (actual) {
      this.form.reset({
        etiqueta: actual.etiqueta,
        direccion: actual.direccion.direccion,
        distrito: actual.direccion.distrito,
        referencia: actual.direccion.referencia ?? '',
        favorita: actual.favorita,
      });
      this.ubicacion.set({ tipo: 'lista', latitud: actual.direccion.latitud, longitud: actual.direccion.longitud, cobertura: null });
    } else {
      this.form.reset({ etiqueta: '', direccion: '', distrito: 'Ica', referencia: '', favorita: this.esPrimera() });
      this.ubicacion.set({ tipo: 'ninguna' });
    }
  }

  private consultarCobertura(latitud: number, longitud: number, encontrada?: string): void {
    this.faltaUbicacion.set(false);
    this.error.set(null);
    this.publico.cobertura({ latitud, longitud }).subscribe({
      next: (cobertura) => this.ubicacion.set({ tipo: 'lista', latitud, longitud, cobertura, encontrada }),
      error: () => this.ubicacion.set({ tipo: 'lista', latitud, longitud, cobertura: null, encontrada }),
    });
  }
}
