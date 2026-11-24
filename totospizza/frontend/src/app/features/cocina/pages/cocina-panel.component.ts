import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CocinaService } from '../services/cocina.service';
import { PedidoCocina } from '../models/cocina.models';

@Component({
  selector: 'app-cocina-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocina-panel.component.html',
  styleUrls: ['./cocina-panel.component.scss'],
})
export class CocinaPanelComponent implements OnInit, OnDestroy {
  private readonly cocinaService = inject(CocinaService);
  private readonly router = inject(Router);
  private relojInterval?: ReturnType<typeof setInterval>;

  readonly horaReloj = signal('20:45:32');
  readonly fechaActualTexto = signal('VIERNES, 30 OCT 2026');
  readonly pedidos = signal<PedidoCocina[]>([]);
  readonly toastMensaje = signal<string | null>(null);
  readonly usandoDatosDemo = signal(false);

  readonly pendientes = computed(() =>
    this.pedidos().filter((p) => p.etapa === 'PENDIENTE')
  );
  readonly enHorno = computed(() =>
    this.pedidos().filter((p) => p.etapa === 'EN_HORNO')
  );
  readonly listas = computed(() =>
    this.pedidos().filter((p) => p.etapa === 'LISTA')
  );
  readonly totalEnCocina = computed(() => this.pedidos().length);

  ngOnInit(): void {
    this.iniciarRelojEnVivo();
    this.cargarPedidos();
  }

  ngOnDestroy(): void {
    if (this.relojInterval) clearInterval(this.relojInterval);
  }

  cargarPedidos(): void {
    this.cocinaService
      .obtenerPedidosCocina()
      .pipe(catchError(() => of(null)))
      .subscribe((data) => {
        if (!data) {
          this.usandoDatosDemo.set(true);
          this.pedidos.set(this.mockPedidosCocina());
          return;
        }
        this.usandoDatosDemo.set(false);
        this.pedidos.set(data);
      });
  }

  meterAlHorno(pedido: PedidoCocina): void {
    this.pedidos.update((lista) =>
      lista.map((p) =>
        p.id === pedido.id
          ? { ...p, etapa: 'EN_HORNO', minutosEnHorno: 1, tiempoObjetivoMin: 10 }
          : p
      )
    );
    this.mostrarToast(`Pedido ${pedido.codigo} ingresado al horno.`);

    if (!this.usandoDatosDemo()) {
      this.cocinaService.cambiarEtapaPedido(pedido.id, 'EN_HORNO').subscribe();
    }
  }

  marcarComoListo(pedido: PedidoCocina): void {
    const ahora = new Date();
    const horaFin = `${String(ahora.getHours()).padStart(2, '0')}:${String(
      ahora.getMinutes()
    ).padStart(2, '0')}`;

    this.pedidos.update((lista) =>
      lista.map((p) =>
        p.id === pedido.id
          ? {
              ...p,
              etapa: 'LISTA',
              horaFinalizado: horaFin,
              minutosDesdeListo: 0,
            }
          : p
      )
    );
    this.mostrarToast(`Pedido ${pedido.codigo} listo y enviado a Mostrador.`);

    if (!this.usandoDatosDemo()) {
      this.cocinaService.cambiarEtapaPedido(pedido.id, 'LISTA').subscribe();
    }
  }

  calcularProgresoHorno(pedido: PedidoCocina): number {
    return Math.min(100, Math.round((pedido.minutosEnHorno / pedido.tiempoObjetivoMin) * 100));
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  private iniciarRelojEnVivo(): void {
    const actualizar = () => {
      const now = new Date();
      this.horaReloj.set(now.toTimeString().slice(0, 8));
    };
    actualizar();
    this.relojInterval = setInterval(actualizar, 1000);
  }

  private mostrarToast(texto: string): void {
    this.toastMensaje.set(texto);
    setTimeout(() => this.toastMensaje.set(null), 3500);
  }

  private mockPedidosCocina(): PedidoCocina[] {
    return [
      {
        id: 2852,
        codigo: '#PZ-2852',
        tipoEntrega: 'DELIVERY',
        etapa: 'PENDIENTE',
        horaIngreso: '20:34',
        minutosEspera: 11,
        minutosEnHorno: 0,
        tiempoObjetivoMin: 10,
        productos: [
          { cantidad: 2, nombre: 'Pepperoni familiar' },
          { cantidad: 1, nombre: 'Pan al ajo' },
        ],
        notaEspecial: 'Sin aceitunas en una pizza',
      },
      {
        id: 2858,
        codigo: '#PZ-2858',
        tipoEntrega: 'RECOJO',
        etapa: 'PENDIENTE',
        horaIngreso: '20:40',
        minutosEspera: 5,
        minutosEnHorno: 0,
        tiempoObjetivoMin: 10,
        productos: [
          { cantidad: 1, nombre: 'Americana familiar' },
          { cantidad: 1, nombre: 'Hawaiana mediana' },
        ],
        notaEspecial: 'Cortar en 8 porciones',
      },
      {
        id: 2859,
        codigo: '#PZ-2859',
        tipoEntrega: 'DELIVERY',
        etapa: 'PENDIENTE',
        horaIngreso: '20:42',
        minutosEspera: 3,
        minutosEnHorno: 0,
        tiempoObjetivoMin: 10,
        productos: [
          { cantidad: 1, nombre: 'Vegetariana familiar' },
          { cantidad: 2, nombre: 'Pan al ajo' },
        ],
        notaEspecial: 'Sin champiñones',
      },
      {
        id: 2853,
        codigo: '#PZ-2853',
        tipoEntrega: 'DELIVERY',
        etapa: 'EN_HORNO',
        horaIngreso: '20:33',
        minutosEspera: 0,
        minutosEnHorno: 8,
        tiempoObjetivoMin: 10,
        productos: [
          { cantidad: 2, nombre: 'Suprema familiar' },
          { cantidad: 1, nombre: 'Pan al ajo' },
        ],
      },
      {
        id: 2855,
        codigo: '#PZ-2855',
        tipoEntrega: 'RECOJO',
        etapa: 'EN_HORNO',
        horaIngreso: '20:35',
        minutosEspera: 0,
        minutosEnHorno: 6,
        tiempoObjetivoMin: 10,
        productos: [
          { cantidad: 1, nombre: 'Cuatro quesos familiar' },
          { cantidad: 1, nombre: 'Pepperoni mediana' },
        ],
      },
      {
        id: 2856,
        codigo: '#PZ-2856',
        tipoEntrega: 'DELIVERY',
        etapa: 'EN_HORNO',
        horaIngreso: '20:37',
        minutosEspera: 0,
        minutosEnHorno: 4,
        tiempoObjetivoMin: 10,
        productos: [
          { cantidad: 1, nombre: 'Hawaiana familiar' },
          { cantidad: 1, nombre: 'Americana familiar' },
        ],
      },
      {
        id: 2847,
        codigo: '#PZ-2847',
        tipoEntrega: 'DELIVERY',
        etapa: 'LISTA',
        horaIngreso: '20:25',
        horaFinalizado: '20:38',
        minutosEspera: 0,
        minutosEnHorno: 10,
        tiempoObjetivoMin: 10,
        minutosDesdeListo: 7,
        productos: [
          { cantidad: 1, nombre: 'Pepperoni familiar' },
          { cantidad: 1, nombre: 'Pan al ajo' },
        ],
      },
      {
        id: 2849,
        codigo: '#PZ-2849',
        tipoEntrega: 'RECOJO',
        etapa: 'LISTA',
        horaIngreso: '20:29',
        horaFinalizado: '20:41',
        minutosEspera: 0,
        minutosEnHorno: 10,
        tiempoObjetivoMin: 10,
        minutosDesdeListo: 4,
        productos: [
          { cantidad: 2, nombre: 'Americana mediana' },
          { cantidad: 1, nombre: 'Pan al ajo' },
        ],
      },
      {
        id: 2850,
        codigo: '#PZ-2850',
        tipoEntrega: 'DELIVERY',
        etapa: 'LISTA',
        horaIngreso: '20:31',
        horaFinalizado: '20:43',
        minutosEspera: 0,
        minutosEnHorno: 10,
        tiempoObjetivoMin: 10,
        minutosDesdeListo: 2,
        productos: [
          { cantidad: 1, nombre: 'Cuatro quesos familiar' },
          { cantidad: 1, nombre: 'Vegetariana mediana' },
        ],
      },
    ];
  }
}