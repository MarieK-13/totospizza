import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { RepartoService } from '../services/reparto.service';
import { EntregaAsignada } from '../models/reparto.models';

@Component({
  selector: 'app-reparto-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reparto-panel.component.html',
  styleUrls: ['./reparto-panel.component.scss'],
})
export class RepartoPanelComponent implements OnInit, OnDestroy {
  private readonly repartoService = inject(RepartoService);
  private readonly router = inject(Router);
  private relojInterval?: ReturnType<typeof setInterval>;

  readonly motorizadoNombre = signal('Diego Ramírez');
  readonly zonaAsignada = signal('Zona Miraflores');
  readonly horaReloj = signal('20:45:32');
  readonly fechaActualTexto = signal('VIERNES, 30 OCT 2026');
  readonly entregas = signal<EntregaAsignada[]>([]);
  readonly usandoDatosDemo = signal(false);
  readonly toastMensaje = signal<string | null>(null);

  readonly totalAsignadas = computed(() => this.entregas().length);
  readonly totalEnCamino = computed(
    () => this.entregas().filter((e) => e.estado === 'EN_CAMINO').length
  );
  readonly totalPorSalir = computed(
    () => this.entregas().filter((e) => e.estado === 'PENDIENTE_SALIDA').length
  );
  readonly entregaActivaEnCamino = computed(() =>
    this.entregas().find((e) => e.estado === 'EN_CAMINO') ?? null
  );

  ngOnInit(): void {
    const actualizar = () => {
      this.horaReloj.set(new Date().toTimeString().slice(0, 8));
    };
    actualizar();
    this.relojInterval = setInterval(actualizar, 1000);
    this.cargarEntregas();
  }

  ngOnDestroy(): void {
    if (this.relojInterval) clearInterval(this.relojInterval);
  }

  cargarEntregas(): void {
    this.repartoService
      .obtenerMisEntregas()
      .pipe(catchError(() => of(null)))
      .subscribe((data) => {
        if (!data) {
          this.usandoDatosDemo.set(true);
          this.entregas.set(this.mockEntregas());
          return;
        }
        this.usandoDatosDemo.set(false);
        this.entregas.set(data);
      });
  }

  salirAReparto(entrega: EntregaAsignada): void {
    if (this.entregaActivaEnCamino()) {
      this.mostrarToast(
        `Completa primero el pedido ${this.entregaActivaEnCamino()!.codigoPedido} antes de iniciar otro reparto.`
      );
      return;
    }

    const horaSalida = new Date().toTimeString().slice(0, 5);
    this.entregas.update((lista) =>
      lista.map((e) =>
        e.id === entrega.id
          ? {
              ...e,
              estado: 'EN_CAMINO',
              horaInfoSuperior: `Salida de tienda · ${horaSalida}`,
            }
          : e
      )
    );
    this.mostrarToast(`Ruta iniciada para ${entrega.codigoPedido}.`);

    if (!this.usandoDatosDemo()) {
      this.repartoService.iniciarReparto(entrega.id).subscribe();
    }
  }

  marcarEntregado(entrega: EntregaAsignada): void {
    this.entregas.update((lista) => lista.filter((e) => e.id !== entrega.id));
    this.mostrarToast(`Pedido ${entrega.codigoPedido} marcado como entregado.`);

    if (!this.usandoDatosDemo()) {
      this.repartoService.marcarEntregado(entrega.id).subscribe();
    }
  }

  cancelarEntrega(entrega: EntregaAsignada): void {
    this.entregas.update((lista) => lista.filter((e) => e.id !== entrega.id));
    this.mostrarToast(`Entrega ${entrega.codigoPedido} marcada como cancelada.`);

    if (!this.usandoDatosDemo()) {
      this.repartoService.cancelarEntrega(entrega.id).subscribe();
    }
  }

  llamarCliente(entrega: EntregaAsignada): void {
    this.mostrarToast(`Llamando a ${entrega.clienteNombre} (${entrega.clienteTelefono})...`);
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  private mostrarToast(texto: string): void {
    this.toastMensaje.set(texto);
    setTimeout(() => this.toastMensaje.set(null), 3500);
  }

  private mockEntregas(): EntregaAsignada[] {
    return [
      {
        id: 2840,
        ordenNumero: 'ORDEN 01',
        codigoPedido: '#PZ-2840',
        estado: 'EN_CAMINO',
        horaInfoSuperior: 'Salida de tienda · 20:35',
        clienteNombre: 'Mariana López',
        clienteTelefono: '997 412 830',
        direccion: 'Av. José Larco 812, dpto. 402 · Miraflores',
        referencia: 'Edificio de puerta negra, junto a la farmacia. Timbre 402.',
        productos: [
          { cantidad: 1, nombre: 'Pepperoni familiar' },
          { cantidad: 1, nombre: 'Pan al ajo' },
          { cantidad: 1, nombre: 'Gaseosa 1.5 L' },
        ],
        metodoPagoTexto: 'Pago online · Pagado',
        callePrincipalMapa: 'Av. José Larco',
        calleSecundariaMapa: 'Calle San Martín',
        distanciaKm: 1.8,
      },
      {
        id: 2843,
        ordenNumero: 'ORDEN 02',
        codigoPedido: '#PZ-2843',
        estado: 'PENDIENTE_SALIDA',
        horaInfoSuperior: 'Retirar en mostrador',
        clienteNombre: 'Sebastián Ruiz',
        clienteTelefono: '958 806 214',
        direccion: 'Calle Alcanfores 465 · Miraflores',
        referencia: 'Casa con reja blanca, frente al parque. Tocar el timbre.',
        productos: [
          { cantidad: 2, nombre: 'Americana mediana' },
          { cantidad: 1, nombre: 'Gaseosa 1.5 L' },
        ],
        metodoPagoTexto: 'Pago online · Pagado',
        callePrincipalMapa: 'Calle Alcanfores',
        calleSecundariaMapa: 'Calle Schell',
        distanciaKm: 2.4,
      },
      {
        id: 2846,
        ordenNumero: 'ORDEN 03',
        codigoPedido: '#PZ-2846',
        estado: 'PENDIENTE_SALIDA',
        horaInfoSuperior: 'Retirar en mostrador',
        clienteNombre: 'Daniela Campos',
        clienteTelefono: '990 321 574',
        direccion: 'Av. Reducto 1180, dpto. 203 · Miraflores',
        referencia: 'Torre B, ingreso por recepción. Dejar con la cliente.',
        productos: [
          { cantidad: 1, nombre: 'Cuatro quesos familiar' },
          { cantidad: 1, nombre: 'Hawaiana mediana' },
        ],
        metodoPagoTexto: 'Pago online · Pagado',
        callePrincipalMapa: 'Av. Reducto',
        calleSecundariaMapa: 'Av. 28 de Julio',
        distanciaKm: 3.1,
      },
    ];
  }
}