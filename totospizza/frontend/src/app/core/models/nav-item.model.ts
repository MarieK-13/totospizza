import type { LucideIconData } from 'lucide-angular';

/** Elemento de navegación reutilizable (header, drawer, sidebar). */
export interface NavItem {
  readonly label: string;
  readonly route: string;
  readonly icon?: LucideIconData;
  /** Si es true, solo se marca activo cuando la URL coincide exactamente. */
  readonly exact?: boolean;
  /** Título de grupo (solo sidebar): se muestra cuando cambia respecto al ítem anterior. */
  readonly section?: string;
}
