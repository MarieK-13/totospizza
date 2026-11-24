import {
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  Pizza,
  Settings,
  Users,
  Wallet,
} from 'lucide-angular';
import type { NavItem } from '../models/nav-item.model';

/** Navegación pública (header y footer). */
export const MAIN_NAV: readonly NavItem[] = [
  { label: 'Inicio', route: '/', exact: true },
  { label: 'Menú', route: '/menu' },
  { label: 'Locales', route: '/locales' },
  { label: 'Nosotros', route: '/nosotros' },
];

/** Llamada principal a la acción del header. */
export const MAIN_CTA: NavItem = { label: 'Arma tu pizza', route: '/arma-tu-pizza' };

/** Navegación del panel de administración. */
export const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Resumen', route: '/admin/resumen', icon: LayoutDashboard, section: 'Principal' },
  { label: 'Pedidos', route: '/admin/pedidos', icon: ClipboardList, section: 'Operación' },
  { label: 'Catálogo', route: '/admin/catalogo', icon: Pizza },
  { label: 'Finanzas', route: '/admin/finanzas', icon: Wallet, section: 'Gestión' },
  { label: 'Empleados', route: '/admin/empleados', icon: Users },
  { label: 'Configuración', route: '/admin/configuracion', icon: Settings },
];

export const STAFF_ICON = ChefHat;
