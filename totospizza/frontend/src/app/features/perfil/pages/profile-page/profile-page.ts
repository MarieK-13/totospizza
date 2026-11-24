import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Building2, GraduationCap, House, LucideAngularModule, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import type { DireccionClienteResponse, PerfilResponse } from '../../../../core/models/api';
import { ClienteApi } from '../../../../core/services/api/cliente.api';
import { ToastService } from '../../../../core/services/toast.service';
import { mensajeDeError } from '../../../../core/utils/api-exception';
import { AccountShell } from '../../../../shared/components/account-shell/account-shell';
import { DireccionDialog } from '../../components/direccion-dialog/direccion-dialog';
import { PasswordForm } from '../../components/password-form/password-form';
import { ProfileForm } from '../../components/profile-form/profile-form';

const ICONO_ETIQUETA: Readonly<Record<string, LucideIconData>> = {
  casa: House,
  trabajo: Building2,
  oficina: Building2,
  universidad: GraduationCap,
};

/** "Mi perfil": datos personales, direcciones guardadas y seguridad. */
@Component({
  selector: 'app-profile-page',
  imports: [LucideAngularModule, AccountShell, ProfileForm, PasswordForm, DireccionDialog],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly api = inject(ClienteApi);
  private readonly toast = inject(ToastService);

  protected readonly recurso = rxResource({ stream: () => this.api.perfil() });

  protected readonly perfil = linkedSignal<PerfilResponse | undefined>(() =>
    this.recurso.hasValue() ? this.recurso.value() : undefined,
  );

  protected readonly direcciones = computed(() =>
    [...(this.perfil()?.direcciones ?? [])].sort((a, b) => Number(b.favorita) - Number(a.favorita)),
  );

  protected readonly enEdicion = signal<DireccionClienteResponse | null | undefined>(undefined);
  protected readonly ocupada = signal<number | null>(null);
  protected readonly porEliminar = signal<number | null>(null);

  protected readonly PlusIcon = Plus;
  protected readonly EditIcon = Pencil;
  protected readonly TrashIcon = Trash2;
  protected readonly StarIcon = Star;

  protected iconoDe(etiqueta: string): LucideIconData {
    return ICONO_ETIQUETA[etiqueta.trim().toLowerCase()] ?? MapPin;
  }

  protected alGuardarPerfil(perfil: PerfilResponse): void {
    this.perfil.set(perfil);
  }

  protected alGuardarDireccion(guardada: DireccionClienteResponse): void {
    const nueva = this.enEdicion() === null;
    this.reemplazarDirecciones((lista) => {
      const ajustada = guardada.favorita ? lista.map((d) => ({ ...d, favorita: false })) : lista;
      return ajustada.some((d) => d.id === guardada.id)
        ? ajustada.map((d) => (d.id === guardada.id ? guardada : d))
        : [...ajustada, guardada];
    });
    this.enEdicion.set(undefined);
    this.toast.success(nueva ? 'Dirección guardada' : 'Dirección actualizada', guardada.etiqueta);
  }

  protected marcarFavorita(direccion: DireccionClienteResponse): void {
    if (direccion.favorita || this.ocupada() !== null) return;
    this.ocupada.set(direccion.id);
    this.api
      .actualizarDireccion(direccion.id, {
        etiqueta: direccion.etiqueta,
        favorita: true,
        direccion: { ...direccion.direccion },
      })
      .subscribe({
        next: (guardada) => {
          this.reemplazarDirecciones((lista) => lista.map((d) => (d.id === guardada.id ? guardada : { ...d, favorita: false })));
          this.ocupada.set(null);
        },
        error: (error: unknown) => {
          this.ocupada.set(null);
          this.toast.error('No pudimos cambiar la favorita', mensajeDeError(error));
        },
      });
  }

  protected eliminar(direccion: DireccionClienteResponse): void {
    if (this.porEliminar() !== direccion.id) {
      this.porEliminar.set(direccion.id);
      return;
    }
    this.ocupada.set(direccion.id);
    this.api.eliminarDireccion(direccion.id).subscribe({
      next: () => {
        this.reemplazarDirecciones((lista) => lista.filter((d) => d.id !== direccion.id));
        this.ocupada.set(null);
        this.porEliminar.set(null);
        this.toast.info('Dirección eliminada', direccion.etiqueta);
      },
      error: (error: unknown) => {
        this.ocupada.set(null);
        this.porEliminar.set(null);
        this.toast.error('No pudimos eliminar la dirección', mensajeDeError(error));
      },
    });
  }

  private reemplazarDirecciones(cambio: (lista: readonly DireccionClienteResponse[]) => readonly DireccionClienteResponse[]): void {
    this.perfil.update((p) => (p ? { ...p, direcciones: cambio(p.direcciones) } : p));
  }
}
