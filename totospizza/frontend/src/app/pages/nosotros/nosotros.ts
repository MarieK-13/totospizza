import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, Flame, LucideAngularModule, MapPin, Sprout, Users, Wheat, type LucideIconData } from 'lucide-angular';
import { LocalesService } from '../../core/services/locales.service';
import { NavegacionService } from '../../core/services/navegacion.service';

interface Dato {
  readonly valor: string;
  readonly unidad: string;
  readonly detalle: string;
}

interface Etapa {
  readonly icono: LucideIconData;
  readonly titulo: string;
  readonly dato: string;
  readonly texto: string;
  readonly imagen: string;
  readonly alt: string;
}

@Component({
  selector: 'app-nosotros',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nosotros {
  private readonly navegacion = inject(NavegacionService);
  private readonly localesService = inject(LocalesService);

  protected readonly PinIcon = MapPin;
  protected readonly ArrowIcon = ArrowRight;

  protected readonly locales = computed(() => this.localesService.locales());

  protected readonly datos = computed<readonly Dato[]>(() => [
    { valor: '48', unidad: 'h', detalle: 'de fermentación de la masa' },
    { valor: '450', unidad: '°', detalle: 'en el horno de piedra' },
    { valor: '35', unidad: 'min', detalle: 'de delivery promedio' },
    { valor: String(this.locales().length), unidad: this.locales().length === 1 ? 'local' : 'locales', detalle: 'en Ica' },
  ]);

  protected readonly etapas: readonly Etapa[] = [
    {
      icono: Wheat,
      titulo: 'La masa descansa',
      dato: '48 horas',
      texto: 'Fermenta despacio para quedar ligera, aireada y fácil de digerir. Por eso no la apuramos.',
      imagen: 'images/ig-4.jpg',
      alt: 'Masa madre con albahaca y tomates frescos',
    },
    {
      icono: Sprout,
      titulo: 'Ingredientes del día',
      dato: 'Selección diaria',
      texto: 'Tomate, albahaca y quesos que llegan frescos. Lo que no lo está, no entra a la cocina.',
      imagen: 'images/ig-5-web.jpg',
      alt: 'Pizzero preparando una pizza de espinaca en el mesón',
    },
    {
      icono: Flame,
      titulo: 'El horno de piedra',
      dato: '450°',
      texto: 'Minutos a fuego alto: borde crujiente, centro suave y aroma a leña en cada pizza.',
      imagen: 'images/ig-2.jpg',
      alt: 'Maestro pizzero horneando en horno de piedra',
    },
    {
      icono: Users,
      titulo: 'Llega a tu mesa',
      dato: 'En el local o en casa',
      texto: 'Para compartir sin prisa, con buen vino y sobremesa. O en tu puerta, igual de caliente.',
      imagen: 'images/ig-3.jpg',
      alt: 'Amigos brindando con vino alrededor de una mesa con pizzas',
    },
  ];

  protected armarPedido(): void {
    void this.navegacion.irAArmarPedido();
  }
}
