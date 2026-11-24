import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './core/guards/auth.guards';

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
        loadComponent: () =>
          import('./pages/zona-de-reparto/zona-de-reparto').then((m) => m.ZonaDeReparto),
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
        path: 'arma-tu-pizza',
        title: "Arma tu pizza | Toto's Pizza",
        loadComponent: () =>
          import('./features/personalizacion/pages/pizza-builder-page/pizza-builder-page').then(
            (m) => m.PizzaBuilderPage
          ),
      },
      {
        path: 'carrito',
        title: "Tu carrito | Toto's Pizza",
        loadComponent: () =>
          import('./features/carrito/pages/cart-page/cart-page').then((m) => m.CartPage),
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
      // Compra: solo clientes con sesión
      {
        path: 'checkout',
        canActivate: [roleGuard('CLIENTE')],
        title: "Finaliza tu pedido | Toto's Pizza",
        loadComponent: () =>
          import('./features/checkout/pages/checkout-page/checkout-page').then(
            (m) => m.CheckoutPage
          ),
      },
      {
        path: 'pedido-confirmado/:numero',
        canActivate: [roleGuard('CLIENTE')],
        title: "¡Pedido recibido! | Toto's Pizza",
        loadComponent: () =>
          import('./features/pedido/pages/order-confirmation-page/order-confirmation-page').then(
            (m) => m.OrderConfirmationPage
          ),
      },
      // Mi cuenta: solo clientes con sesión
      {
        path: 'perfil',
        canActivate: [roleGuard('CLIENTE')],
        title: "Mi perfil | Toto's Pizza",
        loadComponent: () =>
          import('./features/perfil/pages/profile-page/profile-page').then((m) => m.ProfilePage),
      },
      {
        path: 'mis-pedidos',
        canActivate: [roleGuard('CLIENTE')],
        title: "Mis pedidos | Toto's Pizza",
        loadComponent: () =>
          import('./features/perfil/pages/orders-page/orders-page').then((m) => m.OrdersPage),
      },
      {
        path: 'mis-pedidos/:numero',
        canActivate: [roleGuard('CLIENTE')],
        title: "Seguimiento del pedido | Toto's Pizza",
        loadComponent: () =>
          import('./features/pedido/pages/order-tracking-page/order-tracking-page').then(
            (m) => m.OrderTrackingPage
          ),
      },
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
      import('./features/auth/pages/olvide-contrasena/olvide-contrasena').then(
        (m) => m.OlvideContrasena
      ),
  },
  {
    // Sin guestGuard: el enlace del correo debe funcionar aunque haya una sesión abierta
    path: 'restablecer-contrasena',
    title: "Nueva contraseña | Toto's Pizza",
    loadComponent: () =>
      import('./features/auth/pages/restablecer-contrasena/restablecer-contrasena').then(
        (m) => m.RestablecerContrasena
      ),
  },

  // Panel del administrador: layout con menú lateral, una sección por ruta
  {
    path: 'admin',
    canActivate: [roleGuard('ADMINISTRADOR')],
    loadComponent: () => import('./layout/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },
      {
        path: 'resumen',
        title: "Resumen | Administración - Toto's Pizza",
        data: { titulo: 'Resumen', subtitulo: 'Visión general del negocio' },
        loadComponent: () =>
          import('./features/admin/resumen/pages/admin-resumen.component').then((m) => m.AdminResumenComponent),
      },
      {
        path: 'pedidos',
        title: "Pedidos | Administración - Toto's Pizza",
        data: { titulo: 'Pedidos', subtitulo: 'Gestiona pedidos, pagos y entregas en tiempo real' },
        loadComponent: () =>
          import('./features/admin/pedidos/pages/admin-pedidos.component').then((m) => m.AdminPedidosComponent),
      },
      {
        path: 'empleados',
        title: "Empleados | Administración - Toto's Pizza",
        data: { titulo: 'Empleados', subtitulo: 'Equipo, turnos y disponibilidad de la sede' },
        loadComponent: () =>
          import('./features/admin/empleados/pages/admin-empleados.component').then((m) => m.AdminEmpleadosComponent),
      },
      {
        path: 'inventario',
        title: "Inventario | Administración - Toto's Pizza",
        data: { titulo: 'Inventario', subtitulo: 'Stock por sede y canal, incluido el stock web' },
        loadComponent: () =>
          import('./features/admin/inventario/pages/admin-inventario.component').then((m) => m.AdminInventarioComponent),
      },
      {
        path: 'productos',
        title: "Productos | Administración - Toto's Pizza",
        data: { titulo: 'Productos', subtitulo: 'Carta, precios por tamaño, ingredientes y alérgenos' },
        loadComponent: () =>
          import('./features/admin/productos/pages/admin-productos.component').then((m) => m.AdminProductosComponent),
      },
      {
        path: 'categorias',
        title: "Categorías | Administración - Toto's Pizza",
        data: { titulo: 'Categorías', subtitulo: 'Secciones del menú y su orden' },
        loadComponent: () =>
          import('./features/admin/categorias/pages/admin-categorias.component').then((m) => m.AdminCategoriasComponent),
      },
      {
        path: 'ingredientes',
        title: "Ingredientes y alérgenos | Administración - Toto's Pizza",
        data: { titulo: 'Ingredientes y alérgenos', subtitulo: 'Insumos, adicionales y etiquetas del menú' },
        loadComponent: () =>
          import('./features/admin/ingredientes/pages/admin-ingredientes.component').then((m) => m.AdminIngredientesComponent),
      },
      {
        path: 'masas',
        title: "Masas y tamaños | Administración - Toto's Pizza",
        data: { titulo: 'Masas y tamaños', subtitulo: 'Tipos de masa con recargo y tamaños de pizza' },
        loadComponent: () =>
          import('./features/admin/masas/pages/admin-masas.component').then((m) => m.AdminMasasComponent),
      },
      {
        path: 'promociones',
        title: "Promociones | Administración - Toto's Pizza",
        data: { titulo: 'Promociones', subtitulo: 'Combos, descuentos y ofertas por sobreproducción' },
        loadComponent: () =>
          import('./features/admin/promociones/pages/admin-promociones.component').then((m) => m.AdminPromocionesComponent),
      },
      {
        path: 'resenas',
        title: "Reseñas | Administración - Toto's Pizza",
        data: { titulo: 'Reseñas', subtitulo: 'Opiniones de clientes: destaca o esconde' },
        loadComponent: () =>
          import('./features/admin/resenas/pages/admin-resenas.component').then((m) => m.AdminResenasComponent),
      },
      {
        path: 'sucursales',
        title: "Sucursales | Administración - Toto's Pizza",
        data: { titulo: 'Sucursales', subtitulo: 'Locales, horarios y zonas de reparto' },
        loadComponent: () =>
          import('./features/admin/sucursales/pages/admin-sucursales.component').then((m) => m.AdminSucursalesComponent),
      },
      {
        path: 'finanzas',
        title: "Finanzas | Administración - Toto's Pizza",
        data: { titulo: 'Finanzas', subtitulo: 'Ingresos, gastos y rentabilidad del negocio' },
        loadComponent: () =>
          import('./features/admin/finanzas/pages/admin-finanzas.component').then((m) => m.AdminFinanzasComponent),
      },
      {
        path: 'configuracion',
        title: "Configuración | Administración - Toto's Pizza",
        data: { titulo: 'Configuración', subtitulo: "Personaliza la operación de Toto's Pizza" },
        loadComponent: () =>
          import('./features/admin/configuracion/pages/admin-configuracion.component').then(
            (m) => m.AdminConfiguracionComponent,
          ),
      },
    ],
  },

  // Pantallas operativas: el mismo layout del panel (menú lateral + barra superior); cada una exige su rol
  {
    path: '',
    loadComponent: () => import('./layout/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
    children: [
      {
        path: 'cocina',
        canActivate: [roleGuard('PIZZERO')],
        title: "Cocina | Toto's Pizza",
        data: { titulo: 'Cocina', subtitulo: 'Tablero de preparación en vivo' },
        loadComponent: () => import('./features/cocina/pages/cocina-panel.component').then((m) => m.CocinaPanelComponent),
      },
      {
        path: 'despacho',
        canActivate: [roleGuard('DESPACHADOR')],
        title: "Mostrador | Toto's Pizza",
        data: { titulo: 'Mostrador', subtitulo: 'Despacho y recojo' },
        loadComponent: () =>
          import('./features/despacho/pages/mostrador-panel.component').then((m) => m.MostradorPanelComponent),
      },
      { path: 'mostrador', redirectTo: 'despacho', pathMatch: 'full' },
      {
        path: 'reparto',
        canActivate: [roleGuard('MOTORIZADO')],
        title: "Mis entregas | Toto's Pizza",
        data: { titulo: 'Mis entregas', subtitulo: 'Reparto a domicilio' },
        loadComponent: () => import('./features/reparto/pages/reparto-panel.component').then((m) => m.RepartoPanelComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];