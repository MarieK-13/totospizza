import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CircleAlert, CircleCheck, Crosshair, LucideAngularModule, MapPin, TriangleAlert, X } from 'lucide-angular';
import type { CoberturaResponse, DireccionClienteRequest, DireccionClienteResponse } from '../../../../core/models/api';
import { ClienteApi } from '../../../../core/services/api/cliente.api';
import { PublicoApi } from '../../../../core/services/api/publico.api';
import { esApiException, mensajeDeError } from '../../../../core/utils/api-exception';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { CheckboxField } from '../../../../shared/components/checkbox-field/checkbox-field';
import { TextField } from '../../../../shared/components/text-field/text-field';

type Ubicacion =
  | { readonly tipo: 'ninguna' }
  | { readonly tipo: 'buscando' }
  | { readonly tipo: 'lista'; readonly latitud: number; readonly longitud: number; readonly cobertura: CoberturaResponse | null }
  | { readonly tipo: 'error'; readonly mensaje: string };

const MENSAJES_GEOLOCALIZACION: Readonly<Record<number, string>> = {
  1: 'Necesitamos permiso para ver tu ubicación. Actívalo en el navegador e intenta de nuevo.',
  2: 'No pudimos detectar tu ubicación. Revisa que el GPS esté activo.',
  3: 'Tardamos demasiado en detectar tu ubicación. Intenta de nuevo.',
};

const ETIQUETAS_RAPIDAS = ['Casa', 'Trabajo', 'Universidad'] as const;

/**
 * Agregar o editar una dirección guardada. Las coordenadas salen del GPS del dispositivo
 * (el backend las usa para validar la zona de reparto), el texto lo escribe el cliente.
 */
@Component({
  selector: 'app-direccion-dialog',
  imports: [ReactiveFormsModule, LucideAngularModule, TextField, CheckboxField],
  templateUrl: './direccion-dialog.html',
  styleUrl: './direccion-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DireccionDialog {
  /** `undefined`: cerrado · `null`: nueva dirección · objeto: editar esa dirección. */
  readonly direccion = input<DireccionClienteResponse | null | undefined>(undefined);
  /** La primera dirección se marca favorita por defecto. */
  readonly esPrimera = input(false);
  readonly guardada = output<DireccionClienteResponse>();
  readonly cerrado = output<void>();

  private readonly api = inject(ClienteApi);
  private readonly publico = inject(PublicoApi);
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
    this.ubicacion.set({ tipo: 'buscando' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => this.consultarCobertura(coords.latitude, coords.longitude),
      (e) => this.ubicacion.set({ tipo: 'error', mensaje: MENSAJES_GEOLOCALIZACION[e.code] ?? MENSAJES_GEOLOCALIZACION[2] }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  protected enviar(): void {
    if (this.enviando()) return;
    const ubicacion = this.ubicacion();
    this.faltaUbicacion.set(ubicacion.tipo !== 'lista');
    if (this.form.invalid || ubicacion.tipo !== 'lista') {
      this.form.markAllAsTouched();
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
          // El backend nombra los campos anidados como "direccion.distrito": se quita el prefijo
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

  /** Esc: el cierre lo decide el padre (quita la dirección en edición). */
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

  private consultarCobertura(latitud: number, longitud: number): void {
    this.faltaUbicacion.set(false);
    this.publico.cobertura({ latitud, longitud }).subscribe({
      next: (cobertura) => this.ubicacion.set({ tipo: 'lista', latitud, longitud, cobertura }),
      // Sin respuesta de cobertura igual se puede guardar: se valida al pagar
      error: () => this.ubicacion.set({ tipo: 'lista', latitud, longitud, cobertura: null }),
    });
  }
}
