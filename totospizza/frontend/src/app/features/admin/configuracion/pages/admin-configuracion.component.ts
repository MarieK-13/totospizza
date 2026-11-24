import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of, type Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type {
  MetodoPago,
  MetodoPagoHabilitadoResponse,
  ParametroSistemaResponse,
  PerfilNegocioRequest,
  PerfilNegocioResponse,
  Rol,
} from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { AuthApi } from '../../../../core/services/api/auth.api';
import { ToastService } from '../../../../core/services/toast.service';
import { esApiException } from '../../../../core/utils/api-exception';
import { aplicarErroresDeCampo } from '../../../../core/utils/form-errors';
import { PASSWORD_RULES, matchFields, passwordValidator, phoneValidator } from '../../../../core/utils/form-validators';
import { TextField } from '../../../../shared/components/text-field/text-field';

type Seccion = 'perfil' | 'pedidos' | 'pagos' | 'usuarios' | 'seguridad';

interface InfoParametro {
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly prefijo?: string;
  readonly sufijo?: string;
}

/** Parámetros que el administrador ajusta desde aquí (el resto son internos). */
const PARAMETROS: Readonly<Record<string, InfoParametro>> = {
  minutos_preparacion: { etiqueta: 'Tiempo de cocina', ayuda: 'Minutos por pedido', sufijo: 'min' },
  minutos_por_km: { etiqueta: 'Tiempo por km', ayuda: 'Minutos de viaje del motorizado', sufijo: 'min' },
  costo_delivery_base: { etiqueta: 'Costo de delivery', ayuda: 'Sin zona de reparto configurada', prefijo: 'S/' },
  envio_gratis_desde: { etiqueta: 'Delivery gratis desde', ayuda: 'Subtotal mínimo', prefijo: 'S/' },
  radio_cobertura_km: { etiqueta: 'Radio de cobertura', ayuda: 'Distancia máxima de reparto', sufijo: 'km' },
  minutos_vencimiento_recojo: { etiqueta: 'Espera de recojo', ayuda: 'Luego se marca como no recogido', sufijo: 'min' },
  minutos_expiracion_pago: { etiqueta: 'Tiempo para pagar', ayuda: 'Luego se cancela el pedido', sufijo: 'min' },
  minutos_tolerancia_garantia: { etiqueta: 'Tolerancia de garantía', ayuda: 'Antes de aplicar la Garantía TOTO', sufijo: 'min' },
};

const ROLES: readonly { rol: Rol; etiqueta: string; clase: string }[] = [
  { rol: 'ADMINISTRADOR', etiqueta: 'Administradores', clase: 'red' },
  { rol: 'DESPACHADOR', etiqueta: 'Despachadores', clase: 'blue' },
  { rol: 'PIZZERO', etiqueta: 'Pizzeros', clase: 'amber' },
  { rol: 'MOTORIZADO', etiqueta: 'Motorizados', clase: 'green' },
];

const vacioANull = (valor: string): string | null => valor.trim() || null;

import { SlidersHorizontal } from 'lucide-angular';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
@Component({
  selector: 'app-admin-configuracion',
  imports: [ReactiveFormsModule, RouterLink, TextField, EstadoVacio],
  templateUrl: './admin-configuracion.component.html',
  styleUrls: ['./admin-configuracion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminConfiguracionComponent {
  protected readonly IconoParametros = SlidersHorizontal;

  private readonly api = inject(AdminApi);
  private readonly authApi = inject(AuthApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly reglasContrasena = PASSWORD_RULES;
  protected readonly secciones: readonly { id: Seccion; etiqueta: string }[] = [
    { id: 'perfil', etiqueta: 'Perfil del negocio' },
    { id: 'pedidos', etiqueta: 'Pedidos y delivery' },
    { id: 'pagos', etiqueta: 'Métodos de pago' },
    { id: 'usuarios', etiqueta: 'Usuarios y permisos' },
    { id: 'seguridad', etiqueta: 'Seguridad' },
  ];
  protected readonly seccionActiva = signal<Seccion>('perfil');

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly guardadoEn = signal<Date | null>(null);

  private perfilOriginal: PerfilNegocioResponse | null = null;
  protected readonly perfil = this.fb.group({
    nombreComercial: ['', [Validators.required, Validators.maxLength(120)]],
    razonSocial: ['', [Validators.maxLength(160)]],
    ruc: ['', [Validators.pattern(/^\d{11}$/)]],
    logoUrl: ['', [Validators.maxLength(500)]],
    correoContacto: ['', [Validators.email, Validators.maxLength(120)]],
    telefonoContacto: ['', [phoneValidator]],
    direccionFiscal: ['', [Validators.maxLength(200)]],
    whatsapp: ['', [phoneValidator]],
    instagramUrl: ['', [Validators.maxLength(200)]],
    facebookUrl: ['', [Validators.maxLength(200)]],
  });
  protected readonly logoUrl = signal('');

  private readonly parametrosOriginales = signal<readonly ParametroSistemaResponse[]>([]);
  protected readonly valoresParametros = signal<Readonly<Record<string, string>>>({});
  protected readonly parametros = computed(() =>
    Object.entries(PARAMETROS)
      .map(([clave, info]) => ({ clave, info, original: this.parametrosOriginales().find((p) => p.clave === clave) }))
      .filter((p) => p.original),
  );

  private readonly metodosOriginales = signal<readonly MetodoPagoHabilitadoResponse[]>([]);
  protected readonly metodos = signal<readonly MetodoPagoHabilitadoResponse[]>([]);
  protected readonly metodosActivos = computed(() => this.metodos().filter((m) => m.activo).length);

  protected readonly roles = signal(ROLES.map((r) => ({ ...r, cantidad: null as number | null })));

  protected readonly modalContrasenaAbierto = signal(false);
  protected readonly cambiandoContrasena = signal(false);
  protected readonly errorContrasena = signal<string | null>(null);
  protected readonly formContrasena = this.fb.group(
    {
      contrasenaActual: ['', [Validators.required]],
      nuevaContrasena: ['', [Validators.required, passwordValidator, Validators.maxLength(72)]],
      confirmarContrasena: ['', [Validators.required]],
    },
    { validators: matchFields('nuevaContrasena', 'confirmarContrasena') },
  );

  constructor() {
    forkJoin({ perfil: this.api.perfilNegocio(), parametros: this.api.parametros(), metodos: this.api.metodosPagoAdmin() })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe(({ perfil, parametros, metodos }) => {
        this.aplicarPerfil(perfil);
        this.aplicarParametros(parametros);
        this.aplicarMetodos(metodos);
      });
    for (const r of ROLES) {
      this.api.empleados({ rol: r.rol, tamano: 1 }).subscribe((pagina) =>
        this.roles.update((lista) => lista.map((x) => (x.rol === r.rol ? { ...x, cantidad: pagina.totalElementos } : x))),
      );
    }
  }

  protected irA(seccion: Seccion): void {
    this.seccionActiva.set(seccion);
    document.getElementById(`config-${seccion}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected invalido(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  protected mensaje(control: AbstractControl): string {
    const e = control.errors ?? {};
    if (e['required']) return 'Este campo es obligatorio';
    if (e['email']) return 'Correo no válido';
    if (e['pattern']) return 'El RUC tiene 11 dígitos';
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres`;
    const detalle = Object.values(e)[0] as { message?: string } | undefined;
    return detalle?.message ?? 'Revisa este campo';
  }

  protected cambiarParametro(clave: string, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.valoresParametros.update((v) => ({ ...v, [clave]: valor }));
  }

  protected alternarMetodo(metodo: MetodoPago): void {
    const activos = this.metodosActivos();
    this.metodos.update((lista) =>
      lista.map((m) => {
        if (m.metodo !== metodo) return m;
        if (m.activo && activos === 1) {
          this.toast.warning('Deja al menos un método activo', 'Los clientes necesitan una forma de pagar.');
          return m;
        }
        return { ...m, activo: !m.activo };
      }),
    );
  }

  protected descartar(): void {
    if (this.perfilOriginal) this.aplicarPerfil(this.perfilOriginal);
    this.aplicarParametros(this.parametrosOriginales());
    this.aplicarMetodos(this.metodosOriginales());
    this.toast.info('Cambios descartados');
  }

  protected guardar(): void {
    if (this.guardando()) return;
    if (this.perfil.invalid) {
      this.perfil.markAllAsTouched();
      this.irA('perfil');
      return;
    }
    const parametrosCambiados = this.parametrosOriginales().filter((p) => {
      const nuevo = this.valoresParametros()[p.clave];
      return nuevo !== undefined && nuevo.trim() !== p.valor;
    });
    if (parametrosCambiados.some((p) => !(Number(this.valoresParametros()[p.clave]) >= 0) || this.valoresParametros()[p.clave].trim() === '')) {
      this.toast.warning('Revisa los parámetros', 'Usa números iguales o mayores a cero.');
      this.irA('pedidos');
      return;
    }
    const metodosCambiados = this.metodos().filter((m) => this.metodosOriginales().find((o) => o.metodo === m.metodo)?.activo !== m.activo);

    const peticiones: Observable<unknown>[] = [];
    if (this.perfil.dirty) peticiones.push(this.api.actualizarPerfilNegocio(this.cuerpoPerfil()));
    for (const p of parametrosCambiados) peticiones.push(this.api.actualizarParametro(p.clave, { valor: this.valoresParametros()[p.clave].trim() }));
    for (const m of metodosCambiados) peticiones.push(this.api.actualizarMetodoPago({ metodo: m.metodo, activo: m.activo, orden: m.orden }));
    if (!peticiones.length) {
      this.toast.info('No hay cambios por guardar');
      return;
    }

    this.guardando.set(true);
    forkJoin(peticiones)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.guardadoEn.set(new Date());
          this.toast.success('Configuración guardada', 'Los cambios ya se aplican en la tienda.');
          this.recargar();
        },
        error: (error: unknown) => {
          if (esApiException(error) && error.errores.length) aplicarErroresDeCampo(this.perfil, error.errores);
          this.recargar();
        },
      });
  }

  protected abrirModalContrasena(): void {
    this.formContrasena.reset();
    this.errorContrasena.set(null);
    this.modalContrasenaAbierto.set(true);
  }

  protected cambiarContrasena(): void {
    if (this.cambiandoContrasena()) return;
    if (this.formContrasena.invalid) {
      this.formContrasena.markAllAsTouched();
      return;
    }
    this.cambiandoContrasena.set(true);
    this.errorContrasena.set(null);
    this.authApi
      .cambiarContrasena(this.formContrasena.getRawValue())
      .pipe(finalize(() => this.cambiandoContrasena.set(false)))
      .subscribe({
        next: () => {
          this.modalContrasenaAbierto.set(false);
          this.toast.success('Contraseña actualizada', 'Úsala la próxima vez que inicies sesión.');
        },
        error: (error: unknown) => {
          if (esApiException(error) && error.codigo === 'CONTRASENA_REPETIDA') {
            aplicarErroresDeCampo(this.formContrasena, [{ campo: 'nuevaContrasena', mensaje: error.message }]);
            return;
          }
          if (esApiException(error) && error.errores.length) {
            const sueltos = aplicarErroresDeCampo(this.formContrasena, error.errores);
            if (sueltos.length) this.errorContrasena.set(sueltos.join(' '));
          }
        },
      });
  }

  private recargar(): void {
    forkJoin({ perfil: this.api.perfilNegocio(), parametros: this.api.parametros(), metodos: this.api.metodosPagoAdmin() }).subscribe(
      ({ perfil, parametros, metodos }) => {
        this.aplicarPerfil(perfil);
        this.aplicarParametros(parametros);
        this.aplicarMetodos(metodos);
      },
    );
  }

  private cuerpoPerfil(): PerfilNegocioRequest {
    const v = this.perfil.getRawValue();
    return {
      nombreComercial: v.nombreComercial.trim(),
      razonSocial: vacioANull(v.razonSocial),
      ruc: vacioANull(v.ruc),
      logoUrl: vacioANull(v.logoUrl),
      correoContacto: vacioANull(v.correoContacto),
      telefonoContacto: vacioANull(v.telefonoContacto.replace(/\s/g, '')),
      direccionFiscal: vacioANull(v.direccionFiscal),
      whatsapp: vacioANull(v.whatsapp.replace(/\s/g, '')),
      instagramUrl: vacioANull(v.instagramUrl),
      facebookUrl: vacioANull(v.facebookUrl),
    };
  }

  private aplicarPerfil(perfil: PerfilNegocioResponse): void {
    this.perfilOriginal = perfil;
    this.perfil.reset({
      nombreComercial: perfil.nombreComercial ?? '',
      razonSocial: perfil.razonSocial ?? '',
      ruc: perfil.ruc ?? '',
      logoUrl: perfil.logoUrl ?? '',
      correoContacto: perfil.correoContacto ?? '',
      telefonoContacto: perfil.telefonoContacto ?? '',
      direccionFiscal: perfil.direccionFiscal ?? '',
      whatsapp: perfil.whatsapp ?? '',
      instagramUrl: perfil.instagramUrl ?? '',
      facebookUrl: perfil.facebookUrl ?? '',
    });
    this.logoUrl.set(perfil.logoUrl ?? '');
  }

  private aplicarParametros(parametros: readonly ParametroSistemaResponse[]): void {
    this.parametrosOriginales.set(parametros);
    this.valoresParametros.set(Object.fromEntries(parametros.map((p) => [p.clave, p.valor])));
  }

  private aplicarMetodos(metodos: readonly MetodoPagoHabilitadoResponse[]): void {
    const ordenados = [...metodos].sort((a, b) => a.orden - b.orden);
    this.metodosOriginales.set(ordenados);
    this.metodos.set(ordenados);
  }
}
