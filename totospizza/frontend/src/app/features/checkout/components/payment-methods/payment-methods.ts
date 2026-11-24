import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type AbstractControl, type ValidationErrors } from '@angular/forms';
import { CreditCard, LucideAngularModule, Smartphone } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { environment } from '../../../../core/config/environment';
import type { MetodoPago, MetodoPagoDisponibleResponse, PagoRequest } from '../../../../core/models/api';
import { phoneValidator } from '../../../../core/utils/form-validators';
import { TextField } from '../../../../shared/components/text-field/text-field';

interface OpcionPago {
  readonly metodo: MetodoPago;
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly icono: LucideIconData;
}

const AYUDA: Readonly<Record<MetodoPago, string>> = {
  TARJETA: 'Visa, Mastercard o Amex',
  CMR: 'Tarjeta CMR Falabella',
  YAPE: 'Celular y código de aprobación',
  PLIN: 'Celular y código de aprobación',
};

const ETIQUETA: Readonly<Record<MetodoPago, string>> = {
  TARJETA: 'Tarjeta de crédito o débito',
  CMR: 'CMR',
  YAPE: 'Yape',
  PLIN: 'Plin',
};

const POR_DEFECTO: readonly MetodoPago[] = ['TARJETA', 'YAPE', 'PLIN', 'CMR'];

const esTarjeta = (m: MetodoPago) => m === 'TARJETA' || m === 'CMR';

function tarjetaValidator(control: AbstractControl): ValidationErrors | null {
  const digitos = String(control.value ?? '').replace(/\D/g, '');
  if (!digitos) return null;
  if (digitos.length < 15 || digitos.length > 16) return { tarjeta: { message: 'Revisa el número de la tarjeta' } };
  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    let d = Number(digitos[digitos.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
  }
  return suma % 10 === 0 ? null : { tarjeta: { message: 'Ese número de tarjeta no es válido' } };
}

function vencimientoValidator(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '').trim();
  if (!valor) return null;
  const partes = /^(\d{2})\/(\d{2})$/.exec(valor);
  if (!partes) return { vencimiento: { message: 'Usa el formato MM/AA' } };
  const mes = Number(partes[1]);
  const anio = 2000 + Number(partes[2]);
  if (mes < 1 || mes > 12) return { vencimiento: { message: 'El mes no es válido' } };
  const hoy = new Date();
  const vencida = anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1);
  return vencida ? { vencimiento: { message: 'La tarjeta está vencida' } } : null;
}

function codigoValidator(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '');
  if (!valor) return null;
  return /^\d{6}$/.test(valor) ? null : { codigo: { message: 'El código tiene 6 dígitos' } };
}

@Component({
  selector: 'app-payment-methods',
  imports: [ReactiveFormsModule, LucideAngularModule, TextField],
  templateUrl: './payment-methods.html',
  styleUrl: './payment-methods.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethods {
  readonly disponibles = input<readonly MetodoPagoDisponibleResponse[] | null>(null);

  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly opciones = computed<readonly OpcionPago[]>(() => {
    const desdeServidor = this.disponibles();
    const metodos = desdeServidor?.length ? [...desdeServidor].sort((a, b) => a.orden - b.orden).map((m) => m.metodo) : POR_DEFECTO;
    return metodos.map((metodo) => ({
      metodo,
      etiqueta: ETIQUETA[metodo],
      ayuda: AYUDA[metodo],
      icono: esTarjeta(metodo) ? CreditCard : Smartphone,
    }));
  });

  protected readonly elegido = signal<MetodoPago | null>(null);
  protected readonly metodo = computed(() => this.elegido() ?? this.opciones()[0]?.metodo ?? 'TARJETA');
  protected readonly conTarjeta = computed(() => esTarjeta(this.metodo()));

  protected readonly tarjeta = this.fb.group({
    numero: ['', [Validators.required, tarjetaValidator]],
    vencimiento: ['', [Validators.required, vencimientoValidator]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    titular: ['', [Validators.required, Validators.maxLength(80)]],
  });

  protected readonly billetera = this.fb.group({
    telefono: ['', [Validators.required, phoneValidator]],
    codigo: ['', [Validators.required, codigoValidator]],
  });

  protected readonly modoPrueba = !environment.production;
  protected readonly codigoPrueba = signal<string | null>(null);

  protected generarCodigoPrueba(): void {
    // 100000–999999: nunca 000000, que la pasarela simulada trata como código vencido
    const codigo = String(100000 + Math.floor(Math.random() * 900000));
    this.billetera.controls.codigo.setValue(codigo);
    this.billetera.controls.codigo.markAsTouched();
    this.codigoPrueba.set(codigo);
  }

  protected ayudaCodigo(metodo: MetodoPago): string {
    return metodo === 'YAPE'
      ? 'En Yape: abre el menú y toca "Código de aprobación". Dura pocos minutos.'
      : 'Genéralo en tu app de Plin. Dura pocos minutos.';
  }

  protected formatearCodigo(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const digitos = campo.value.replace(/\D/g, '').slice(0, 6);
    if (digitos !== campo.value) this.billetera.controls.codigo.setValue(digitos);
  }

  protected elegir(metodo: MetodoPago): void {
    this.elegido.set(metodo);
    this.codigoPrueba.set(null);
  }

  protected formatearNumero(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const digitos = campo.value.replace(/\D/g, '').slice(0, 16);
    const formateado = digitos.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (formateado !== campo.value) this.tarjeta.controls.numero.setValue(formateado);
  }

  protected formatearVencimiento(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const digitos = campo.value.replace(/\D/g, '').slice(0, 4);
    const formateado = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
    if (formateado !== campo.value) this.tarjeta.controls.vencimiento.setValue(formateado);
  }

  construirPago(): PagoRequest | null {
    const metodo = this.metodo();
    if (esTarjeta(metodo)) {
      if (this.tarjeta.invalid) {
        this.tarjeta.markAllAsTouched();
        return null;
      }
      const digitos = this.tarjeta.controls.numero.value.replace(/\D/g, '');
      const ultimos = digitos.slice(-4);
      const token = ultimos === '0002' ? `tok_sim_rechazada_${ultimos}` : `tok_sim_${Date.now().toString(36)}_${ultimos}`;
      return { metodo, tokenTarjeta: token };
    }
    if (this.billetera.invalid) {
      this.billetera.markAllAsTouched();
      return null;
    }
    const { telefono, codigo } = this.billetera.getRawValue();
    return { metodo, telefonoBilletera: telefono.replace(/\s/g, ''), codigoAprobacion: codigo };
  }
}
