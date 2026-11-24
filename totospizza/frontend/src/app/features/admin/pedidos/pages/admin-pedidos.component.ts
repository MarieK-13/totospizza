import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AdminPedidosService } from '../services/admin-pedidos.service';
import {
  ApiError,
  EstadoPedido,
  MetodoPago,
  PedidoResponse,
  PedidoResumenResponse,
  TipoEntrega,
} from '../models/admin-pedidos.models';

export interface PedidoFilaUI extends PedidoResumenResponse {
  // Campos visuales presentes en el mockup (no vienen en PedidoResumenResponse del backend)
  clienteNombre?: string;
  clienteTelefono?: string;
  resumenProductos?: string;
  metodoPago?: MetodoPago;
}

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pedidos.component.html',
  styleUrls: ['./admin-pedidos.component.scss'],
})
export class AdminPedidosComponent implements OnInit {
  private readonly pedidosService = inject(AdminPedidosService);
  private readonly router = inject(Router);

  // Usuario y cabecera
  readonly usuario = signal({
    nombres: 'Andrea',
    apellidos: 'Mendoza',
    rolEtiqueta: 'Administradora',
    iniciales: 'AM',
  });
  readonly fechaHoraActual = signal('Vie, 02 oct · 14:32');
  readonly notificacionesNoLeidas = signal(2);

  // Filtros
  readonly filtroTexto = signal('');
  readonly filtroFecha = signal(this.obtenerFechaHoyISO());
  readonly filtroEstado = signal<EstadoPedido | ''>('');
  readonly filtroTipoEntrega = signal<TipoEntrega | ''>('');
  readonly filtroMetodoPago = signal<MetodoPago | ''>('');

  // Paginación (PageResponse<T>)
  readonly paginaActual = signal(0);
  readonly tamanoPagina = signal(6);
  readonly totalElementos = signal(148);
  readonly totalPaginas = signal(25);

  // Listado y selección
  readonly cargandoLista = signal(false);
  readonly usandoDatosDemo = signal(false);
  readonly pedidos = signal<PedidoFilaUI[]>([]);
  readonly pedidoSeleccionadoId = signal<number | null>(null);
  readonly detallePedido = signal<PedidoResponse | null>(null);
  readonly detalleClienteExtra = signal<{ nombre: string; telefono: string; iniciales: string } | null>(null);

  // Modales y menús
  readonly menuFilaAbiertoId = signal<number | null>(null);
  readonly modalEstadoAbierto = signal(false);
  readonly modalCancelarAbierto = signal(false);
  readonly modalInfoNuevoPedido = signal(false);
  readonly toastMensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  readonly nuevoEstadoSeleccionado = signal<EstadoPedido>('EN_HORNO');
  readonly comentarioEstado = signal('');
  readonly motivoCancelacion = signal('');

  // Filtrado en cliente para tipoEntrega y metodoPago (no existen como query params en GET /admin/pedidos)
  readonly pedidosFiltrados = computed(() => {
    let lista = this.pedidos();
    const tipo = this.filtroTipoEntrega();
    const pago = this.filtroMetodoPago();

    if (tipo) {
      lista = lista.filter((p) => p.tipoEntrega === tipo);
    }
    if (pago) {
      lista = lista.filter((p) => p.metodoPago === pago);
    }
    return lista;
  });

  // Transiciones permitidas según reglas de negocio del contrato
  readonly transicionesDisponibles = computed<EstadoPedido[]>(() => {
    const det = this.detallePedido();
    if (!det) return [];

    switch (det.estado) {
      case 'PENDIENTE_PAGO':
        return ['CONFIRMADO', 'CANCELADO'];
      case 'CONFIRMADO':
        return ['EN_PREPARACION', 'EN_HORNO', 'CANCELADO'];
      case 'EN_PREPARACION':
        return ['EN_HORNO'];
      case 'EN_HORNO':
        return ['LISTO'];
      case 'LISTO':
        return det.tipoEntrega === 'DELIVERY' ? ['EN_CAMINO'] : ['ENTREGADO', 'NO_RECOGIDO'];
      case 'EN_CAMINO':
        return ['ENTREGADO'];
      default:
        return [];
    }
  });

  readonly puedeCancelarPedido = computed(() => {
    const estado = this.detallePedido()?.estado;
    return estado === 'PENDIENTE_PAGO' || estado === 'CONFIRMADO';
  });

  readonly paginasVisibles = computed(() => {
    const actual = this.paginaActual() + 1;
    const total = Math.max(this.totalPaginas(), 1);
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 2) return [1, 2, 3];
    if (actual >= total - 1) return [total - 2, total - 1, total];
    return [actual - 1, actual, actual + 1];
  });

  ngOnInit(): void {
    this.cargarPedidos();
  }

  navegarA(ruta: 'resumen' | 'pedidos' | 'empleados' | 'finanzas' | 'configuracion'): void {
    if (ruta === 'resumen') {
      this.router.navigate(['/admin/resumen']);
    } else if (ruta === 'pedidos') {
      this.router.navigate(['/admin/pedidos']);
      } else if (ruta === 'empleados') {
      this.router.navigate(['/admin/empleados']);
      } else if (ruta === 'finanzas') {
      this.router.navigate(['/admin/finanzas']);
      } else if (ruta === 'configuracion') {
      this.router.navigate(['/admin/configuracion']);
    } else {
      this.mostrarToast('ok', `Módulo "${ruta}" listo para conectar cuando envíes su vista.`);
    }
  }

  cargarPedidos(): void {
    this.cargandoLista.set(true);

    this.pedidosService
      .listarPedidos({
        texto: this.filtroTexto() || undefined,
        desde: this.filtroFecha() || undefined,
        hasta: this.filtroFecha() || undefined,
        estado: this.filtroEstado() || undefined,
        pagina: this.paginaActual(),
        tamano: this.tamanoPagina(),
      })
      .pipe(catchError(() => of(null)))
      .subscribe((resp) => {
        this.cargandoLista.set(false);

        if (!resp) {
          this.cargarFallbackMockup();
          return;
        }

        this.usandoDatosDemo.set(false);
        this.pedidos.set(resp.contenido);
        this.totalElementos.set(resp.totalElementos);
        this.totalPaginas.set(resp.totalPaginas);

        if (resp.contenido.length > 0) {
          const primero = resp.contenido[0];
          this.seleccionarPedido(primero);
        } else {
          this.pedidoSeleccionadoId.set(null);
          this.detallePedido.set(null);
        }
      });
  }

  aplicarFiltros(): void {
    this.paginaActual.set(0);
    if (this.usandoDatosDemo()) {
      this.filtrarMockupLocal();
      return;
    }
    this.cargarPedidos();
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroFecha.set(this.obtenerFechaHoyISO());
    this.filtroEstado.set('');
    this.filtroTipoEntrega.set('');
    this.filtroMetodoPago.set('');
    this.paginaActual.set(0);
    this.cargarPedidos();
  }

  irAPagina(pagina1Based: number): void {
    const idx = pagina1Based - 1;
    if (idx < 0 || idx >= this.totalPaginas()) return;
    this.paginaActual.set(idx);
    if (!this.usandoDatosDemo()) {
      this.cargarPedidos();
    }
  }

  seleccionarPedido(fila: PedidoFilaUI): void {
    this.pedidoSeleccionadoId.set(fila.id);
    this.menuFilaAbiertoId.set(null);

    if (this.usandoDatosDemo()) {
      this.cargarDetalleMockup(fila);
      return;
    }

    this.detalleClienteExtra.set(null);
    this.pedidosService.obtenerDetallePedido(fila.id).subscribe({
      next: (det) => this.detallePedido.set(det),
      error: (err) => this.manejarErrorApi(err),
    });
  }

  abrirModalCambioEstado(): void {
    const transiciones = this.transicionesDisponibles();
    if (transiciones.length === 0) {
      this.mostrarToast('error', 'Este pedido ya se encuentra en un estado final.');
      return;
    }
    this.nuevoEstadoSeleccionado.set(transiciones[0]);
    this.comentarioEstado.set('');
    this.modalEstadoAbierto.set(true);
  }

  confirmarCambioEstado(): void {
    const det = this.detallePedido();
    const destino = this.nuevoEstadoSeleccionado();
    if (!det) return;

    if (destino === 'CANCELADO') {
      this.modalEstadoAbierto.set(false);
      this.motivoCancelacion.set(this.comentarioEstado());
      this.modalCancelarAbierto.set(true);
      return;
    }

    if (this.usandoDatosDemo()) {
      this.actualizarEstadoEnDemo(det.id, destino, this.comentarioEstado());
      this.modalEstadoAbierto.set(false);
      return;
    }

    this.pedidosService
      .cambiarEstado(det.id, {
        estado: destino,
        comentario: this.comentarioEstado().trim() || undefined,
      })
      .subscribe({
        next: (actualizado) => {
          this.detallePedido.set(actualizado);
          this.pedidos.update((list) =>
            list.map((p) => (p.id === actualizado.id ? { ...p, estado: actualizado.estado } : p))
          );
          this.modalEstadoAbierto.set(false);
          this.mostrarToast('ok', `Pedido ${actualizado.numero} actualizado a ${this.etiquetaEstado(actualizado.estado)}.`);
        },
        error: (err) => this.manejarErrorApi(err),
      });
  }

  confirmarCancelacion(): void {
    const det = this.detallePedido();
    const motivo = this.motivoCancelacion().trim();
    if (!det || !motivo) return;

    if (this.usandoDatosDemo()) {
      this.actualizarEstadoEnDemo(det.id, 'CANCELADO', motivo);
      this.modalCancelarAbierto.set(false);
      return;
    }

    this.pedidosService.cancelarPedido(det.id, { motivo }).subscribe({
      next: (actualizado) => {
        this.detallePedido.set(actualizado);
        this.pedidos.update((list) =>
          list.map((p) => (p.id === actualizado.id ? { ...p, estado: actualizado.estado } : p))
        );
        this.modalCancelarAbierto.set(false);
        this.mostrarToast('ok', `Pedido ${actualizado.numero} cancelado y reembolso gestionado.`);
      },
      error: (err) => this.manejarErrorApi(err),
    });
  }

  imprimirTicket(): void {
    window.print();
  }

  toggleMenuFila(id: number, event: Event): void {
    event.stopPropagation();
    this.menuFilaAbiertoId.update((prev) => (prev === id ? null : id));
  }

  etiquetaEstado(estado: EstadoPedido): string {
    const mapa: Record<EstadoPedido, string> = {
      PENDIENTE_PAGO: 'Pendiente',
      CONFIRMADO: 'Confirmado',
      EN_PREPARACION: 'En preparación',
      EN_HORNO: 'En el horno',
      LISTO: 'Listo',
      EN_CAMINO: 'En camino',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
      NO_RECOGIDO: 'No recogido',
    };
    return mapa[estado] ?? estado;
  }

  etiquetaMetodoPago(metodo?: MetodoPago | null): string {
    if (!metodo) return '—';
    const mapa: Record<MetodoPago, string> = {
      TARJETA: 'Tarjeta',
      YAPE: 'Yape',
      PLIN: 'Plin',
      CMR: 'CMR',
    };
    return mapa[metodo];
  }

  formatearHora(iso?: string | null): string {
    if (!iso) return 'Pendiente';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  minutosTranscurridos(iso?: string): number {
    if (!iso) return 8;
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    return diff > 0 && diff < 1440 ? diff : 8;
  }

  private manejarErrorApi(err: { error?: ApiError }): void {
    const msg = err?.error?.mensaje ?? 'Error al procesar la operación con el servidor.';
    this.mostrarToast('error', msg);
  }

  mostrarToast(tipo: 'ok' | 'error', texto: string): void {
    this.toastMensaje.set({ tipo, texto });
    setTimeout(() => this.toastMensaje.set(null), 4000);
  }

  private obtenerFechaHoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ==================== DATOS DEMO IDÉNTICOS A LA IMAGEN ====================
  private readonly mockInicial: PedidoFilaUI[] = [
    {
      id: 1048,
      numero: '#1048',
      tipoEntrega: 'DELIVERY',
      estado: 'EN_PREPARACION',
      total: 98.5,
      cantidadItems: 3,
      creadoEn: '2026-10-02T14:24:00Z',
      clienteNombre: 'Lucia Ramos',
      clienteTelefono: '+51 987 452 031',
      resumenProductos: '2 pizzas · 1 bebida',
      metodoPago: 'YAPE',
    },
    {
      id: 1047,
      numero: '#1047',
      tipoEntrega: 'RECOJO',
      estado: 'CONFIRMADO',
      total: 54.0,
      cantidadItems: 1,
      creadoEn: '2026-10-02T14:18:00Z',
      clienteNombre: 'Martín León',
      clienteTelefono: '+51 945 112 890',
      resumenProductos: '1 pizza familiar',
      metodoPago: 'TARJETA',
    },
    {
      id: 1046,
      numero: '#1046',
      tipoEntrega: 'DELIVERY',
      estado: 'EN_CAMINO',
      total: 142.9,
      cantidadItems: 5,
      creadoEn: '2026-10-02T14:05:00Z',
      clienteNombre: 'Paola Vega',
      clienteTelefono: '+51 912 334 556',
      resumenProductos: '3 pizzas · 2 bebidas',
      metodoPago: 'TARJETA',
    },
    {
      id: 1045,
      numero: '#1045',
      tipoEntrega: 'RECOJO',
      estado: 'LISTO',
      total: 49.9,
      cantidadItems: 2,
      creadoEn: '2026-10-02T13:58:00Z',
      clienteNombre: 'Diego Ponce',
      clienteTelefono: '+51 998 776 112',
      resumenProductos: '1 pizza · 1 postre',
      metodoPago: 'PLIN',
    },
    {
      id: 1044,
      numero: '#1044',
      tipoEntrega: 'DELIVERY',
      estado: 'ENTREGADO',
      total: 83.0,
      cantidadItems: 2,
      creadoEn: '2026-10-02T13:42:00Z',
      clienteNombre: 'Ana Torres',
      clienteTelefono: '+51 966 881 204',
      resumenProductos: '2 pizzas medianas',
      metodoPago: 'YAPE',
    },
    {
      id: 1043,
      numero: '#1043',
      tipoEntrega: 'DELIVERY',
      estado: 'CANCELADO',
      total: 31.0,
      cantidadItems: 1,
      creadoEn: '2026-10-02T13:30:00Z',
      clienteNombre: 'Jorge Ruiz',
      clienteTelefono: '+51 954 009 321',
      resumenProductos: '1 pizza personal',
      metodoPago: 'TARJETA',
    },
  ];

  private cargarFallbackMockup(): void {
    this.usandoDatosDemo.set(true);
    this.pedidos.set(this.mockInicial);
    this.totalElementos.set(148);
    this.totalPaginas.set(25);
    this.seleccionarPedido(this.mockInicial[0]);
  }

  private filtrarMockupLocal(): void {
    const q = this.filtroTexto().toLowerCase().trim();
    const est = this.filtroEstado();
    const filtrados = this.mockInicial.filter((p) => {
      const matchTexto =
        !q ||
        p.numero.toLowerCase().includes(q) ||
        (p.clienteNombre?.toLowerCase().includes(q) ?? false);
      const matchEstado = !est || p.estado === est;
      return matchTexto && matchEstado;
    });
    this.pedidos.set(filtrados);
    if (filtrados.length) this.seleccionarPedido(filtrados[0]);
  }

  private cargarDetalleMockup(fila: PedidoFilaUI): void {
    const partes = (fila.clienteNombre ?? 'Cliente Toto').split(' ');
    const iniciales = `${partes[0]?.[0] ?? 'C'}${partes[1]?.[0] ?? 'T'}`.toUpperCase();

    this.detalleClienteExtra.set({
      nombre: fila.clienteNombre ?? 'Lucia Ramos',
      telefono: fila.clienteTelefono ?? '+51 987 452 031',
      iniciales,
    });

    const es1048 = fila.id === 1048;
    const subtotal = es1048 ? 90.5 : fila.tipoEntrega === 'DELIVERY' ? fila.total - 8 : fila.total;
    const costoDelivery = fila.tipoEntrega === 'DELIVERY' ? 8.0 : 0;

    this.detallePedido.set({
      id: fila.id,
      numero: fila.numero,
      sucursalNombre: 'Sede Miraflores',
      tipoEntrega: fila.tipoEntrega,
      estado: fila.estado,
      direccionEntrega:
        fila.tipoEntrega === 'DELIVERY'
          ? {
              direccion: 'Av. Pardo 1120, Dpto. 504, Miraflores',
              referencia: null,
              distrito: 'Miraflores',
              latitud: -12.119,
              longitud: -77.034,
            }
          : null,
      instrucciones: null,
      detalles: es1048
        ? [
            {
              id: 1,
              nombre: 'Americana familiar',
              descripcion: 'Masa delgada · extra queso',
              cantidad: 1,
              precioUnitario: 54.0,
              subtotal: 54.0,
              notas: null,
              adicionales: [],
            },
            {
              id: 2,
              nombre: 'Pepperoni mediana',
              descripcion: 'Masa clásica',
              cantidad: 1,
              precioUnitario: 36.5,
              subtotal: 36.5,
              notas: null,
              adicionales: [],
            },
          ]
        : [
            {
              id: 3,
              nombre: fila.resumenProductos ?? 'Pedido artesanal',
              descripcion: 'Masa artesanal',
              cantidad: fila.cantidadItems,
              precioUnitario: subtotal,
              subtotal,
              notas: null,
              adicionales: [],
            },
          ],
      montos: {
        subtotal,
        costoDelivery,
        descuento: 0,
        total: fila.total,
        envioGratisDesde: 49,
        faltanteEnvioGratis: 0,
      },
      minutosEstimados: 24,
      creadoEn: '2026-10-02T14:24:00Z',
      confirmadoEn: '2026-10-02T14:25:00Z',
      entregadoEn: fila.estado === 'ENTREGADO' ? '2026-10-02T14:48:00Z' : null,
      vencimientoRecojo: null,
      garantiaAplicada: false,
      pago: {
        id: 501,
        metodo: fila.metodoPago ?? 'YAPE',
        estado: fila.estado === 'CANCELADO' ? 'REEMBOLSADO' : 'APROBADO',
        monto: fila.total,
        marcaTarjeta: null,
        ultimosDigitos: null,
        pagadoEn: '2026-10-02T14:25:00Z',
        montoReembolsado: fila.estado === 'CANCELADO' ? fila.total : null,
      },
      historial: [
        { estado: 'PENDIENTE_PAGO', comentario: 'Pedido recibido', fecha: '2026-10-02T14:24:00Z' },
        { estado: 'CONFIRMADO', comentario: 'Pago confirmado', fecha: '2026-10-02T14:25:00Z' },
        { estado: 'EN_PREPARACION', comentario: 'En preparación', fecha: '2026-10-02T14:31:00Z' },
      ],
    });
  }

  private actualizarEstadoEnDemo(id: number, estado: EstadoPedido, comentario?: string): void {
    this.pedidos.update((list) => list.map((p) => (p.id === id ? { ...p, estado } : p)));
    this.detallePedido.update((det) => {
      if (!det || det.id !== id) return det;
      return {
        ...det,
        estado,
        historial: [
          ...det.historial,
          {
            estado,
            comentario: comentario || this.etiquetaEstado(estado),
            fecha: new Date().toISOString(),
          },
        ],
      };
    });
    this.mostrarToast('ok', `Estado actualizado a ${this.etiquetaEstado(estado)}.`);
  }
}