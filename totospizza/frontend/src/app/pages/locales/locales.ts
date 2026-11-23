import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Bike,
  MapPin,
  Clock,
  ArrowUpRight,
  Flame,
  Wheat,
  Sprout,
  Instagram
} from 'lucide-angular';

interface LocalSede {
  nombre: string;
  estado: string;
  direccion: string;
  horario: string;
  imagen: string;
  mapaUrl: string;
}

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './locales.html',
  styleUrl: './locales.scss'
})
export class Locales {
  readonly BikeIcon = Bike;
  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;
  readonly ArrowUpRightIcon = ArrowUpRight;
  readonly FlameIcon = Flame;
  readonly WheatIcon = Wheat;
  readonly SproutIcon = Sprout;
  readonly InstagramIcon = Instagram;

  readonly sedes: LocalSede[] = [
    {
      nombre: "Toto's Pizza AV. San Martín",
      estado: 'ABIERTO',
      direccion: 'Av. San Martín 1432, Ica 11001',
      horario: 'Lunes a domingo de 12:00 PM a 11:00 PM',
      imagen: 'images/local-san-martin.jpg',
      mapaUrl: 'https://maps.google.com/?q=Av.+San+Martin+1432+Ica'
    },
    {
      nombre: "Toto's Pizza Calle Lima",
      estado: 'ABIERTO',
      direccion: 'Calle Lima 425, Ica 11001',
      horario: 'Lun-Dom · 12:00–23:00',
      imagen: 'images/local-calle-lima.jpg',
      mapaUrl: 'https://maps.google.com/?q=Calle+Lima+425+Ica'
    },
    {
      nombre: "Toto's Pizza Ficus",
      estado: 'ABIERTO',
      direccion: 'Los Ficus, camino a Huacachina / Sector II Mz. "C" Lt. 16',
      horario: 'Mar-Dom · 13:00–00:00',
      imagen: 'images/local-ficus.jpg',
      mapaUrl: 'https://maps.google.com/?q=Los+Ficus+Huacachina+Ica'
    }
  ];

  readonly zonasDelivery: string[] = [
    'San José',
    'Puente Blanco',
    'Luren',
    'Residencial San Martín',
    'San Joaquín',
    'Sol de Ica'
  ];

  readonly galeriaFotos: { src: string; alt: string }[] = [
    { src: 'images/ig-1.jpg', alt: 'Porción de pizza artesanal recién salida del horno' },
    { src: 'images/ig-2.jpg', alt: 'Maestro pizzero horneando en horno de piedra' },
    { src: 'images/ig-3.jpg', alt: 'Amigos compartiendo pizza y vino en mesa' },
    { src: 'images/ig-4.jpg', alt: 'Masa madre de 48 horas con albahaca y tomates frescos' },
    { src: 'images/ig-5.jpg', alt: 'Tiramisú artesanal de la casa' }
  ];
}