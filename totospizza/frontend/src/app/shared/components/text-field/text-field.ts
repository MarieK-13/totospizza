import { Component, computed, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Eye, EyeOff, LucideAngularModule, Check, X } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import type { PasswordRule } from '../../../core/utils/form-validators';

let nextId = 0;

const DEFAULT_MESSAGES: Record<string, (error: any) => string> = {
  required: () => 'Este campo es obligatorio',
  email: () => 'Ingresa un correo válido',
  minlength: (e) => `Mínimo ${e.requiredLength} caracteres`,
  maxlength: (e) => `Máximo ${e.requiredLength} caracteres`,
  pattern: () => 'El formato no es válido',
};

@Component({
  selector: 'app-text-field',
  imports: [LucideAngularModule],
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
})
export class TextField implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'number' | 'date'>('text');
  readonly placeholder = input('');
  readonly icon = input<LucideIconData>();
  readonly hint = input<string>();
  readonly autocomplete = input<string>();
  readonly required = input(false);
  readonly max = input<string>();
  readonly min = input<string>();
  readonly maxlength = input<number>();
  readonly inputmode = input<'text' | 'numeric' | 'tel' | 'email'>();
  readonly rules = input<readonly PasswordRule[]>([]);

  protected readonly id = `field-${++nextId}`;
  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly focused = signal(false);
  protected readonly revealed = signal(false);

  protected readonly EyeIcon = Eye;
  protected readonly EyeOffIcon = EyeOff;
  protected readonly CheckIcon = Check;
  protected readonly CrossIcon = X;

  protected readonly control = inject(NgControl, { self: true, optional: true });

  protected readonly inputType = computed(() =>
    this.type() === 'password' && this.revealed() ? 'text' : this.type(),
  );

  private onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  constructor() {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  protected get showError(): boolean {
    const control = this.control?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected get errorMessage(): string {
    const errors = this.control?.errors;
    if (!errors) return '';
    for (const key of Object.keys(errors)) {
      const detail = errors[key];
      if (detail && typeof detail === 'object' && 'message' in detail) return detail.message as string;
      const fallback = DEFAULT_MESSAGES[key];
      if (fallback) return fallback(detail);
    }
    return 'Revisa este campo';
  }

  protected get showRules(): boolean {
    return this.type() === 'password' && this.rules().length > 0 && (this.focused() || this.value().length > 0 || !!this.control?.touched);
  }

  protected ruleState(rule: PasswordRule): 'pending' | 'ok' | 'fail' {
    if (rule.test(this.value())) return 'ok';
    return this.value().length > 0 || this.control?.touched ? 'fail' : 'pending';
  }

  protected handleInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected handleBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
