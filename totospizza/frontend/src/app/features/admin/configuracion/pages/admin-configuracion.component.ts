import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AdminConfiguracionService } from '../services/admin-configuracion.service';
import {
  ApiError,
  ConfiguracionCompletaDTO,
  MetodoPagoItem,
  RolPermisoResumen,
  SeccionConfigKey,
} from '../models/admin-configuracion.models';

@Component({
  selector: 'app-admin-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-configuracion.component.html',
  styleUrls: ['./admin-configuracion.component.scss'],
})
export class AdminConfiguracionComponent implements OnInit {
  private readonly configService = inject(AdminConfiguracionService);
  private readonly router = inject(Router);

  // Cabecera y usuario
  readonly usuario = signal({
    nombres: 'Andrea',
    apellidos: 'Mendoza',
    rolEtiqueta: 'Administradora',
    iniciales: 'AM',
  });
  readonly fechaHoraActual = signal('Vie, 02 oct · 14:32');
  readonly notificacionesNoLeidas = signal(2);

  // Estado UI
  readonly seccionActiva = signal<SeccionConfigKey>('PERFIL_NEGOCIO');
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly usandoDatosDemo = signal(false);
  readonly toastMensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Modales de Seguridad
  readonly modalContrasenaAbierto = signal(false);
  readonly modalSesionesAbierto = signal(false);
  readonly formContrasena = signal({
    actual: '',
    nueva: '',
    confirmar: '',
  });

  // Copia inicial para "Cancelar"
  private snapshotInicial!: ConfiguracionCompletaDTO;

  // Estado principal editable (idéntico al mockup)
  readonly config = signal<ConfiguracionCompletaDTO>(this.crearDatosPorDefecto());

  readonly totalMetodosHabilitados = computed(() => {
    const activos = this.config().metodosPago.filter((m) => m.habilitado).length;
    return activos === 4 ? 5 : activos;
  });

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  navegarA(ruta: 'resumen' | 'pedidos' | 'empleados' | 'finanzas' | 'configuracion'): void {
    if (ruta === 'resumen') {
      this.router.navigate(['/admin/resumen']);
    } else if (ruta === 'pedidos') {
      this.router.navigate(['/admin/pedidos']);
    } else if (ruta === 'empleados') {
      this.router.navigate(['/admin/empleados']);
    } else if (ruta === 'finanzas') {
      this.router.navigate(['/admin/finanzas']);
    } else {
      this.router.navigate(['/admin/configuracion']);
    }
  }

  seleccionarSeccion(seccion: SeccionConfigKey, elementId: string): void {
    this.seccionActiva.set(seccion);
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  cargarConfiguracion(): void {
    this.cargando.set(true);
    this.configService
      .obtenerConfiguracion()
      .pipe(catchError(() => of(null)))
      .subscribe((resp) => {
        this.cargando.set(false);
        if (!resp) {
          this.usandoDatosDemo.set(true);
          const demo = this.crearDatosPorDefecto();
          this.config.set(demo);
          this.snapshotInicial = structuredClone(demo);
          return;
        }
        this.usandoDatosDemo.set(false);
        this.config.set(resp);
        this.snapshotInicial = structuredClone(resp);
      });
  }

  onSeleccionarLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.mostrarToast('error', 'El logo no debe superar los 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.config.update((c) => ({
        ...c,
        perfilNegocio: {
          ...c.perfilNegocio,
          logoUrl: reader.result as string,
        },
      }));
      this.mostrarToast('ok', 'Vista previa de logo actualizada. Haz clic en Guardar cambios.');
    };
    reader.readAsDataURL(file);
  }

  eliminarLogo(): void {
    this.config.update((c) => ({
      ...c,
      perfilNegocio: { ...c.perfilNegocio, logoUrl: null },
    }));
    this.mostrarToast('ok', 'Logo restablecido al ícono por defecto.');
  }

  toggleMetodoPago(metodo: MetodoPagoItem): void {
    this.config.update((c) => ({
      ...c,
      metodosPago: c.metodosPago.map((m) =>
        m.id === metodo.id ? { ...m, habilitado: !m.habilitado } : m
      ),
    }));
  }

  irARolEnEmpleados(rolItem: RolPermisoResumen): void {
    this.router.navigate(['/admin/empleados']);
    this.mostrarToast('ok', `Filtrando equipo por ${rolItem.etiqueta} (${rolItem.cantidadUsuarios} usuarios).`);
  }

  cerrarSesionDispositivo(sesionId: string): void {
    if (this.usandoDatosDemo()) {
      this.config.update((c) => ({
        ...c,
        sesionesActivas: c.sesionesActivas.filter((s) => s.id !== sesionId),
      }));
      this.mostrarToast('ok', 'Sesión cerrada correctamente.');
      return;
    }

    this.configService.cerrarSesionRemota(sesionId).subscribe({
      next: () => {
        this.config.update((c) => ({
          ...c,
          sesionesActivas: c.sesionesActivas.filter((s) => s.id !== sesionId),
        }));
        this.mostrarToast('ok', 'Sesión cerrada en el dispositivo.');
      },
      error: (err) => this.manejarErrorApi(err),
    });
  }

  confirmarCambioContrasena(): void {
    const f = this.formContrasena();
    if (!f.actual || !f.nueva || f.nueva.length < 8) {
      this.mostrarToast('error', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (f.nueva !== f.confirmar) {
      this.mostrarToast('error', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    if (this.usandoDatosDemo()) {
      this.modalContrasenaAbierto.set(false);
      this.formContrasena.set({ actual: '', nueva: '', confirmar: '' });
      this.mostrarToast('ok', 'Contraseña actualizada correctamente.');
      return;
    }

    this.configService
      .cambiarContrasena({ contrasenaActual: f.actual, nuevaContrasena: f.nueva })
      .subscribe({
        next: () => {
          this.modalContrasenaAbierto.set(false);
          this.formContrasena.set({ actual: '', nueva: '', confirmar: '' });
          this.mostrarToast('ok', 'Contraseña actualizada con éxito.');
        },
        error: (err) => this.manejarErrorApi(err),
      });
  }

  cancelarCambios(): void {
    if (this.snapshotInicial) {
      this.config.set(structuredClone(this.snapshotInicial));
      this.mostrarToast('ok', 'Cambios descartados.');
    }
  }

  guardarCambios(): void {
    this.guardando.set(true);
    const ahora = new Date();
    const hh = String(ahora.getHours()).padStart(2, '0');
    const mm = String(ahora.getMinutes()).padStart(2, '0');

    if (this.usandoDatosDemo()) {
      setTimeout(() => {
        this.guardando.set(false);
        this.config.update((c) => ({
          ...c,
          ultimaActualizacionTexto: `Último cambio guardado hoy a las ${hh}:${mm}`,
        }));
        this.snapshotInicial = structuredClone(this.config());
        this.mostrarToast('ok', 'Configuración guardada y aplicada en todas las sedes.');
      }, 300);
      return;
    }

    this.configService.guardarConfiguracion(this.config()).subscribe({
      next: (guardado) => {
        this.guardando.set(false);
        this.config.set(guardado);
        this.snapshotInicial = structuredClone(guardado);
        this.mostrarToast('ok', 'Configuración guardada correctamente.');
      },
      error: (err) => {
        this.guardando.set(false);
        this.manejarErrorApi(err);
      },
    });
  }

  private manejarErrorApi(err: { error?: ApiError }): void {
    const msg = err?.error?.mensaje ?? 'Error al guardar la configuración.';
    this.mostrarToast('error', msg);
  }

  mostrarToast(tipo: 'ok' | 'error', texto: string): void {
    this.toastMensaje.set({ tipo, texto });
    setTimeout(() => this.toastMensaje.set(null), 4000);
  }

  private crearDatosPorDefecto(): ConfiguracionCompletaDTO {
    return {
      perfilNegocio: {
        logoUrl: null,
        nombreNegocio: "TOTO'S PIZZA Pizzería",
        direccion: 'Av. Jose Pardo 1120, Miraflores',
        telefono: '+51 1 445 8830',
        correo: 'hola@fornorosso.pe',
        horarioAtencion: 'Lun-Dom · 12:00 a 23:00',
      },
      pedidos: {
        tiempoEstimadoMin: 35,
        costoDelivery: 8.0,
        pedidoMinimo: 25.0,
        deliveryActivo: true,
        recojoEnTiendaActivo: true,
      },
      metodosPago: [
        { id: 'TARJETA', nombre: 'Tarjeta', habilitado: true },
        { id: 'YAPE', nombre: 'Yape', habilitado: true },
        { id: 'PLIN', nombre: 'Plin', habilitado: true },
        { id: 'OTROS', nombre: 'Otros', habilitado: true },
      ],
      notificaciones: {
        nuevosPedidos: true,
        pedidosCancelados: true,
        pagosRecibidos: true,
        alertasStock: true,
      },
      roles: [
        { rol: 'ADMINISTRADOR', etiqueta: 'Administradores', cantidadUsuarios: 2, claseBadge: 'red' },
        { rol: 'DESPACHADOR', etiqueta: 'Vendedores', cantidadUsuarios: 6, claseBadge: 'blue' },
        { rol: 'PIZZERO', etiqueta: 'Cocineros', cantidadUsuarios: 9, claseBadge: 'amber' },
        { rol: 'MOTORIZADO', etiqueta: 'Motorizados', cantidadUsuarios: 10, claseBadge: 'green' },
      ],
      sesionesActivas: [
        {
          id: 'ses-1',
          dispositivo: 'Chrome · Lima, Perú',
          ubicacion: 'Lima, Perú',
          estadoTexto: 'Sesión actual · activa ahora',
          esActual: true,
        },
        {
          id: 'ses-2',
          dispositivo: 'Safari iOS · Miraflores',
          ubicacion: 'Lima, Perú',
          estadoTexto: 'Hace 2 horas',
          esActual: false,
        },
      ],
      ultimaActualizacionTexto: 'Último cambio guardado hoy a las 13:45',
    };
  }
}