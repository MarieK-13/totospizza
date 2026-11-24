import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { ChevronDown, LucideAngularModule, type LucideIconData } from 'lucide-angular';

let nextId = 0;

export interface Opcion<T extends string = string> {
  readonly valor: T;
  readonly etiqueta: string;
}

/** Selector reutilizable (usa el <select> nativo: teclado y lectores de pantalla ya funcionan). */
@Component({
  selector: 'app-select-field',
  imports: [LucideAngularModule],
  templateUrl: './select-field.html',
  styleUrl: './select-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectField implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly opciones = input.required<readonly Opcion[]>();
  readonly required = input(false);
  readonly icon = input<LucideIconData>();

  protected readonly id = `select-${++nextId}`;
  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly focused = signal(false);
  protected readonly ChevronIcon = ChevronDown;

  protected readonly control = inject(NgControl, { self: true, optional: true });

  private onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  constructor() {
    if (this.control) this.control.valueAccessor = this;
  }

  protected get showError(): boolean {
    const control = this.control?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected get errorMessage(): string {
    const errors = this.control?.errors;
    if (!errors) return '';
    const detalle = Object.values(errors)[0] as { message?: string } | true | undefined;
    return typeof detalle === 'object' && detalle?.message ? detalle.message : 'Selecciona una opción';
  }

  protected alCambiar(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.value.set(valor);
    this.onChange(valor);
  }

  protected alSalir(): void {
    this.focused.set(false);
    this.onTouched();
  }

  writeValue(valor: string | null): void {
    this.value.set(valor ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.disabled.set(deshabilitado);
  }
}
