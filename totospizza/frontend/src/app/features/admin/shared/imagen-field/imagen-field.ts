import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ImagePlus, LucideAngularModule, Trash2 } from 'lucide-angular';
import type { CarpetaImagen } from '../../../../core/models/api';
import { AdminApi } from '../../../../core/services/api/admin.api';
import { ToastService } from '../../../../core/services/toast.service';

const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Campo de imagen del panel: sube JPG/PNG/WebP (máx. 2 MB) a `/admin/imagenes`
 * o acepta un enlace pegado. El valor del control es la URL final.
 */
@Component({
  selector: 'app-imagen-field',
  imports: [LucideAngularModule],
  templateUrl: './imagen-field.html',
  styleUrl: './imagen-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagenField implements ControlValueAccessor {
  readonly etiqueta = input('Imagen');
  readonly carpeta = input<CarpetaImagen>('PRODUCTOS');

  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);
  private readonly archivo = viewChild.required<ElementRef<HTMLInputElement>>('archivo');

  protected readonly url = signal('');
  protected readonly subiendo = signal(false);
  protected readonly deshabilitado = signal(false);
  protected readonly falloVista = signal(false);
  protected readonly ImageIcon = ImagePlus;
  protected readonly TrashIcon = Trash2;

  private onChange: (valor: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    const control = inject(NgControl, { self: true, optional: true });
    if (control) control.valueAccessor = this;
  }

  protected elegir(): void {
    this.archivo().nativeElement.click();
  }

  protected alElegir(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0];
    entrada.value = '';
    if (!archivo) return;
    if (!TIPOS.includes(archivo.type)) {
      this.toast.warning('Formato no admitido', 'Usa una imagen JPG, PNG o WebP.');
      return;
    }
    if (archivo.size > MAX_BYTES) {
      this.toast.warning('Imagen muy pesada', 'El máximo es 2 MB.');
      return;
    }
    this.subiendo.set(true);
    this.api
      .subirImagen(archivo, this.carpeta())
      .pipe(finalize(() => this.subiendo.set(false)))
      .subscribe(({ url }) => {
        this.fijar(url);
        this.toast.success('Imagen subida');
      });
  }

  protected alEscribir(evento: Event): void {
    this.fijar((evento.target as HTMLInputElement).value.trim());
  }

  protected quitar(): void {
    this.fijar('');
  }

  protected alSalir(): void {
    this.onTouched();
  }

  private fijar(valor: string): void {
    this.url.set(valor);
    this.falloVista.set(false);
    this.onChange(valor);
    this.onTouched();
  }

  writeValue(valor: string | null): void {
    this.url.set(valor ?? '');
    this.falloVista.set(false);
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }
}
