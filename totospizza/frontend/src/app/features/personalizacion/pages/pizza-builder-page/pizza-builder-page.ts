import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { ArrowLeft, ArrowRight, Check, LucideAngularModule, Minus, Pencil, Plus, RefreshCw } from 'lucide-angular';
import { finalize, timeout } from 'rxjs';
import { peticionSilenciosa } from '../../../../core/interceptors/http-context';
import type { IngredienteResponse, PasoOpcionesResponse, PizzaPersonalizadaRequest } from '../../../../core/models/api';
import { CANTIDAD_MAXIMA_ITEM, CartService } from '../../../../core/services/cart.service';
import { EntregaService } from '../../../../core/services/entrega.service';
import { PersonalizacionService, cotizarPizza } from '../../../../core/services/personalizacion.service';
import { ToastService } from '../../../../core/services/toast.service';
import { formatearSoles } from '../../../../core/utils/money';
import { EntregaDialog, type AccionEntrega } from '../../../../shared/components/entrega-dialog/entrega-dialog';
import { FormaIngredienteComponent } from '../../components/forma-ingrediente/forma-ingrediente';
import { PizzaPreview, colorDeIngrediente, formaDe } from '../../components/pizza-preview/pizza-preview';

type NumeroPaso = 1 | 2 | 3 | 4 | 5;
type ListaIngredientes = 'quesoIds' | 'salsaIds' | 'ingredienteIds';

const PASOS: readonly { readonly numero: NumeroPaso; readonly titulo: string }[] = [
  { numero: 1, titulo: 'Tamaño y masa' },
  { numero: 2, titulo: 'Queso' },
  { numero: 3, titulo: 'Salsa' },
  { numero: 4, titulo: 'Ingredientes' },
  { numero: 5, titulo: 'Mi pizza' },
];

const DESCRIPCION_MASA: readonly (readonly [RegExp, string])[] = [
  [/cl[aá]sica|tradicional/i, 'Nuestra masa de siempre: suave por dentro y dorada por fuera.'],
  [/delgad|fina|italian/i, 'Fina y crocante, al estilo italiano.'],
  [/borde|queso/i, 'El borde viene relleno de queso derretido.'],
];

const NOMBRE_MAXIMO = 80;
const ESPERA_MAXIMA_MS = 15_000;


@Component({
  selector: 'app-pizza-builder-page',
  imports: [RouterLink, LucideAngularModule, PizzaPreview, FormaIngredienteComponent, EntregaDialog],
  templateUrl: './pizza-builder-page.html',
  styleUrl: './pizza-builder-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzaBuilderPage {
  private readonly personalizacion = inject(PersonalizacionService);
  private readonly cart = inject(CartService);
  private readonly entrega = inject(EntregaService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly opciones = rxResource({
    stream: () => this.personalizacion.opciones({ context: peticionSilenciosa() }).pipe(timeout(ESPERA_MAXIMA_MS)),
  });

  protected readonly paso = signal<NumeroPaso>(1);
  protected readonly tamanoId = signal<number | null>(null);
  protected readonly masaId = signal<number | null>(null);
  protected readonly quesoIds = signal<readonly number[]>([]);
  protected readonly salsaIds = signal<readonly number[]>([]);
  protected readonly ingredienteIds = signal<readonly number[]>([]);
  protected readonly nombre = signal('');
  protected readonly cantidad = signal(1);

  protected readonly enviando = signal(false);
  protected readonly agregado = signal(false);
  protected readonly accionEntrega = signal<AccionEntrega | null>(null);

  private readonly enArrastre = signal<{ readonly lista: ListaIngredientes; readonly opcion: IngredienteResponse; readonly maximo: number } | null>(null);
  protected readonly recibiendo = signal(false);
  protected readonly ultimoAgregado = signal<{ readonly texto: string; readonly clave: number } | null>(null);
  protected readonly horneando = signal(false);
  protected readonly horneada = computed(() => this.paso() === 5);

  protected readonly tamanos = computed(() => this.opciones.value()?.tamanos ?? []);
  protected readonly masas = computed(() => this.opciones.value()?.tiposMasa ?? []);
  protected readonly pasoQueso = computed(() => this.buscarPaso('QUESO', 2));
  protected readonly pasoSalsa = computed(() => this.buscarPaso('SALSA', 3));
  protected readonly pasoIngredientes = computed(() => this.buscarPaso('INGREDIENTES', 4));
  protected readonly carnes = computed(() => (this.pasoIngredientes()?.opciones ?? []).filter((i) => i.tipo === 'CARNE'));
  protected readonly otros = computed(() => (this.pasoIngredientes()?.opciones ?? []).filter((i) => i.tipo !== 'CARNE'));

  protected readonly tamano = computed(() => this.tamanos().find((t) => t.id === this.tamanoId()) ?? null);
  protected readonly masa = computed(() => this.masas().find((m) => m.id === this.masaId()) ?? null);
  protected readonly quesos = computed(() => elegidos(this.pasoQueso(), this.quesoIds()));
  protected readonly salsas = computed(() => elegidos(this.pasoSalsa(), this.salsaIds()));
  protected readonly ingredientes = computed(() => elegidos(this.pasoIngredientes(), this.ingredienteIds()));

  protected readonly cotizacion = computed(() =>
    cotizarPizza(this.tamano(), this.masa(), [...this.quesos(), ...this.salsas(), ...this.ingredientes()]),
  );
  protected readonly total = computed(() => {
    const c = this.cotizacion();
    return c ? Math.round(c.total * this.cantidad() * 100) / 100 : null;
  });

  protected readonly diametroMaximo = computed(() => Math.max(1, ...this.tamanos().map((t) => t.diametroCm)));

  private readonly bloqueos = computed<Readonly<Record<NumeroPaso, string>>>(() => ({
    1: !this.tamano() ? 'Elige un tamaño' : !this.masa() ? 'Elige una masa' : '',
    2: this.quesoIds().length === 0 ? 'Elige al menos un queso' : '',
    3: '',
    4: '',
    5: '',
  }));
  protected readonly bloqueoActual = computed(() => this.bloqueos()[this.paso()]);
  protected readonly pasoAlcanzable = computed<NumeroPaso>(() => {
    for (const p of PASOS) if (this.bloqueos()[p.numero]) return p.numero;
    return 5;
  });
  protected readonly tituloPaso = computed(() => PASOS[this.paso() - 1].titulo);

  protected readonly nombreMostrado = computed(() => this.nombre().trim() || 'Mi pizza');
  protected readonly detalle = computed(() =>
    [this.tamano()?.nombre, this.masa()?.nombre, ...[...this.quesos(), ...this.salsas(), ...this.ingredientes()].map((i) => i.nombre)]
      .filter(Boolean)
      .join(', '),
  );

  protected readonly PASOS = PASOS;
  protected readonly formaDe = formaDe;
  protected readonly colorDe = colorDeIngrediente;
  protected readonly soles = formatearSoles;
  protected readonly NOMBRE_MAXIMO = NOMBRE_MAXIMO;
  protected readonly CANTIDAD_MAXIMA = CANTIDAD_MAXIMA_ITEM;

  protected readonly CheckIcon = Check;
  protected readonly BackIcon = ArrowLeft;
  protected readonly NextIcon = ArrowRight;
  protected readonly MinusIcon = Minus;
  protected readonly PlusIcon = Plus;
  protected readonly PencilIcon = Pencil;
  protected readonly RetryIcon = RefreshCw;

  constructor() {
    effect((alLimpiar) => {
      if (this.paso() !== 5) return;
      untracked(() => this.horneando.set(true));
      const espera = setTimeout(() => this.horneando.set(false), 2600);
      alLimpiar(() => clearTimeout(espera));
    });

    effect(() => {
      const o = this.opciones.value();
      if (!o) return;
      untracked(() => {
        if (this.tamanoId() === null && o.tamanos.length > 0) this.tamanoId.set(o.tamanos[Math.floor((o.tamanos.length - 1) / 2)].id);
        if (this.masaId() === null && o.tiposMasa.length > 0) this.masaId.set(o.tiposMasa[0].id);
      });
    });
  }

  protected irA(numero: NumeroPaso): void {
    if (numero <= this.pasoAlcanzable()) this.paso.set(numero);
  }

  protected anterior(): void {
    if (this.paso() > 1) this.paso.update((p) => (p - 1) as NumeroPaso);
  }

  protected siguiente(): void {
    if (this.paso() < 5 && !this.bloqueoActual()) this.paso.update((p) => (p + 1) as NumeroPaso);
  }

  protected estadoPaso(numero: NumeroPaso): 'hecho' | 'actual' | 'pendiente' {
    if (numero === this.paso()) return 'actual';
    return numero < this.paso() ? 'hecho' : 'pendiente';
  }

  protected descripcionMasa(nombre: string): string {
    return DESCRIPCION_MASA.find(([patron]) => patron.test(nombre))?.[1] ?? '';
  }

  protected personas(min: number, max: number): string {
    if (min === max) return min === 1 ? '1 persona' : `${min} personas`;
    return `${min} a ${max} personas`;
  }

  protected alternar(lista: ListaIngredientes, opcion: IngredienteResponse, maximo: number): void {
    const ids = this[lista]();
    if (ids.includes(opcion.id)) {
      this[lista].set(ids.filter((x) => x !== opcion.id));
    } else if (ids.length < maximo) {
      this[lista].set([...ids, opcion.id]);
      this.ultimoAgregado.set({ texto: `+ ${opcion.nombre}`, clave: Date.now() });
    }
    this.agregado.set(false);
  }

  protected empezarArrastre(evento: DragEvent, lista: ListaIngredientes, opcion: IngredienteResponse, maximo: number): void {
    evento.dataTransfer?.setData('text/plain', opcion.nombre);
    if (evento.dataTransfer) evento.dataTransfer.effectAllowed = 'copy';
    this.enArrastre.set({ lista, opcion, maximo });
  }

  protected terminarArrastre(): void {
    this.enArrastre.set(null);
    this.recibiendo.set(false);
  }

  protected sobreLaPizza(evento: DragEvent): void {
    if (!this.enArrastre()) return;
    evento.preventDefault();
    if (evento.dataTransfer) evento.dataTransfer.dropEffect = 'copy';
    this.recibiendo.set(true);
  }

  protected soltarEnLaPizza(evento: DragEvent): void {
    evento.preventDefault();
    const arrastre = this.enArrastre();
    if (arrastre && !this[arrastre.lista]().includes(arrastre.opcion.id)) this.alternar(arrastre.lista, arrastre.opcion, arrastre.maximo);
    this.terminarArrastre();
  }

  protected bloqueada(lista: readonly number[], id: number, maximo: number): boolean {
    return !lista.includes(id) && lista.length >= maximo;
  }

  protected lista(items: readonly IngredienteResponse[], vacio: string): string {
    return items.length > 0 ? items.map((i) => i.nombre).join(', ') : vacio;
  }

  protected escribirNombre(evento: Event): void {
    this.nombre.set((evento.target as HTMLInputElement).value);
  }

  protected cambiarCantidad(delta: number): void {
    this.cantidad.update((c) => Math.min(CANTIDAD_MAXIMA_ITEM, Math.max(1, c + delta)));
  }

  protected continuar(accion: Exclude<AccionEntrega, 'elegir'>): void {
    if (this.enviando() || !this.cotizacion() || this.pasoAlcanzable() < 5) return;
    if (this.entrega.actual()) this.enviar(accion === 'comprar');
    else this.accionEntrega.set(accion);
  }

  protected alConfirmarEntrega(): void {
    const accion = this.accionEntrega();
    this.accionEntrega.set(null);
    if (accion === 'agregar' || accion === 'comprar') this.enviar(accion === 'comprar');
  }

  private enviar(irAlCarrito: boolean): void {
    const tamanoId = this.tamanoId();
    const tipoMasaId = this.masaId();
    const cotizacion = this.cotizacion();
    if (tamanoId === null || tipoMasaId === null || !cotizacion) return;

    const pizza: PizzaPersonalizadaRequest = {
      nombre: this.nombre().trim() || null,
      tamanoId,
      tipoMasaId,
      quesoIds: this.quesoIds(),
      salsaIds: this.salsaIds(),
      ingredienteIds: this.ingredienteIds(),
    };

    this.enviando.set(true);
    this.cart
      .agregarPizzaPersonalizada(pizza, this.cantidad(), {
        nombre: this.nombreMostrado(),
        slug: null,
        precioUnitario: cotizacion.total,
        imagenUrl: null,
        detalle: this.detalle(),
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          if (irAlCarrito) {
            void this.router.navigate(['/carrito']);
            return;
          }
          this.agregado.set(true);
          this.toast.success('Agregada al carrito', `${this.cantidad()} × ${this.nombreMostrado()}`);
          const espera = setTimeout(() => this.agregado.set(false), 2500);
          this.destroyRef.onDestroy(() => clearTimeout(espera));
        },
        error: () => undefined,
      });
  }

  private buscarPaso(etiqueta: 'QUESO' | 'SALSA' | 'INGREDIENTES', numero: number): PasoOpcionesResponse | null {
    const pasos = this.opciones.value()?.pasos ?? [];
    const patron = { QUESO: /queso/i, SALSA: /salsa/i, INGREDIENTES: /ingrediente/i }[etiqueta];
    return pasos.find((p) => p.numero === numero) ?? pasos.find((p) => patron.test(p.etiqueta)) ?? null;
  }
}

function elegidos(paso: PasoOpcionesResponse | null, ids: readonly number[]): readonly IngredienteResponse[] {
  const opciones = paso?.opciones ?? [];
  return ids.map((id) => opciones.find((o) => o.id === id)).filter((o): o is IngredienteResponse => !!o);
}
