import { DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ClipboardList, MousePointerClick } from 'lucide-angular';
import type {
  EstadoPedido,
  MetodoPago,
  PedidoResponse,
  PedidoResumenResponse,
  TipoEntrega,
} from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';
import { infoEstado, pedidoCancelable } from '../../../../core/utils/estado-pedido';
import { fechaISO, formatearHora } from '../../../../core/utils/fechas';
import { iniciales } from '../../../../core/utils/roles';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';

const TAMANO_PAGINA = 10;

/** Transiciones que acepta PATCH /admin/pedidos/{id}/estado (PedidoEstadoPolicy del backend). */
const TRANSICIONES: Partial<Record<EstadoPedido, readonly EstadoPedido[]>> = {
  PENDIENTE_PAGO: ['CONFIRMADO'],
  CONFIRMADO: ['EN_PREPARACION', 'EN_HORNO'],
  EN_PREPARACION: ['EN_HORNO'],
  EN_HORNO: ['LISTO'],
  EN_CAMINO: ['ENTREGADO'],
};

const METODOS: Readonly<Record<MetodoPago, string>> = { TARJETA: 'Tarjeta', YAPE: 'Yape', PLIN: 'Plin', CMR: 'CMR' };
const ESTADOS_PAGO: Readonly<Record<string, string>> = {
  APROBADO: 'Pagado',
  PENDIENTE: 'Pendiente',
  RECHAZADO: 'Rechazado',
  REEMBOLSADO: 'Reembolsado',
};

@Component({
  selector: 'app-admin-pedidos',
  imports: [DecimalPipe, NgClass, EstadoVacio],
  templateUrl: './admin-pedidos.component.html',
  styleUrls: ['./admin-pedidos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPedidosComponent {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);

  protected readonly estadosFiltro: readonly EstadoPedido[] = [
    'PENDIENTE_PAGO', 'CONFIRMADO', 'EN_PREPARACION', 'EN_HORNO', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'NO_RECOGIDO',
  ];
  protected readonly estadosLeyenda: readonly EstadoPedido[] = [
    'PENDIENTE_PAGO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO',
  ];
  protected readonly hoy = fechaISO(0);

  // Filtros (texto, fecha y estado van al backend; tipo de entrega filtra la página cargada)
  protected readonly filtroTexto = signal('');
  protected readonly filtroFecha = signal(this.hoy);
  protected readonly filtroEstado = signal<EstadoPedido | ''>('');
  protected readonly filtroTipoEntrega = signal<TipoEntrega | ''>('');

  protected readonly paginaActual = signal(0);
  protected readonly totalElementos = signal(0);
  protected readonly totalPaginas = signal(0);
  protected readonly cargandoLista = signal(true);
  protected readonly pedidos = signal<readonly PedidoResumenResponse[]>([]);

  protected readonly pedidoSeleccionadoId = signal<number | null>(null);
  protected readonly detallePedido = signal<PedidoResponse | null>(null);
  protected readonly cargandoDetalle = signal(false);
  protected readonly menuFilaAbiertoId = signal<number | null>(null);

  protected readonly modalEstadoAbierto = signal(false);
  protected readonly modalCancelarAbierto = signal(false);
  protected readonly nuevoEstado = signal<EstadoPedido | null>(null);
  protected readonly comentarioEstado = signal('');
  protected readonly motivoCancelacion = signal('');
  protected readonly guardando = signal(false);
  protected readonly modalReembolsoAbierto = signal(false);
  protected readonly montoReembolso = signal('');
  protected readonly motivoReembolso = signal('');
  protected readonly IconoPedidos = ClipboardList;
  protected readonly IconoSeleccion = MousePointerClick;

  /** Lo que aún se puede devolver de un pago aprobado (0 si no hay pago o ya se devolvió todo). */
  protected readonly saldoReembolsable = computed(() => {
    const pago = this.detallePedido()?.pago;
    if (!pago || (pago.estado !== 'APROBADO' && pago.estado !== 'REEMBOLSADO')) return 0;
    return Math.max(0, Math.round((pago.monto - (pago.montoReembolsado ?? 0)) * 100) / 100);
  });
  protected readonly montoReembolsoValido = computed(() => {
    const monto = Number(this.montoReembolso());
    return Number.isFinite(monto) && monto > 0 && monto <= this.saldoReembolsable();
  });

  protected readonly pedidosFiltrados = computed(() => {
    const tipo = this.filtroTipoEntrega();
    return tipo ? this.pedidos().filter((p) => p.tipoEntrega === tipo) : this.pedidos();
  });

  protected readonly filaSeleccionada = computed(() => this.pedidos().find((p) => p.id === this.pedidoSeleccionadoId()) ?? null);

  protected readonly transicionesDisponibles = computed<readonly EstadoPedido[]>(() => {
    const det = this.detallePedido();
    if (!det) return [];
    if (det.estado === 'LISTO') return det.tipoEntrega === 'DELIVERY' ? ['EN_CAMINO'] : ['ENTREGADO', 'NO_RECOGIDO'];
    return TRANSICIONES[det.estado] ?? [];
  });

  protected readonly puedeCancelar = computed(() => {
    const det = this.detallePedido();
    return !!det && pedidoCancelable(det.estado);
  });

  protected readonly etiquetaFecha = computed(() => {
    const f = this.filtroFecha();
    if (!f) return 'Últimos 7 días';
    const texto = new Date(`${f}T12:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    return f === this.hoy ? `Hoy, ${texto}` : texto;
  });

  protected readonly paginasVisibles = computed(() => {
    const actual = this.paginaActual() + 1;
    const total = Math.max(this.totalPaginas(), 1);
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 2) return [1, 2, 3];
    if (actual >= total - 1) return [total - 2, total - 1, total];
    return [actual - 1, actual, actual + 1];
  });

  constructor() {
    this.cargarPedidos();
  }

  protected etiquetaEstado(estado: EstadoPedido): string {
    return infoEstado(estado).etiqueta;
  }

  protected etiquetaMetodo(metodo: MetodoPago): string {
    return METODOS[metodo];
  }

  protected etiquetaPago(estado: string): string {
    return ESTADOS_PAGO[estado] ?? estado;
  }

  protected hora(iso: string | null | undefined): string {
    return formatearHora(iso) || 'Pendiente';
  }

  protected minutosDesde(iso: string): number {
    return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  }

  protected inicialesDe(nombre: string): string {
    const [n = '', a = ''] = nombre.split(' ');
    return iniciales(n, a);
  }

  protected valor(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected cargarPedidos(): void {
    const fecha = this.filtroFecha();
    this.cargandoLista.set(true);
    this.api
      .pedidos({
        q: this.filtroTexto().trim() || undefined,
        desde: fecha || fechaISO(-6),
        hasta: fecha || this.hoy,
        estado: this.filtroEstado() || undefined,
        pagina: this.paginaActual(),
        tamano: TAMANO_PAGINA,
      })
      .pipe(finalize(() => this.cargandoLista.set(false)))
      .subscribe((pagina) => {
        this.pedidos.set(pagina.contenido);
        this.totalElementos.set(pagina.totalElementos);
        this.totalPaginas.set(pagina.totalPaginas);
        const seleccionado = pagina.contenido.find((p) => p.id === this.pedidoSeleccionadoId()) ?? pagina.contenido[0];
        if (seleccionado) this.seleccionarPedido(seleccionado);
        else {
          this.pedidoSeleccionadoId.set(null);
          this.detallePedido.set(null);
        }
      });
  }

  protected aplicarFiltros(): void {
    this.paginaActual.set(0);
    this.cargarPedidos();
  }

  protected filtrarPorEstado(estado: EstadoPedido | ''): void {
    this.filtroEstado.set(estado);
    this.aplicarFiltros();
  }

  protected limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroFecha.set(this.hoy);
    this.filtroEstado.set('');
    this.filtroTipoEntrega.set('');
    this.aplicarFiltros();
  }

  protected irAPagina(numero: number): void {
    const indice = numero - 1;
    if (indice < 0 || indice >= this.totalPaginas() || indice === this.paginaActual()) return;
    this.paginaActual.set(indice);
    this.cargarPedidos();
  }

  protected seleccionarPedido(fila: PedidoResumenResponse): void {
    this.pedidoSeleccionadoId.set(fila.id);
    this.menuFilaAbiertoId.set(null);
    this.cargandoDetalle.set(true);
    this.api
      .pedido(fila.id)
      .pipe(finalize(() => this.cargandoDetalle.set(false)))
      .subscribe((det) => {
        if (this.pedidoSeleccionadoId() === det.id) this.detallePedido.set(det);
      });
  }

  protected alternarMenuFila(id: number, evento: Event): void {
    evento.stopPropagation();
    this.menuFilaAbiertoId.update((actual) => (actual === id ? null : id));
  }

  protected abrirModalCambioEstado(): void {
    const opciones = this.transicionesDisponibles();
    if (!opciones.length) {
      this.toast.info('Sin cambios posibles', 'Este pedido ya está en un estado final o lo mueve la operación.');
      return;
    }
    this.nuevoEstado.set(opciones[0]);
    this.comentarioEstado.set('');
    this.modalEstadoAbierto.set(true);
  }

  protected abrirModalCancelar(): void {
    this.motivoCancelacion.set('');
    this.modalCancelarAbierto.set(true);
  }

  protected confirmarCambioEstado(): void {
    const det = this.detallePedido();
    const estado = this.nuevoEstado();
    if (!det || !estado || this.guardando()) return;
    this.guardando.set(true);
    this.api
      .cambiarEstadoPedido(det.id, { estado, comentario: this.comentarioEstado().trim() || null })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe((actualizado) => {
        this.aplicarActualizacion(actualizado);
        this.modalEstadoAbierto.set(false);
        this.toast.success('Estado actualizado', `#${actualizado.numero} pasó a ${this.etiquetaEstado(actualizado.estado)}.`);
      });
  }

  protected confirmarCancelacion(): void {
    const det = this.detallePedido();
    const motivo = this.motivoCancelacion().trim();
    if (!det || !motivo || this.guardando()) return;
    this.guardando.set(true);
    this.api
      .cancelarPedido(det.id, motivo)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe((actualizado) => {
        this.aplicarActualizacion(actualizado);
        this.modalCancelarAbierto.set(false);
        this.toast.success('Pedido cancelado', `#${actualizado.numero} se canceló y el pago se reembolsa.`);
      });
  }

  protected abrirModalReembolso(): void {
    this.montoReembolso.set(this.saldoReembolsable().toFixed(2));
    this.motivoReembolso.set('');
    this.modalReembolsoAbierto.set(true);
  }

  protected confirmarReembolso(): void {
    const det = this.detallePedido();
    const motivo = this.motivoReembolso().trim();
    if (!det || !motivo || !this.montoReembolsoValido() || this.guardando()) return;
    const monto = Math.round(Number(this.montoReembolso()) * 100) / 100;
    this.guardando.set(true);
    this.api
      .reembolsar(det.id, { monto, motivo })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe((pago) => {
        this.detallePedido.update((d) => (d && d.id === det.id ? { ...d, pago } : d));
        this.modalReembolsoAbierto.set(false);
        this.toast.success('Reembolso registrado', `S/ ${monto.toFixed(2)} devueltos del pedido #${det.numero}.`);
      });
  }

  protected imprimirTicket(): void {
    window.print();
  }

  private aplicarActualizacion(actualizado: PedidoResponse): void {
    this.detallePedido.set(actualizado);
    this.pedidos.update((lista) => lista.map((p) => (p.id === actualizado.id ? { ...p, estado: actualizado.estado } : p)));
  }
}
