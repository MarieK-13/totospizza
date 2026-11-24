import type { LucideIconData } from 'lucide-angular';

export interface NavItem {
  readonly label: string;
  readonly route: string;
  readonly icon?: LucideIconData;
  readonly exact?: boolean;
  readonly section?: string;
}
