import {
  Bike,
  Boxes,
  ChefHat,
  ClipboardList,
  Layers,
  LayoutDashboard,
  MessageSquareQuote,
  PackageCheck,
  Pizza,
  Settings,
  ShieldAlert,
  Store,
  Tag,
  Users,
  Wallet,
  Wheat,
} from 'lucide-angular';
import type { Rol } from '../models/api';
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

/** Navegación del panel de administración, agrupada por sección. */
export const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Resumen', route: '/admin/resumen', icon: LayoutDashboard, section: 'Principal' },
  { label: 'Pedidos', route: '/admin/pedidos', icon: ClipboardList, section: 'Operación' },
  { label: 'Inventario', route: '/admin/inventario', icon: Boxes },
  { label: 'Productos', route: '/admin/productos', icon: Pizza, section: 'Catálogo' },
  { label: 'Categorías', route: '/admin/categorias', icon: Layers },
  { label: 'Ingredientes y alérgenos', route: '/admin/ingredientes', icon: ShieldAlert },
  { label: 'Masas y tamaños', route: '/admin/masas', icon: Wheat },
  { label: 'Promociones', route: '/admin/promociones', icon: Tag, section: 'Marketing' },
  { label: 'Reseñas', route: '/admin/resenas', icon: MessageSquareQuote },
  { label: 'Finanzas', route: '/admin/finanzas', icon: Wallet, section: 'Gestión' },
  { label: 'Empleados', route: '/admin/empleados', icon: Users },
  { label: 'Sucursales', route: '/admin/sucursales', icon: Store },
  { label: 'Configuración', route: '/admin/configuracion', icon: Settings },
];

/** Navegación de las pantallas operativas: cada rol ve solo la suya. */
export const STAFF_NAV: Readonly<Record<Exclude<Rol, 'ADMINISTRADOR' | 'CLIENTE'>, readonly NavItem[]>> = {
  PIZZERO: [{ label: 'Tablero de cocina', route: '/cocina', icon: ChefHat, section: 'Cocina' }],
  DESPACHADOR: [{ label: 'Mostrador', route: '/despacho', icon: PackageCheck, section: 'Despacho' }],
  MOTORIZADO: [{ label: 'Mis entregas', route: '/reparto', icon: Bike, section: 'Reparto' }],
};

/** Menú lateral del panel según el rol de la sesión. */
export function navegacionPanel(rol: Rol | null): readonly NavItem[] {
  if (rol === 'ADMINISTRADOR') return ADMIN_NAV;
  return rol && rol !== 'CLIENTE' ? STAFF_NAV[rol] : [];
}

