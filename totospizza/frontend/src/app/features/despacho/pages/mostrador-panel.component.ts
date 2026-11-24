import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  Bike,
  ChefHat,
  Ban,
  Clock,
  Hand,
  KeyRound,
  LockOpen,
  LucideAngularModule,
  MapPin,
  MessageSquareWarning,
  Navigation,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  Send,
  Store,
  User,
  UserRoundCheck,
  type LucideIconData,
} from 'lucide-angular';
import { peticionSilenciosa } from '../../../core/interceptors/http-context';
import type { EmpleadoResponse, EstadoEmpleado, PedidoListoResponse, ResumenDespachoResponse } from '../../../core/models/api';
import { AuthService } from '../../../core/services/auth.service';
import { OperacionApi } from '../../../core/services/api/operacion.api';
import { ToastService } from '../../../core/services/toast.service';
import { esApiException, mensajeDeError } from '../../../core/utils/api-exception';
import { formatearHora } from '../../../core/utils/fechas';
import { iniciales, saludo } from '../../../core/utils/roles';
import { normalizar, valorDe } from '../../../core/utils/texto';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { MotivoDialog } from '../../../shared/components/motivo-dialog/motivo-dialog';
import { PanelModal } from '../../../shared/components/panel-modal/panel-modal';
import type { AccionConMotivo, ColumnaMostrador, EtapaMostrador, OpcionMotorizado, PedidoMostrador } from '../models/mostrador.models';

const REFRESCO_MS = 15_000;
const RELOJ_MS = 20_000;
const RESALTE_NUEVO_MS = 60_000;
/** A partir de cuántos minutos para vencer se avisa en un recojo. */
const AVISO_RECOJO_MIN = 15;

const ESTADO_MOTORIZADO: Readonly<Record<EstadoEmpleado, string>> = {
  DISPONIBLE: 'Disponible',
  EN_TURNO: 'En turno',
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  CON_LICENCIA: 'Con licencia',
};

const MOTIVOS: Readonly<Record<AccionConMotivo, readonly string[]>> = {
  cancelar: ['El cliente no contestó', 'El cliente pidió cancelar', 'Dirección inexistente'],
  'sin-pin': ['Confirmado por llamada con el cliente', 'El cliente no encuentra su código'],
};

const ICONO_POR_ETAPA: Readonly<Record<EtapaMostrador, LucideIconData>> = {
  'por-asignar': Send,
  asignados: UserRoundCheck,
  recojo: Store,
  'en-camino': Navigation,
};

/**
 * Mostrador del despachador. Todo sale del backend (GET /despacho/pedidos-listos y /despacho/resumen,
 * refrescados cada 15 s): delivery por asignar → asignado (esperando que el motorizado salga) → en camino;
 * recojo → se entrega al cliente en el mostrador antes de que venza.
 */
@Component({
  selector: 'app-mostrador-panel',
  imports: [LucideAngularModule, EstadoVacio, PanelModal, MotivoDialog],
  templateUrl: './mostrador-panel.component.html',
  styleUrls: ['./mostrador-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostradorPanelComponent {
  private readonly api = inject(OperacionApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  private readonly datos = signal<readonly PedidoListoResponse[]>([]);
  private readonly ahora = signal(Date.now());
  private readonly vistosEn = new Map<number, number>();
  private readonly fallidasAvisadas = new Set<number>();
  private primeraCarga = true;
  /** /despacho/resumen respondió 404: el backend en ejecución no tiene ese endpoint. */
  private sinResumen = false;

  protected readonly saludo = `${saludo()}, ${this.auth.nombreCorto() || 'equipo'}`;
  protected readonly resumen = signal<ResumenDespachoResponse | null>(null);
  protected readonly cargando = signal(true);
  protected readonly sinConexion = signal(false);
  protected readonly actualizadoEn = signal<Date | null>(null);
  protected readonly busqueda = signal('');
  protected readonly ocupado = signal(false);
  /** El servidor responde sin los datos nuevos del mostrador: está corriendo una versión anterior del backend. */
  protected readonly backendDesactualizado = signal(false);

  // Asignación de motorizado (delivery) y entrega en mostrador (recojo)
  protected readonly paraAsignar = signal<PedidoMostrador | null>(null);
  protected readonly paraEntregar = signal<PedidoMostrador | null>(null);
  private readonly motorizados = signal<readonly EmpleadoResponse[]>([]);
  protected readonly cargandoMotorizados = signal(false);
  protected readonly motorizadoElegido = signal<number | null>(null);

  // Acciones que piden motivo: cancelar un delivery fallido o confirmar sin PIN
  protected readonly accion = signal<{ readonly tipo: AccionConMotivo; readonly pedido: PedidoMostrador } | null>(null);
  protected readonly errorAccion = signal<string | null>(null);
  protected readonly motivosDe = (tipo: AccionConMotivo) => MOTIVOS[tipo];

  protected readonly pedidos = computed(() => this.datos().map((p) => this.aVista(p)));

  protected readonly columnas = computed<readonly ColumnaMostrador[]>(() => {
    const q = normalizar(this.busqueda());
    const visibles = q
      ? this.pedidos().filter((p) => normalizar(`${p.numero} ${p.cliente} ${p.telefono ?? ''}`).includes(q))
      : this.pedidos();
    const de = (etapa: EtapaMostrador) => visibles.filter((p) => p.etapa === etapa);
    return [
      { etapa: 'por-asignar', tono: 'rojo', titulo: 'Por asignar', ayuda: 'Delivery listo sin motorizado', pedidos: de('por-asignar') },
      { etapa: 'asignados', tono: 'amarillo', titulo: 'Asignados', ayuda: 'Esperando que el motorizado salga', pedidos: de('asignados') },
      { etapa: 'recojo', tono: 'beige', titulo: 'Recojo en tienda', ayuda: 'El cliente viene al local', pedidos: de('recojo') },
      { etapa: 'en-camino', tono: 'verde', titulo: 'En camino', ayuda: 'Ya salieron con el motorizado', pedidos: de('en-camino') },
    ];
  });

  protected readonly porDespachar = computed(
    () => this.pedidos().filter((p) => p.etapa === 'por-asignar' || p.etapa === 'recojo').length,
  );
  protected readonly enCamino = computed(() => this.pedidos().filter((p) => p.etapa === 'en-camino').length);

  /** Entregas que cada motorizado lleva ahora (asignadas o en camino), según el mismo tablero. */
  private readonly cargaPorMotorizado = computed(() => {
    const carga = new Map<string, number>();
    for (const p of this.pedidos()) {
      if (p.motorizado && (p.etapa === 'asignados' || p.etapa === 'en-camino')) {
        carga.set(p.motorizado, (carga.get(p.motorizado) ?? 0) + 1);
      }
    }
    return carga;
  });

  protected readonly opcionesMotorizado = computed<readonly OpcionMotorizado[]>(() =>
    this.motorizados()
      .map((m) => ({
        id: m.id,
        nombre: m.nombreCompleto,
        iniciales: iniciales(m.nombres, m.apellidos),
        telefono: m.telefono,
        estado: m.estado,
        entregasEnCurso: this.cargaPorMotorizado().get(m.nombreCompleto) ?? 0,
      }))
      .sort((a, b) => a.entregasEnCurso - b.entregasEnCurso || a.nombre.localeCompare(b.nombre)),
  );

  protected readonly textoActualizado = computed(() => {
    const fecha = this.actualizadoEn();
    if (!fecha) return 'Conectando con el mostrador…';
    const segundos = Math.max(0, Math.round((this.ahora() - fecha.getTime()) / 1000));
    return segundos < 30 ? 'Actualizado hace un momento' : `Actualizado a las ${formatearHora(fecha.toISOString())}`;
  });

  protected readonly valor = valorDe;
  protected readonly etiquetaEstado = (e: EstadoEmpleado) => ESTADO_MOTORIZADO[e];
  protected readonly iconoDe = (e: EtapaMostrador) => ICONO_POR_ETAPA[e];
  protected readonly Icons = {
    Ban, Bike, ChefHat, Clock, Hand, KeyRound, LockOpen, MapPin, MessageSquareWarning, PackageCheck, Phone, RefreshCw, Search, Send, Store, User, UserRoundCheck,
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

  // ---- Asignar motorizado ----
  protected abrirAsignar(pedido: PedidoMostrador): void {
    this.paraAsignar.set(pedido);
    this.motorizadoElegido.set(null);
    this.cargandoMotorizados.set(true);
    this.api
      .motorizadosDisponibles()
      .pipe(finalize(() => this.cargandoMotorizados.set(false)))
      .subscribe({
        next: (lista) => {
          this.motorizados.set(lista);
          const libre = this.opcionesMotorizado().find((m) => m.nombre !== pedido.motorizado);
          this.motorizadoElegido.set(libre?.id ?? null);
        },
        error: () => this.motorizados.set([]),
      });
  }

  protected confirmarAsignacion(): void {
    const pedido = this.paraAsignar();
    const motorizadoId = this.motorizadoElegido();
    if (!pedido || motorizadoId === null || this.ocupado()) return;
    this.ocupado.set(true);
    this.api
      .asignarMotorizado(pedido.id, { motorizadoId })
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: (entrega) => {
          this.paraAsignar.set(null);
          this.toast.success(
            pedido.motorizado ? 'Motorizado reasignado' : 'Motorizado asignado',
            `#${pedido.numero} sale con ${entrega.motorizadoNombre ?? 'el motorizado'}.`,
          );
          this.cargar(true);
        },
        error: () => this.cargar(true),
      });
  }

  // ---- Entregar en mostrador ----
  protected abrirEntregar(pedido: PedidoMostrador): void {
    this.paraEntregar.set(pedido);
  }

  protected confirmarEntrega(): void {
    const pedido = this.paraEntregar();
    if (!pedido || this.ocupado()) return;
    this.ocupado.set(true);
    this.api
      .entregarEnMostrador(pedido.id)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: () => {
          this.paraEntregar.set(null);
          this.datos.update((l) => l.filter((p) => p.pedidoId !== pedido.id));
          this.resumen.update((r) => (r ? { ...r, entregadosHoy: r.entregadosHoy + 1 } : r));
          this.toast.success('Pedido entregado', `#${pedido.numero} se entregó a ${pedido.cliente}.`);
        },
        error: () => this.cargar(true),
      });
  }

  // ---- Entrega fallida y PIN bloqueado ----
  protected abrirAccion(tipo: AccionConMotivo, pedido: PedidoMostrador): void {
    this.errorAccion.set(null);
    this.accion.set({ tipo, pedido });
  }

  protected confirmarAccion(motivo: string): void {
    const actual = this.accion();
    if (!actual || this.ocupado()) return;
    const { tipo, pedido } = actual;
    const peticion =
      tipo === 'cancelar'
        ? this.api.cancelarEntregaFallida(pedido.id, { motivo })
        : this.api.confirmarSinPin(pedido.id, { motivo });
    this.ocupado.set(true);
    peticion.pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: () => {
        this.accion.set(null);
        this.datos.update((l) => l.filter((p) => p.pedidoId !== pedido.id));
        if (tipo === 'cancelar') {
          this.toast.success('Pedido cancelado', `#${pedido.numero} se canceló y se reembolsó al cliente.`);
        } else {
          this.resumen.update((r) => (r ? { ...r, entregadosHoy: r.entregadosHoy + 1 } : r));
          this.toast.success('Entrega confirmada', `#${pedido.numero} quedó entregado sin PIN.`);
        }
      },
      error: (e: unknown) => this.errorAccion.set(mensajeDeError(e, 'No pudimos completar la acción.')),
    });
  }

  protected cerrarAccion(): void {
    if (!this.ocupado()) this.accion.set(null);
  }

  protected desbloquearPin(pedido: PedidoMostrador): void {
    if (this.ocupado()) return;
    this.ocupado.set(true);
    this.api
      .desbloquearPin(pedido.id)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: (actualizado) => {
          this.datos.update((l) => l.map((p) => (p.pedidoId === actualizado.pedidoId ? actualizado : p)));
          this.toast.success('PIN desbloqueado', `${pedido.motorizado ?? 'El motorizado'} ya puede volver a ingresarlo.`);
        },
        error: () => this.cargar(true),
      });
  }

  protected cerrarModales(): void {
    if (this.ocupado()) return;
    this.paraAsignar.set(null);
    this.paraEntregar.set(null);
  }

  private cargar(silencioso: boolean): void {
    const contexto = silencioso ? { context: peticionSilenciosa() } : undefined;
    forkJoin({
      pedidos: this.api.pedidosListos(contexto),
      // El resumen es complementario: si falla, el mostrador sigue funcionando.
      resumen: this.api.resumenDespacho({ context: peticionSilenciosa() }).pipe(
        catchError((error: unknown) => {
          this.sinResumen = esApiException(error) && error.estado === 404;
          return of(null);
        }),
      ),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ pedidos, resumen }) => this.aplicar(pedidos, resumen),
        error: () => this.sinConexion.set(true),
      });
  }

  private aplicar(pedidos: readonly PedidoListoResponse[], resumen: ResumenDespachoResponse | null): void {
    const ahora = Date.now();
    const nuevos = pedidos.filter((p) => !this.vistosEn.has(p.pedidoId) && etapaDe(p) !== 'en-camino');
    for (const p of pedidos) {
      if (!this.vistosEn.has(p.pedidoId)) this.vistosEn.set(p.pedidoId, this.primeraCarga ? 0 : ahora);
    }
    if (!this.primeraCarga && nuevos.length) {
      this.toast.info(
        nuevos.length === 1 ? `#${nuevos[0].numero} llegó al mostrador` : `${nuevos.length} pedidos llegaron al mostrador`,
        'Ya salieron de cocina.',
      );
    }
    for (const p of pedidos.filter((x) => x.estadoEntrega === 'FALLIDA' && !this.fallidasAvisadas.has(x.pedidoId))) {
      this.fallidasAvisadas.add(p.pedidoId);
      if (!this.primeraCarga) this.toast.warning(`#${p.numero} no se pudo entregar`, p.motivoFallo ?? 'Reasígnalo o cancélalo.');
    }
    this.primeraCarga = false;
    this.datos.set(pedidos);
    if (resumen) this.resumen.set(resumen);
    if (resumen) this.sinResumen = false;
    this.backendDesactualizado.set(this.sinResumen || pedidos.some((p) => !('estado' in p)));
    this.sinConexion.set(false);
    this.actualizadoEn.set(new Date(ahora));
    this.ahora.set(ahora);
  }

  private aVista(p: PedidoListoResponse): PedidoMostrador {
    const ahora = this.ahora();
    const delivery = p.tipoEntrega === 'DELIVERY';
    const d = delivery ? p.direccion : null;
    const vence = p.vencimientoRecojo ? new Date(p.vencimientoRecojo).getTime() : null;
    const visto = this.vistosEn.get(p.pedidoId) ?? 0;
    return {
      id: p.pedidoId,
      numero: p.numero,
      etapa: etapaDe(p),
      tipoEntrega: p.tipoEntrega,
      cliente: p.nombreCliente,
      telefono: p.telefonoCliente,
      direccion: d?.direccion ?? null,
      referencia: d ? [d.distrito, d.referencia].filter(Boolean).join(' · ') : null,
      mapa: d ? `https://www.google.com/maps/dir/?api=1&destination=${d.latitud},${d.longitud}` : null,
      distanciaKm: p.distanciaKm ?? null,
      instrucciones: p.instrucciones,
      lineas: (p.items ?? []).map((i) => ({ cantidad: i.cantidad, nombre: i.nombre, descripcion: i.descripcion })),
      totalUnidades: (p.items ?? []).reduce((t, i) => t + i.cantidad, 0) || p.cantidadItems,
      horaListo: formatearHora(p.listoEn),
      minutosListo: minutosDesde(p.listoEn, ahora),
      motorizado: p.motorizadoNombre,
      minutosAsignado: p.asignadaEn ? minutosDesde(p.asignadaEn, ahora) : null,
      minutosParaVencer: vence === null ? null : Math.max(0, Math.ceil((vence - ahora) / 60_000)),
      horaVencimiento: p.vencimientoRecojo ? formatearHora(p.vencimientoRecojo) : null,
      esNuevo: visto > 0 && ahora - visto < RESALTE_NUEVO_MS,
      fallida: p.estadoEntrega === 'FALLIDA',
      motivoFallo: p.motivoFallo ?? null,
      horaFallo: p.fallidaEn ? formatearHora(p.fallidaEn) : null,
      pinBloqueado: p.estadoEntrega === 'EN_CAMINO' && p.intentosRestantesPin === 0,
    };
  }

  protected readonly avisoRecojo = AVISO_RECOJO_MIN;
}

/** Columna de cada pedido según su estado y el de su entrega. Tolera un backend sin `estado`. */
function etapaDe(p: PedidoListoResponse): EtapaMostrador {
  if (p.estado === 'EN_CAMINO' || p.estadoEntrega === 'EN_CAMINO') return 'en-camino';
  if (p.tipoEntrega === 'RECOJO') return 'recojo';
  return p.estadoEntrega === 'ASIGNADA' ? 'asignados' : 'por-asignar';
}

function minutosDesde(iso: string, ahora: number): number {
  return Math.max(0, Math.floor((ahora - new Date(iso).getTime()) / 60_000));
}
