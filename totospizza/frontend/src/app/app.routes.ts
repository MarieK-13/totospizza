import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  // Sitio público: aviso + header + contenido + footer
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: "Toto's Pizza | Pizza artesanal en Ica",
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page').then((m) => m.HomePage),
      },
      {
        path: 'locales',
        title: "Locales | Toto's Pizza",
        loadComponent: () => import('./pages/locales/locales').then((m) => m.Locales),
      },
      {
        path: 'zona-de-reparto',
        title: "Zona de reparto | Toto's Pizza",
        loadComponent: () => import('./pages/zona-de-reparto/zona-de-reparto').then((m) => m.ZonaDeReparto),
      },
      {
        path: 'nosotros',
        title: "Nosotros | Toto's Pizza",
        loadComponent: () => import('./pages/nosotros/nosotros').then((m) => m.Nosotros),
      },
      {
        path: 'menu',
        title: "Menú | Toto's Pizza",
        loadComponent: () => import('./pages/menu/menu').then((m) => m.Menu),
      },
      {
        path: 'menu/:slug',
        title: "Producto | Toto's Pizza",
        loadComponent: () => import('./pages/producto/producto').then((m) => m.Producto),
      },
      {
        path: 'terminos',
        title: "Términos y condiciones | Toto's Pizza",
        loadComponent: () => import('./pages/terminos/terminos').then((m) => m.Terminos),
      },
      {
        path: 'privacidad',
        title: "Política de privacidad | Toto's Pizza",
        loadComponent: () => import('./pages/privacidad/privacidad').then((m) => m.Privacidad),
      },
      // Las demás rutas (menú, arma-tu-pizza, carrito...) se agregan cuando existan sus páginas.
    ],
  },

  // Acceso: solo para visitantes (quien ya inició sesión va a su pantalla de inicio)
  {
    path: 'login',
    canActivate: [guestGuard],
    title: "Iniciar sesión | Toto's Pizza",
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    title: "Crear cuenta | Toto's Pizza",
    loadComponent: () => import('./features/auth/pages/registro/registro').then((m) => m.Registro),
  },

  {
    path: 'olvide-contrasena',
    canActivate: [guestGuard],
    title: "Recuperar contraseña | Toto's Pizza",
    loadComponent: () =>
      import('./features/auth/pages/olvide-contrasena/olvide-contrasena').then((m) => m.OlvideContrasena),
  },
  {
    // Sin guestGuard: el enlace del correo debe funcionar aunque haya una sesión abierta
    path: 'restablecer-contrasena',
    title: "Nueva contraseña | Toto's Pizza",
    loadComponent: () =>
      import('./features/auth/pages/restablecer-contrasena/restablecer-contrasena').then((m) => m.RestablecerContrasena),
  },

  // TEMPORAL: vista previa de los demás layouts. Borrar cuando existan las páginas reales.
  {
    path: 'dev/admin',
    data: { titulo: 'Administración' },
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
    children: [{ path: '', loadComponent: previewComponent }],
  },
  {
    path: 'dev/cocina',
    data: { titulo: 'Cocina' },
    loadComponent: () => import('./layout/staff-layout/staff-layout').then((m) => m.StaffLayout),
    children: [{ path: '', loadComponent: previewComponent }],
  },

  { path: '**', redirectTo: '' },
];

function previewComponent() {
  return import('./layout/layout-preview/layout-preview').then((m) => m.LayoutPreview);
}
