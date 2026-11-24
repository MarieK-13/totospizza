import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bike, Clock, ExternalLink, Instagram, LucideAngularModule, MapPin, Navigation, Phone, Store } from 'lucide-angular';
import type { SucursalResponse } from '../../core/models/api';
import { LocalesService } from '../../core/services/locales.service';
import { NavegacionService } from '../../core/services/navegacion.service';
import { diaActual, etiquetaDia, ORDEN_SEMANA, horarioDelDia, textoHorario } from '../../core/utils/horario';

interface DiaVista {
  readonly etiqueta: string;
  readonly texto: string;
  readonly esHoy: boolean;
  readonly cerrado: boolean;
}

interface SedeVista {
  readonly id: number;
  readonly nombre: string;
  readonly nombreCorto: string;
  readonly abierto: boolean;
  readonly direccion: string;
  readonly distrito: string;
  readonly referencia: string | null;
  readonly telefono: string;
  readonly radioKm: number;
  readonly imagen: string;
  readonly esLogo: boolean;
  readonly mapaUrl: string;
  readonly horarioHoy: string;
  readonly semana: readonly DiaVista[];
}

interface PasoDelivery {
  readonly titulo: string;
  readonly texto: string;
}

const IMAGEN_SIN_FOTO = 'images/logo-totosd.png';

@Component({
  selector: 'app-locales',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './locales.html',
  styleUrl: './locales.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Locales {
  private readonly localesService = inject(LocalesService);
  private readonly navegacion = inject(NavegacionService);

  protected readonly StoreIcon = Store;
  protected readonly PinIcon = MapPin;
  protected readonly ClockIcon = Clock;
  protected readonly PhoneIcon = Phone;
  protected readonly BikeIcon = Bike;
  protected readonly RouteIcon = Navigation;
  protected readonly ExternalIcon = ExternalLink;
  protected readonly InstagramIcon = Instagram;

  protected readonly sedes = computed<readonly SedeVista[]>(() => {
    const coordenadasReales = this.localesService.estado() === 'listo';
    return this.localesService.locales().map((local) => this.aVista(local, coordenadasReales));
  });

  protected readonly abiertosAhora = computed(() => this.sedes().filter((s) => s.abierto).length);

  private readonly elegidaId = signal<number | null>(null);

  /** Local que se ve en el detalle: el que tocó la persona, el que ya había elegido o el primero. */
  protected readonly activa = computed<SedeVista | null>(() => {
    const sedes = this.sedes();
    const id = this.elegidaId() ?? this.localesService.seleccionada()?.id ?? null;
    return sedes.find((s) => s.id === id) ?? sedes[0] ?? null;
  });

  protected readonly pasosDelivery: readonly PasoDelivery[] = [
    { titulo: 'Comparte tu ubicación', texto: 'Solo la usamos para medir la distancia hasta el local más cercano.' },
    { titulo: 'Te decimos si llegamos', texto: 'Ves al instante el costo del envío y el tiempo estimado.' },
    { titulo: 'Pide y sigue tu pedido', texto: 'Paga online y mira la cuenta regresiva hasta tu puerta.' },
  ];

  protected readonly barrios: readonly string[] = ['San José', 'Puente Blanco', 'Luren', 'Residencial San Martín', 'San Joaquín', 'Sol de Ica'];

  protected readonly galeria: readonly { src: string; alt: string }[] = [
    { src: 'images/ig-1.jpg', alt: 'Porción de pizza artesanal con queso derretido' },
    { src: 'images/ig-2.jpg', alt: 'Maestro pizzero horneando en horno de piedra' },
    { src: 'images/ig-3.jpg', alt: 'Amigos brindando con vino alrededor de una mesa con pizzas' },
    { src: 'images/ig-4.jpg', alt: 'Masa madre con albahaca y tomates frescos' },
    { src: 'images/ig-5-web.jpg', alt: 'Pizzero preparando una pizza de espinaca en el mesón' },
  ];

  protected elegir(id: number): void {
    this.elegidaId.set(id);
  }

  /** Flechas, Inicio y Fin cambian de local, como en cualquier lista de pestañas. */
  protected onTeclas(evento: KeyboardEvent): void {
    const sedes = this.sedes();
    const actual = sedes.findIndex((s) => s.id === this.activa()?.id);
    const destino = this.indiceSegunTecla(evento.key, actual, sedes.length);
    if (destino === null) return;
    evento.preventDefault();
    this.elegir(sedes[destino].id);
    document.getElementById(`tab-local-${sedes[destino].id}`)?.focus();
  }

  protected pedirDesdeAqui(sede: SedeVista): void {
    this.localesService.seleccionar(sede.id);
    void this.navegacion.irAArmarPedido();
  }

  private indiceSegunTecla(tecla: string, actual: number, total: number): number | null {
    switch (tecla) {
      case 'ArrowDown':
      case 'ArrowRight':
        return (actual + 1) % total;
      case 'ArrowUp':
      case 'ArrowLeft':
        return (actual - 1 + total) % total;
      case 'Home':
        return 0;
      case 'End':
        return total - 1;
      default:
        return null;
    }
  }

  private aVista(local: SucursalResponse, coordenadasReales: boolean): SedeVista {
    const { direccion, distrito, referencia, latitud, longitud } = local.direccion;
    const consulta = coordenadasReales ? `${latitud},${longitud}` : `${direccion}, ${distrito}`;
    const hoy = diaActual();
    return {
      id: local.id,
      nombre: local.nombre,
      nombreCorto: local.nombre.replace(/^Toto['’]s Pizza\s*/i, '') || local.nombre,
      abierto: local.abiertoAhora,
      direccion,
      distrito,
      referencia,
      telefono: local.telefono,
      radioKm: local.radioCoberturaKm,
      imagen: local.imagenUrl ?? IMAGEN_SIN_FOTO,
      esLogo: local.imagenUrl === null,
      mapaUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`,
      horarioHoy: textoHorario(horarioDelDia(local.horarios, hoy)),
      semana: ORDEN_SEMANA.map((dia) => {
        const texto = textoHorario(horarioDelDia(local.horarios, dia));
        return { etiqueta: etiquetaDia(dia), texto, esHoy: dia === hoy, cerrado: texto === 'Cerrado' };
      }),
    };
  }
}
