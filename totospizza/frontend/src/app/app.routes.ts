import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: "Toto's Pizza | Pizza artesanal en Ica",
    loadComponent: () =>
      import('./features/home/pages\\home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'locales',
    title: "Locales | Toto's Pizza",
    loadComponent: () => import('./pages/locales/locales').then((m) => m.Locales),
  },
  {
    path: 'nosotros',
    title: "Nosotros | Toto's Pizza",
    loadComponent: () => import('./pages/nosotros/nosotros').then((m) => m.Nosotros),
  },
  // Las demás rutas (menú, arma-tu-pizza, login...) se agregan cuando existan sus páginas.
  { path: '**', redirectTo: '' },
];