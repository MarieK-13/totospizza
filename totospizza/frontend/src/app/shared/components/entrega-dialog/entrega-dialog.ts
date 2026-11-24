import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { Bike, Clock, LoaderCircle, LocateFixed, LucideAngularModule, MapPin, MapPinned, Store, Wallet, X } from 'lucide-angular';
import { peticionSilenciosa } from '../../../core/interceptors/http-context';
import type { CoberturaResponse, SucursalResponse, TipoEntrega } from '../../../core/models/api';
import { PublicoApi } from '../../../core/services/api/publico.api';
import { EntregaService, type Entrega } from '../../../core/services/entrega.service';
import { LocalesService } from '../../../core/services/locales.service';
import { mensajeDeError } from '../../../core/utils/api-exception';
import { formatearSoles } from '../../../core/utils/money';

export type AccionEntrega = 'agregar' | 'comprar';

type Consulta =
  | { readonly tipo: 'inicial' }
  | { readonly tipo: 'buscando' }
  | { readonly tipo: 'resultado'; readonly cobertura: CoberturaResponse; readonly latitud: number; readonly longitud: number }
  | { readonly tipo: 'error'; readonly mensaje: string };

const MENSAJES_GEOLOCALIZACION: Readonly<Record<number, string>> = {
  1: 'Necesitamos permiso para ver tu ubicación. Actívalo en el navegador e intenta de nuevo.',
  2: 'No pudimos detectar tu ubicación. Revisa que el GPS esté activo.',
  3: 'Tardamos demasiado en detectar tu ubicación. Intenta de nuevo.',
};

/** Límites de DireccionRequest en el backend. */
const MAX_DIRECCION = 200;
const MAX_DISTRITO = 80;
const MAX_REFERENCIA = 200;

/**
 * Modal "Dirección de entrega": se abre desde "Agregar" y "Comprar ahora".
 * - Delivery: ubica al cliente (GPS) y valida cobertura con POST /publico/cobertura; luego pide la dirección escrita.
 * - Recojo en tienda: elige un local abierto (GET /publico/locales).
 * Al confirmar guarda la elección en EntregaService y avisa con `confirmado`.
 */
@Component({
  selector: 'app-entrega-dialog',
  imports: [LucideAngularModule],
  templateUrl: './entrega-dialog.html',
  styleUrl: './entrega-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntregaDialog {
  private readonly api = inject(PublicoApi);
  private readonly entrega = inject(EntregaService);
  private readonly localesService = inject(LocalesService);

  /** null = cerrado. Cambia el texto del botón final. */
  readonly accion = input<AccionEntrega | null>(null);
  readonly confirmado = output<Entrega>();
  readonly cerrado = output<void>();

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  protected readonly tipo = signal<TipoEntrega>('DELIVERY');
  protected readonly consulta = signal<Consulta>({ tipo: 'inicial' });
  protected readonly direccion = signal('');
  protected readonly distrito = signal('');
  protected readonly referencia = signal('');
  protected readonly localId = signal<number | null>(null);
  protected readonly intentoConfirmar = signal(false);

  protected readonly buscando = computed(() => this.consulta().tipo === 'buscando');
  protected readonly cobertura = computed(() => {
    const c = this.consulta();
    return c.tipo === 'resultado' ? c.cobertura : null;
  });
  protected readonly locales = this.localesService.locales;

  protected readonly errorDireccion = computed(() => (this.intentoConfirmar() && !this.direccion().trim() ? 'Escribe la calle y el número.' : ''));
  protected readonly errorDistrito = computed(() => (this.intentoConfirmar() && !this.distrito().trim() ? 'Indica tu distrito.' : ''));
  protected readonly errorLocal = computed(() => (this.intentoConfirmar() && this.localId() === null ? 'Elige un local para recoger.' : ''));

  /** El botón final se habilita cuando ya hay algo que confirmar; los campos vacíos se marcan al pulsarlo. */
  protected readonly puedeConfirmar = computed(() =>
    this.tipo() === 'RECOJO' ? this.locales().some((l) => l.abiertoAhora) : !!this.cobertura()?.dentroCobertura && this.cobertura()?.sucursalId != null,
  );
  protected readonly textoBoton = computed(() => (this.accion() === 'comprar' ? 'Confirmar y comprar' : 'Confirmar y agregar'));

  protected readonly soles = formatearSoles;
  protected readonly MAX_DIRECCION = MAX_DIRECCION;
  protected readonly MAX_DISTRITO = MAX_DISTRITO;
  protected readonly MAX_REFERENCIA = MAX_REFERENCIA;

  protected readonly CloseIcon = X;
  protected readonly LocateIcon = LocateFixed;
  protected readonly LoadingIcon = LoaderCircle;
  protected readonly EmptyIcon = MapPinned;
  protected readonly PinIcon = MapPin;
  protected readonly BikeIcon = Bike;
  protected readonly ClockIcon = Clock;
  protected readonly WalletIcon = Wallet;
  protected readonly StoreIcon = Store;

  constructor() {
    effect(() => {
      const abierto = this.accion() !== null;
      const dialogo = this.dialogo().nativeElement;
      untracked(() => {
        if (abierto && !dialogo.open) {
          this.restaurar();
          dialogo.showModal();
        } else if (!abierto && dialogo.open) {
          dialogo.close();
        }
      });
    });
  }

  protected elegirTipo(tipo: TipoEntrega): void {
    this.tipo.set(tipo);
    this.intentoConfirmar.set(false);
  }

  protected ubicar(): void {
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

  protected elegirLocal(local: SucursalResponse): void {
    if (local.abiertoAhora) this.localId.set(local.id);
  }

  protected escribir(campo: 'direccion' | 'distrito' | 'referencia', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this[campo].set(valor);
  }

  protected confirmar(): void {
    this.intentoConfirmar.set(true);
    const resultado = this.armarEntrega();
    if (!resultado) return;
    this.entrega.guardar(resultado);
    this.confirmado.emit(resultado);
  }

  protected cerrar(): void {
    this.cerrado.emit();
  }

  /** Clic en el fondo (fuera del panel) cierra. */
  protected alPulsar(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) this.cerrar();
  }

  /** Esc: se cierra por el estado del padre, no solo por el navegador. */
  protected alCancelar(evento: Event): void {
    evento.preventDefault();
    this.cerrar();
  }

  private armarEntrega(): Entrega | null {
    if (this.tipo() === 'RECOJO') {
      const local = this.locales().find((l) => l.id === this.localId() && l.abiertoAhora);
      return local ? { tipo: 'RECOJO', sucursalId: local.id, sucursalNombre: local.nombre } : null;
    }
    const consulta = this.consulta();
    if (consulta.tipo !== 'resultado' || !consulta.cobertura.dentroCobertura || consulta.cobertura.sucursalId == null) return null;
    const direccion = this.direccion().trim();
    const distrito = this.distrito().trim();
    if (!direccion || !distrito) return null;
    return {
      tipo: 'DELIVERY',
      sucursalId: consulta.cobertura.sucursalId,
      sucursalNombre: consulta.cobertura.sucursalNombre,
      costoEnvio: consulta.cobertura.costoEnvio,
      minutosEstimados: consulta.cobertura.minutosEstimados,
      direccion: { direccion, distrito, referencia: this.referencia().trim() || null, latitud: consulta.latitud, longitud: consulta.longitud },
    };
  }

  /** Al abrir, se retoma lo último que eligió el cliente en esta visita. */
  private restaurar(): void {
    const previa = this.entrega.actual();
    this.intentoConfirmar.set(false);
    this.tipo.set(previa?.tipo ?? 'DELIVERY');
    this.localId.set(previa?.tipo === 'RECOJO' ? previa.sucursalId : null);
    if (previa?.tipo === 'DELIVERY') {
      this.direccion.set(previa.direccion.direccion);
      this.distrito.set(previa.direccion.distrito);
      this.referencia.set(previa.direccion.referencia ?? '');
      this.consulta.set({
        tipo: 'resultado',
        latitud: previa.direccion.latitud,
        longitud: previa.direccion.longitud,
        cobertura: {
          dentroCobertura: true,
          distanciaKm: null,
          sucursalId: previa.sucursalId,
          sucursalNombre: previa.sucursalNombre,
          costoEnvio: previa.costoEnvio,
          minutosEstimados: previa.minutosEstimados,
          mensaje: 'Usaremos la dirección que elegiste antes.',
        },
      });
    } else {
      this.consulta.set({ tipo: 'inicial' });
    }
  }

  private consultarCobertura(latitud: number, longitud: number): void {
    this.api.cobertura({ latitud, longitud }, { context: peticionSilenciosa() }).subscribe({
      next: (cobertura) => this.consulta.set({ tipo: 'resultado', cobertura, latitud, longitud }),
      error: (error: unknown) => this.consulta.set({ tipo: 'error', mensaje: mensajeDeError(error) }),
    });
  }
}
