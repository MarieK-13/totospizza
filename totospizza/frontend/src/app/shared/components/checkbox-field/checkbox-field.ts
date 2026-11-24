import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Check, LucideAngularModule } from 'lucide-angular';

let nextId = 0;

@Component({
  selector: 'app-checkbox-field',
  imports: [LucideAngularModule],
  templateUrl: './checkbox-field.html',
  styleUrl: './checkbox-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxField implements ControlValueAccessor {
  protected readonly id = `check-${++nextId}`;
  protected readonly checked = signal(false);
  protected readonly disabled = signal(false);
  protected readonly CheckIcon = Check;

  protected readonly control = inject(NgControl, { self: true, optional: true });

  private onChange: (value: boolean) => void = () => undefined;
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
    return typeof detalle === 'object' && detalle?.message ? detalle.message : 'Este campo es obligatorio';
  }

  protected alternar(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).checked;
    this.checked.set(valor);
    this.onChange(valor);
  }

  writeValue(valor: boolean | null): void {
    this.checked.set(!!valor);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.disabled.set(deshabilitado);
  }
}
