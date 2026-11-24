import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { MostradorService } from '../services/mostrador.service';
import { PedidoListoMostrador } from '../models/mostrador.models';

@Component({
  selector: 'app-mostrador-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mostrador-panel.component.html',
  styleUrls: ['./mostrador-panel.component.scss'],
})
export class MostradorPanelComponent implements OnInit, OnDestroy {
  private readonly mostradorService = inject(MostradorService);
  private readonly router = inject(Router);
  private relojInterval?: ReturnType<typeof setInterval>;

  readonly horaReloj = signal('20:45:32');
  readonly fechaActualTexto = signal('VIERNES, 30 OCT 2026');
  readonly filtroTipo = signal<'TODOS' | 'DELIVERY' | 'RECOJO'>('TODOS');
  readonly pedidos = signal<PedidoListoMostrador[]>([]);
  readonly usandoDatosDemo = signal(false);
  readonly toastMensaje = signal<string | null>(null);

  // Modal de cancelación
  readonly pedidoACancelar = signal<PedidoListoMostrador | null>(null);
  readonly motivoCancelacion = signal('');

  readonly totalDelivery = computed(
    () => this.pedidos().filter((p) => p.tipoEntrega === 'DELIVERY').length
  );
  readonly totalRecojo = computed(
    () => this.pedidos().filter((p) => p.tipoEntrega === 'RECOJO').length
  );

  readonly pedidosFiltrados = computed(() => {
    const filtro = this.filtroTipo();
    if (filtro === 'TODOS') return this.pedidos();
    return this.pedidos().filter((p) => p.tipoEntrega === filtro);
  });

  ngOnInit(): void {
    const actualizar = () => {
      this.horaReloj.set(new Date().toTimeString().slice(0, 8));
    };
    actualizar();
    this.relojInterval = setInterval(actualizar, 1000);
    this.cargarPedidos();
  }

  ngOnDestroy(): void {
    if (this.relojInterval) clearInterval(this.relojInterval);
  }

  cargarPedidos(): void {
    this.mostradorService
      .obtenerPedidosListos()
      .pipe(catchError(() => of(null)))
      .subscribe((data) => {
        if (!data) {
          this.usandoDatosDemo.set(true);
          this.pedidos.set(this.mockPedidosMostrador());
          return;
        }
        this.usandoDatosDemo.set(false);
        this.pedidos.set(data);
      });
  }

  confirmarEntrega(pedido: PedidoListoMostrador): void {
    this.pedidos.update((lista) => lista.filter((p) => p.id !== pedido.id));
    const accion =
      pedido.tipoEntrega === 'DELIVERY'
        ? `Pedido ${pedido.codigo} asignado a reparto.`
        : `Pedido ${pedido.codigo} entregado en mostrador.`;
    this.mostrarToast(accion);

    if (!this.usandoDatosDemo()) {
      this.mostradorService.confirmarDespachoOEntrega(pedido.id).subscribe();
    }
  }

  abrirModalCancelar(pedido: PedidoListoMostrador): void {
    this.pedidoACancelar.set(pedido);
    this.motivoCancelacion.set('');
  }

  confirmarCancelacion(): void {
    const target = this.pedidoACancelar();
    if (!target) return;

    this.pedidos.update((lista) => lista.filter((p) => p.id !== target.id));
    this.pedidoACancelar.set(null);
    this.mostrarToast(`Pedido ${target.codigo} cancelado.`);

    if (!this.usandoDatosDemo()) {
      this.mostradorService
        .cancelarPedido(target.id, this.motivoCancelacion() || 'Cancelado en mostrador')
        .subscribe();
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  private mostrarToast(texto: string): void {
    this.toastMensaje.set(texto);
    setTimeout(() => this.toastMensaje.set(null), 3500);
  }

  private mockPedidosMostrador(): PedidoListoMostrador[] {
    return [
      {
        id: 2842,
        codigo: '#PZ-2842',
        horaListo: '20:29',
        tipoEntrega: 'DELIVERY',
        clienteNombre: 'Lucía Torres',
        clienteTelefono: '987 654 210',
        direccionPrincipal: 'Av. La Paz 620',
        direccionReferencia: 'Miraflores · Edificio Sol',
        productos: [
          { cantidad: 1, nombre: 'Suprema familiar' },
          { cantidad: 1, nombre: 'Gaseosa 1.5 L' },
        ],
      },
      {
        id: 2844,
        codigo: '#PZ-2844',
        horaListo: '20:31',
        tipoEntrega: 'RECOJO',
        clienteNombre: 'Jorge Medina',
        clienteTelefono: '956 321 480',
        direccionPrincipal: 'Recojo en tienda',
        direccionReferencia: 'Mostrador · A nombre de Jorge',
        productos: [{ cantidad: 2, nombre: 'Hawaiana mediana' }],
      },
      {
        id: 2845,
        codigo: '#PZ-2845',
        horaListo: '20:33',
        tipoEntrega: 'DELIVERY',
        clienteNombre: 'Carla Rojas',
        clienteTelefono: '994 820 631',
        direccionPrincipal: 'Calle Berlín 345, dpto. 302',
        direccionReferencia: 'Miraflores · Portería principal',
        productos: [
          { cantidad: 1, nombre: 'Americana familiar' },
          { cantidad: 2, nombre: 'Pan al ajo' },
        ],
      },
      {
        id: 2847,
        codigo: '#PZ-2847',
        horaListo: '20:38',
        tipoEntrega: 'DELIVERY',
        clienteNombre: 'Andrés Vega',
        clienteTelefono: '981 443 205',
        direccionPrincipal: 'Av. Benavides 840',
        direccionReferencia: 'Miraflores · Frente al banco',
        productos: [
          { cantidad: 1, nombre: 'Pepperoni familiar' },
          { cantidad: 1, nombre: 'Pan al ajo' },
        ],
      },
      {
        id: 2848,
        codigo: '#PZ-2848',
        horaListo: '20:39',
        tipoEntrega: 'RECOJO',
        clienteNombre: 'Paola Castillo',
        clienteTelefono: '960 775 182',
        direccionPrincipal: 'Recojo en tienda',
        direccionReferencia: 'Mostrador · A nombre de Paola',
        productos: [
          { cantidad: 1, nombre: 'Suprema familiar' },
          { cantidad: 1, nombre: 'Gaseosa 1.5 L' },
        ],
      },
      {
        id: 2849,
        codigo: '#PZ-2849',
        horaListo: '20:41',
        tipoEntrega: 'RECOJO',
        clienteNombre: 'Miguel Salas',
        clienteTelefono: '977 120 540',
        direccionPrincipal: 'Recojo en tienda',
        direccionReferencia: 'Mostrador · A nombre de Miguel',
        productos: [
          { cantidad: 2, nombre: 'Americana mediana' },
          { cantidad: 1, nombre: 'Pan al ajo' },
        ],
      },
      {
        id: 2850,
        codigo: '#PZ-2850',
        horaListo: '20:43',
        tipoEntrega: 'DELIVERY',
        clienteNombre: 'Valeria Paredes',
        clienteTelefono: '999 603 822',
        direccionPrincipal: 'Calle Schell 275, dpto. 501',
        direccionReferencia: 'Miraflores · Timbre 501',
        productos: [
          { cantidad: 1, nombre: 'Cuatro quesos familiar' },
          { cantidad: 1, nombre: 'Vegetariana mediana' },
        ],
      },
      {
        id: 2851,
        codigo: '#PZ-2851',
        horaListo: '20:44',
        tipoEntrega: 'DELIVERY',
        clienteNombre: 'Renato Flores',
        clienteTelefono: '985 774 090',
        direccionPrincipal: 'Av. 28 de Julio 510',
        direccionReferencia: 'Miraflores · Recepción del hotel',
        productos: [
          { cantidad: 1, nombre: 'Pepperoni mediana' },
          { cantidad: 1, nombre: 'Gaseosa 1.5 L' },
        ],
      },
    ];
  }
}