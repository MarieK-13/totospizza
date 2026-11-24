import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  Bike,
  CircleCheck,
  CircleX,
  Clock,
  KeyRound,
  LucideAngularModule,
  MapPin,
  MessageSquareWarning,
  Navigation,
  PackageCheck,
  Phone,
  RefreshCw,
  Route,
  ShieldAlert,
  User,
  Wallet,
  type LucideIconData,
} from 'lucide-angular';
import { peticionSilenciosa } from '../../../core/interceptors/http-context';
import type { EntregaAsignadaResponse, EntregaRealizadaResponse, ResumenRepartoResponse } from '../../../core/models/api';
import { AuthService } from '../../../core/services/auth.service';
import { OperacionApi } from '../../../core/services/api/operacion.api';
import { ToastService } from '../../../core/services/toast.service';
import { esApiException, mensajeDeError } from '../../../core/utils/api-exception';
import { formatearHora } from '../../../core/utils/fechas';
import { formatearSoles } from '../../../core/utils/money';
import { saludo } from '../../../core/utils/roles';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { MotivoDialog } from '../../../shared/components/motivo-dialog/motivo-dialog';
import { PanelModal } from '../../../shared/components/panel-modal/panel-modal';
import type {
  ColumnaReparto,
  EntregaRealizada,
  EntregaReparto,
  EtapaReparto,
  RitmoReparto,
} from '../models/reparto.models';

const REFRESCO_MS = 15_000;
const RELOJ_MS = 20_000;
const RESALTE_NUEVA_MS = 60_000;
/** Con cuántos minutos de margen frente a la hora prometida la entrega pasa a "justo". */
const MARGEN_JUSTO_MIN = 5;

/** Atajos para el motivo de una entrega fallida. */
const MOTIVOS_FALLO = [
  'El cliente no contesta',
  'El cliente no está en la dirección',
  'No encuentro la dirección',
  'El cliente rechazó el pedido',
] as const;

const ICONO_POR_ETAPA: Readonly<Record<EtapaReparto, LucideIconData>> = {
  'por-salir': PackageCheck,
  'en-camino': Navigation,
  entregadas: CircleCheck,
};

/**
 * Tablero del motorizado. Todo sale del backend (GET /reparto/entregas y /reparto/resumen, cada 15 s):
 * por salir (asignada por el despachador) → en camino (inicia ruta) → entregada (PIN del cliente).
 */
@Component({
  selector: 'app-reparto-panel',
  imports: [NgTemplateOutlet, LucideAngularModule, EstadoVacio, PanelModal, MotivoDialog],
  templateUrl: './reparto-panel.component.html',
  styleUrls: ['./reparto-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepartoPanelComponent {
  private readonly api = inject(OperacionApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  private readonly datos = signal<readonly EntregaAsignadaResponse[]>([]);
  private readonly ahora = signal(Date.now());
  private readonly vistasEn = new Map<number, number>();
  private primeraCarga = true;
  /** /reparto/resumen respondió 404: el backend en ejecución no tiene ese endpoint. */
  private sinResumen = false;

  protected readonly saludo = `${saludo()}, ${this.auth.nombreCorto() || 'equipo'}`;
  protected readonly resumen = signal<ResumenRepartoResponse | null>(null);
  protected readonly cargando = signal(true);
  protected readonly sinConexion = signal(false);
  protected readonly actualizadoEn = signal<Date | null>(null);
  protected readonly ocupado = signal<number | null>(null);
  protected readonly backendDesactualizado = signal(false);

  // Entrega fallida
  protected readonly paraFallida = signal<EntregaReparto | null>(null);
  protected readonly errorFallida = signal<string | null>(null);
  protected readonly motivosFallo = MOTIVOS_FALLO;

  // Confirmación con PIN
  protected readonly paraConfirmar = signal<EntregaReparto | null>(null);
  protected readonly pin = signal('');
  protected readonly errorPin = signal<string | null>(null);

  protected readonly entregas = computed(() => this.datos().map((e) => this.aVista(e)));
  protected readonly porSalir = computed(() => this.entregas().filter((e) => e.etapa === 'por-salir'));
  protected readonly enCamino = computed(() => this.entregas().filter((e) => e.etapa === 'en-camino'));
  protected readonly realizadas = computed<readonly EntregaRealizada[]>(() =>
    (this.resumen()?.entregadasHoyDetalle ?? []).map(aRealizada),
  );

  protected readonly columnas = computed<readonly ColumnaReparto[]>(() => [
    { etapa: 'por-salir', tono: 'amarillo', titulo: 'Por salir', ayuda: 'Recógelas en el mostrador', total: this.porSalir().length },
    { etapa: 'en-camino', tono: 'rojo', titulo: 'En camino', ayuda: 'Confirma con el PIN del cliente', total: this.enCamino().length },
    { etapa: 'entregadas', tono: 'verde', titulo: 'Entregadas hoy', ayuda: 'Tu jornada de hoy', total: this.realizadas().length },
  ]);

  protected readonly bonosHoy = computed(() => {
    const r = this.resumen();
    return r ? formatearSoles(r.bonosHoy) : '—';
  });

  protected readonly textoActualizado = computed(() => {
    const fecha = this.actualizadoEn();
    if (!fecha) return 'Conectando con el reparto…';
    const segundos = Math.max(0, Math.round((this.ahora() - fecha.getTime()) / 1000));
    return segundos < 30 ? 'Actualizado hace un momento' : `Actualizado a las ${formatearHora(fecha.toISOString())}`;
  });

  protected readonly formatearSoles = formatearSoles;
  protected readonly iconoDe = (e: EtapaReparto) => ICONO_POR_ETAPA[e];
  protected readonly Icons = {
    Bike, CircleCheck, CircleX, Clock, KeyRound, MapPin, MessageSquareWarning, Navigation, PackageCheck, Phone, RefreshCw, Route,
    ShieldAlert, User, Wallet,
  };

  constructor() {
    this.cargar(false);
    const refresco = setInterval(() => !document.hidden && this.cargar(true), REFRESCO_MS);
    const reloj = setInterval(() => this.ahora.set(Date.now()), RELOJ_MS);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(refresco);
      clearInterval(reloj);
    });
  }

  protected reintentar(): void {
    this.cargar(false);
  }

  protected salirAReparto(entrega: EntregaReparto): void {
    if (this.ocupado() !== null) return;
    this.ocupado.set(entrega.id);
    this.api
      .iniciarRuta(entrega.id)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: () => {
          this.toast.success('¡En camino!', `Saliste con el pedido #${entrega.numero}. El cliente ya lo ve en su seguimiento.`);
          this.cargar(true);
        },
        error: () => this.cargar(true),
      });
  }

  // ---- Entrega fallida ----
  protected abrirFallida(entrega: EntregaReparto): void {
    this.errorFallida.set(null);
    this.paraFallida.set(entrega);
  }

  protected cerrarFallida(): void {
    if (this.ocupado() === null) this.paraFallida.set(null);
  }

  protected reportarFallida(motivo: string): void {
    const entrega = this.paraFallida();
    if (!entrega || this.ocupado() !== null) return;
    this.ocupado.set(entrega.id);
    this.api
      .reportarNoEntregada(entrega.id, { motivo }, { context: peticionSilenciosa() })
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: () => {
          this.paraFallida.set(null);
          this.datos.update((lista) => lista.filter((e) => e.entregaId !== entrega.id));
          this.toast.warning('Pedido devuelto al mostrador', `Regresa con #${entrega.numero} al local; el despachador decide qué hacer.`);
          this.cargar(true);
        },
        error: (e: unknown) => this.errorFallida.set(mensajeDeError(e, 'No pudimos registrar la entrega fallida.')),
      });
  }

  // ---- Confirmación con PIN ----
  protected abrirConfirmacion(entrega: EntregaReparto): void {
    this.paraConfirmar.set(entrega);
    this.pin.set('');
    this.errorPin.set(null);
  }

  protected escribirPin(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const digitos = campo.value.replace(/\D/g, '').slice(0, 4);
    campo.value = digitos;
    this.pin.set(digitos);
    this.errorPin.set(null);
  }

  protected confirmarEntrega(): void {
    const entrega = this.paraConfirmar();
    if (!entrega || this.ocupado() !== null) return;
    if (!/^\d{4}$/.test(this.pin())) {
      this.errorPin.set('El código tiene 4 dígitos.');
      return;
    }
    this.ocupado.set(entrega.id);
    this.api
      .confirmarEntrega(entrega.id, { codigoPin: this.pin() }, { context: peticionSilenciosa() })
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: () => {
          this.paraConfirmar.set(null);
          this.datos.update((lista) => lista.filter((e) => e.entregaId !== entrega.id));
          this.toast.success('Entrega confirmada', `#${entrega.numero} quedó entregado a ${entrega.primerNombre}.`);
          this.cargar(true);
        },
        error: (e: unknown) => {
          this.errorPin.set(mensajeDeError(e, 'No pudimos confirmar la entrega.'));
          // Cada PIN incorrecto descuenta un intento en el backend: se recarga para mostrar los que quedan.
          if (esApiException(e) && (e.codigo === 'PIN_INCORRECTO' || e.codigo === 'PIN_BLOQUEADO')) this.cargar(true);
        },
      });
  }

  protected cerrarConfirmacion(): void {
    if (this.ocupado() === null) this.paraConfirmar.set(null);
  }

  /** La entrega que se está confirmando, con los intentos actualizados tras cada recarga. */
  protected readonly confirmando = computed(() => {
    const abierta = this.paraConfirmar();
    return abierta ? (this.entregas().find((e) => e.id === abierta.id) ?? abierta) : null;
  });

  private cargar(silencioso: boolean): void {
    const contexto = silencioso ? { context: peticionSilenciosa() } : undefined;
    forkJoin({
      entregas: this.api.misEntregas(contexto),
      // La jornada es complementaria: si falla, las entregas activas siguen funcionando.
      resumen: this.api.resumenReparto({ context: peticionSilenciosa() }).pipe(
        catchError((error: unknown) => {
          this.sinResumen = esApiException(error) && error.estado === 404;
          return of(null);
        }),
      ),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ entregas, resumen }) => this.aplicar(entregas, resumen),
        error: () => this.sinConexion.set(true),
      });
  }

  private aplicar(entregas: readonly EntregaAsignadaResponse[], resumen: ResumenRepartoResponse | null): void {
    const ahora = Date.now();
    const nuevas = entregas.filter((e) => !this.vistasEn.has(e.entregaId) && e.estado === 'ASIGNADA');
    for (const e of entregas) {
      if (!this.vistasEn.has(e.entregaId)) this.vistasEn.set(e.entregaId, this.primeraCarga ? 0 : ahora);
    }
    if (!this.primeraCarga && nuevas.length) {
      this.toast.info(
        nuevas.length === 1 ? `Nueva entrega #${nuevas[0].numeroPedido}` : `${nuevas.length} entregas nuevas`,
        'Recógela en el mostrador.',
      );
    }
    this.primeraCarga = false;
    this.datos.set(entregas);
    if (resumen) {
      this.resumen.set(resumen);
      this.sinResumen = false;
    }
    this.backendDesactualizado.set(this.sinResumen || entregas.some((e) => !('intentosRestantes' in e)));
    this.sinConexion.set(false);
    this.actualizadoEn.set(new Date(ahora));
    this.ahora.set(ahora);
  }

  private aVista(e: EntregaAsignadaResponse): EntregaReparto {
    const ahora = this.ahora();
    const d = e.direccion;
    const salida = e.recogidaEn ? new Date(e.recogidaEn).getTime() : null;
    const promesa = e.horaPrometida ? new Date(e.horaPrometida).getTime() : null;
    const minutosParaPromesa = promesa === null ? null : Math.round((promesa - ahora) / 60_000);
    const visto = this.vistasEn.get(e.entregaId) ?? 0;
    return {
      id: e.entregaId,
      numero: e.numeroPedido,
      etapa: e.estado === 'EN_CAMINO' ? 'en-camino' : 'por-salir',
      cliente: e.nombreCliente,
      primerNombre: e.nombreCliente.split(' ')[0] ?? e.nombreCliente,
      telefono: e.telefonoCliente,
      direccion: d.direccion,
      referencia: [d.distrito, d.referencia].filter(Boolean).join(' · ') || null,
      mapa: `https://www.google.com/maps/dir/?api=1&destination=${d.latitud},${d.longitud}`,
      distanciaKm: e.distanciaKm,
      instrucciones: e.instrucciones,
      lineas: (e.items ?? []).map((i) => ({ cantidad: i.cantidad, nombre: i.nombre, descripcion: i.descripcion })),
      totalUnidades: (e.items ?? []).reduce((t, i) => t + i.cantidad, 0),
      horaAsignada: formatearHora(e.asignadaEn),
      minutosAsignada: minutosDesde(new Date(e.asignadaEn).getTime(), ahora),
      horaSalida: e.recogidaEn ? formatearHora(e.recogidaEn) : null,
      minutosEnRuta: salida === null ? null : minutosDesde(salida, ahora),
      horaPrometida: e.horaPrometida ? formatearHora(e.horaPrometida) : null,
      minutosParaPromesa,
      textoPromesa: textoPromesa(minutosParaPromesa),
      progreso: progreso(salida ?? new Date(e.asignadaEn).getTime(), promesa, ahora),
      ritmo: ritmoDe(minutosParaPromesa),
      intentosRestantes: e.intentosRestantes ?? 5,
      esNueva: visto > 0 && ahora - visto < RESALTE_NUEVA_MS,
    };
  }
}

function aRealizada(e: EntregaRealizadaResponse): EntregaRealizada {
  return {
    id: e.entregaId,
    numero: e.numeroPedido,
    cliente: e.nombreCliente,
    distrito: e.distrito,
    distanciaKm: e.distanciaKm,
    horaEntregada: formatearHora(e.entregadaEn),
    minutosEnRuta: e.minutosEnRuta,
    aTiempo: e.aTiempo,
  };
}

function textoPromesa(minutos: number | null): string | null {
  if (minutos === null) return null;
  return minutos >= 0 ? `quedan ${minutos} min` : `atrasado ${-minutos} min`;
}

function ritmoDe(minutosParaPromesa: number | null): RitmoReparto {
  if (minutosParaPromesa === null || minutosParaPromesa > MARGEN_JUSTO_MIN) return 'a-tiempo';
  return minutosParaPromesa >= 0 ? 'justo' : 'atrasado';
}

function progreso(desde: number, hasta: number | null, ahora: number): number {
  if (hasta === null || hasta <= desde) return 0;
  return Math.min(100, Math.max(0, Math.round(((ahora - desde) / (hasta - desde)) * 100)));
}

function minutosDesde(desde: number, ahora: number): number {
  return Math.max(0, Math.floor((ahora - desde) / 60_000));
}
