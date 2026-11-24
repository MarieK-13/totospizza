import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookOpen, LucideAngularModule } from 'lucide-angular';

interface FooterLink {
  readonly label: string;
  readonly route: string;
}

interface FooterColumn {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
  protected readonly BookIcon = BookOpen;

  protected readonly columns: readonly FooterColumn[] = [
    {
      title: 'Explora',
      links: [
        { label: 'Menú', route: '/menu' },
        { label: 'Locales', route: '/locales' },
        { label: 'Nosotros', route: '/nosotros' },
        { label: 'Arma tu pizza', route: '/arma-tu-pizza' },
      ],
    },
    {
      title: 'Ayuda',
      links: [
        { label: 'Preguntas frecuentes', route: '/preguntas-frecuentes' },
        { label: 'Zona de reparto', route: '/zona-de-reparto' },
        { label: 'Contáctanos', route: '/contactanos' },
      ],
    },
  ];

  protected readonly legal: readonly FooterLink[] = [
    { label: 'Términos y condiciones', route: '/terminos' },
    { label: 'Privacidad', route: '/privacidad' },
  ];

  protected readonly payments = ['VISA', 'MC', 'YAPE', 'PLIN'] as const;
}
