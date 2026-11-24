import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { PanelModal } from '../panel-modal/panel-modal';

const MAX_MOTIVO = 200;

/**
 * Ventana para pedir un motivo antes de una acción del personal (entrega fallida, confirmar sin PIN,
 * cancelar…). Ofrece motivos frecuentes como atajo y un campo libre; emite el texto final.
 */
@Component({
  selector: 'app-motivo-dialog',
  imports: [PanelModal],
  templateUrl: './motivo-dialog.html',
  styleUrl: './motivo-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotivoDialog {
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
  readonly opciones = input<readonly string[]>([]);
  readonly etiquetaConfirmar = input('Confirmar');
  readonly tono = input<'rojo' | 'verde' | 'amarillo'>('rojo');
  readonly ocupado = input(false);
  /** Error del backend para mostrar dentro de la ventana. */
  readonly error = input<string | null>(null);
  /** Texto inicial del campo (por ejemplo, el motivo que dio el motorizado). */
  readonly inicial = input('');

  readonly confirmar = output<string>();
  readonly cerrar = output<void>();

  protected readonly elegida = signal<string | null>(null);
  protected readonly texto = signal<string | null>(null);
  protected readonly max = MAX_MOTIVO;

  /** El campo libre manda; si está vacío, vale el atajo elegido. */
  protected readonly motivo = computed(() => (this.texto() ?? this.inicial()).trim() || this.elegida() || '');
  protected readonly valido = computed(() => this.motivo().length > 0 && this.motivo().length <= MAX_MOTIVO);

  protected elegir(opcion: string): void {
    this.elegida.set(opcion);
    this.texto.set('');
  }

  protected escribir(evento: Event): void {
    this.texto.set((evento.target as HTMLTextAreaElement).value);
    if (this.texto()?.trim()) this.elegida.set(null);
  }

  protected enviar(): void {
    if (this.valido() && !this.ocupado()) this.confirmar.emit(this.motivo());
  }

  protected salir(): void {
    if (!this.ocupado()) this.cerrar.emit();
  }
}
