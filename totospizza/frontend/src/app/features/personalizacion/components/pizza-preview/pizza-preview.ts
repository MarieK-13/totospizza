import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { IngredienteResponse, TamanoPizzaResponse, TipoMasaResponse } from '../../../../core/models/api';
import { FormaIngredienteComponent } from '../forma-ingrediente/forma-ingrediente';

/** Radio de la pizza más grande, en unidades del viewBox (-200..200). */
const RADIO_BASE = 178;
/** Zona donde caen queso e ingredientes (no tocan el borde). */
const RADIO_RELLENO = 128;
const PIEZAS_POR_INGREDIENTE = 12;
const GOTAS_DE_QUESO = 34;
const HEBRAS_DE_QUESO = 26;

type Borde = 'clasica' | 'delgada' | 'queso';
export type FormaIngrediente =
  | 'pepperoni'
  | 'jamon'
  | 'tocino'
  | 'carne'
  | 'pollo'
  | 'champinon'
  | 'aceituna'
  | 'pimiento'
  | 'cebolla'
  | 'pina'
  | 'jalapeno'
  | 'tomate'
  | 'otro';

interface Punto {
  readonly x: number;
  readonly y: number;
  readonly giro: number;
  readonly escala: number;
}

interface Pieza extends Punto {
  readonly orden: number;
}

interface Capa {
  readonly id: number;
  readonly forma: FormaIngrediente;
  readonly piezas: readonly Pieza[];
}

interface CapaQueso {
  readonly id: number;
  readonly color: string;
  readonly sombra: string;
  readonly gotas: readonly { readonly x: number; readonly y: number; readonly r: number }[];
  readonly hebras: readonly Punto[];
}

/** Formas reconocidas por nombre; lo que no coincide se dibuja como un trocito genérico. */
const FORMAS: readonly (readonly [RegExp, FormaIngrediente])[] = [
  [/pepperoni|salami|chorizo/i, 'pepperoni'],
  [/jam[oó]n|prosciutto/i, 'jamon'],
  [/tocino|bacon|panceta/i, 'tocino'],
  [/carne|molida|res|ternera/i, 'carne'],
  [/pollo/i, 'pollo'],
  [/champi|hongo|portobello/i, 'champinon'],
  [/aceituna/i, 'aceituna'],
  [/pimiento/i, 'pimiento'],
  [/cebolla/i, 'cebolla'],
  [/pi[ñn]a/i, 'pina'],
  [/jalape/i, 'jalapeno'],
  [/tomate/i, 'tomate'],
];

/** [color principal, color oscuro del borde] por salsa. */
const COLOR_SALSA: readonly (readonly [RegExp, readonly [string, string]])[] = [
  [/bbq|barbacoa/i, ['#7A3217', '#4E1D0C']],
  [/pesto|albahaca/i, ['#5F8D36', '#3D6420']],
  [/ajo|crema|blanca/i, ['#F1E5C8', '#D8C59C']],
  [/picante|rocoto/i, ['#B8321F', '#831B10']],
  [/boloñesa|bolo/i, ['#8E3420', '#5E1E10']],
];
const COLOR_TOMATE: readonly [string, string] = ['#C33A22', '#8D2412'];

/** [color, sombra] por queso. */
const COLOR_QUESO: readonly (readonly [RegExp, readonly [string, string]])[] = [
  [/cheddar/i, ['#F2A43A', '#C97A17']],
  [/parmesano/i, ['#F1DE9E', '#CDB66F']],
  [/gouda/i, ['#F6C65E', '#D49B2A']],
  [/provolone/i, ['#F7E6B2', '#D8BE7E']],
  [/ricotta/i, ['#FBF6E8', '#E3D8BD']],
];
const COLOR_MOZZARELLA: readonly [string, string] = ['#F9E9B9', '#E0C37C'];

/**
 * Vista previa dibujada en SVG con texturas (masa, salsa, queso derretido, tabla de madera).
 * Crece con el tamaño, cambia el borde con la masa, esparce la salsa, deja caer el queso rallado
 * y los ingredientes, se puede girar arrastrando y se "hornea" al final.
 */
@Component({
  selector: 'app-pizza-preview',
  imports: [FormaIngredienteComponent],
  templateUrl: './pizza-preview.html',
  styleUrl: './pizza-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-recibiendo]': 'recibiendo()',
    '[class.is-horneada]': 'horneada()',
  },
})
export class PizzaPreview {
  readonly tamano = input<TamanoPizzaResponse | null>(null);
  /** Todos los tamaños, para escalar de la más chica a la más grande. */
  readonly tamanos = input<readonly TamanoPizzaResponse[]>([]);
  readonly masa = input<TipoMasaResponse | null>(null);
  readonly quesos = input<readonly IngredienteResponse[]>([]);
  readonly salsas = input<readonly IngredienteResponse[]>([]);
  readonly ingredientes = input<readonly IngredienteResponse[]>([]);
  /** Muestra la regla con los centímetros (paso de tamaño). */
  readonly mostrarMedida = input(false);
  /** Resalta la pizza mientras se arrastra un ingrediente encima. */
  readonly recibiendo = input(false);
  /** Borde dorado, queso gratinado y vapor. */
  readonly horneada = input(false);

  /** Giro de la pizza en grados (se arrastra con el dedo o el mouse). */
  protected readonly giro = signal(0);
  protected readonly girando = signal(false);
  private arrastre: { readonly angulo: number; readonly giro: number } | null = null;

  /** 0.62 (más chica) a 1 (más grande). */
  protected readonly escala = computed(() => {
    const actual = this.tamano();
    const diametros = this.tamanos().map((t) => t.diametroCm);
    if (!actual || diametros.length === 0) return 0.8;
    const min = Math.min(...diametros);
    const max = Math.max(...diametros);
    return max === min ? 1 : 0.62 + (0.38 * (actual.diametroCm - min)) / (max - min);
  });
  /** Medio ancho de la regla en unidades del viewBox (sigue al tamaño). */
  protected readonly anchoRegla = computed(() => Math.round(RADIO_BASE * this.escala()));

  protected readonly borde = computed<Borde>(() => {
    const nombre = this.masa()?.nombre ?? '';
    if (/delgad|fina|italian/i.test(nombre)) return 'delgada';
    if (/queso|borde|relleno/i.test(nombre)) return 'queso';
    return 'clasica';
  });
  /** Radio donde empieza la salsa: el borde clásico es más grueso que el delgado. */
  protected readonly radioSalsa = computed(() => ({ clasica: 148, delgada: 162, queso: 138 })[this.borde()]);

  /** Una capa por salsa; con dos, la segunda cubre media pizza. La clave relanza la animación al cambiar. */
  protected readonly capasSalsa = computed(() =>
    this.salsas().map((s, i) => {
      const [color, oscuro] = colorPorNombre(s.nombre, COLOR_SALSA, COLOR_TOMATE);
      return { clave: `${s.id}-${i}`, color, oscuro, media: i > 0 };
    }),
  );
  protected readonly medialuna = computed(() => {
    const r = this.radioSalsa();
    return `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} Z`;
  });

  /** Cada queso tiene su propia capa: así solo el recién elegido cae y se derrite. */
  protected readonly capasQueso = computed<readonly CapaQueso[]>(() =>
    this.quesos().map((q, i) => {
      const [color, sombra] = colorPorNombre(q.nombre, COLOR_QUESO, COLOR_MOZZARELLA);
      return {
        id: q.id,
        color,
        sombra,
        gotas: repartir(1000 + i * 31, GOTAS_DE_QUESO, RADIO_RELLENO + 10, 0.17).map((p, j) => ({ x: p.x, y: p.y, r: 15 + ((j * 7) % 12) })),
        hebras: repartir(2000 + q.id, HEBRAS_DE_QUESO, RADIO_RELLENO, 0.25),
      };
    }),
  );

  protected readonly capas = computed<readonly Capa[]>(() =>
    this.ingredientes().map((ing, capa) => ({
      id: ing.id,
      forma: formaDe(ing),
      piezas: repartir(ing.id * 13 + capa, PIEZAS_POR_INGREDIENTE, RADIO_RELLENO, 0.36).map((p, i) => ({ ...p, orden: i })),
    })),
  );

  protected readonly hayQueso = computed(() => this.quesos().length > 0);

  // Detalles fijos (no cambian entre renders)
  protected readonly oregano = OREGANO;
  protected readonly quemados = QUEMADOS;
  protected readonly gratinado = GRATINADO;
  protected readonly burbujas = BURBUJAS;
  protected readonly RADIO_BASE = RADIO_BASE;

  // ── Girar con el dedo o el mouse ─────────────────────────────────────────
  protected empezarGiro(evento: PointerEvent): void {
    const svg = evento.currentTarget as SVGSVGElement;
    svg.setPointerCapture(evento.pointerId);
    this.arrastre = { angulo: anguloDesdeCentro(svg, evento), giro: this.giro() };
    this.girando.set(true);
  }

  protected girar(evento: PointerEvent): void {
    if (!this.arrastre) return;
    const actual = anguloDesdeCentro(evento.currentTarget as SVGSVGElement, evento);
    this.giro.set(this.arrastre.giro + actual - this.arrastre.angulo);
  }

  protected terminarGiro(): void {
    this.arrastre = null;
    this.girando.set(false);
  }

  /** Flechas del teclado: girar sin mouse. */
  protected girarConTeclado(evento: KeyboardEvent): void {
    const paso = ({ ArrowLeft: -15, ArrowRight: 15 } as Readonly<Record<string, number>>)[evento.key];
    if (paso === undefined) return;
    evento.preventDefault();
    this.giro.update((g) => g + paso);
  }
}

export function formaDe(ingrediente: Pick<IngredienteResponse, 'nombre' | 'tipo'>): FormaIngrediente {
  return FORMAS.find(([patron]) => patron.test(ingrediente.nombre))?.[1] ?? (ingrediente.tipo === 'CARNE' ? 'carne' : 'otro');
}

/** Color de una salsa o un queso, para los íconos de las tarjetas. */
export function colorDeIngrediente(ingrediente: Pick<IngredienteResponse, 'nombre' | 'tipo'>): string {
  return ingrediente.tipo === 'SALSA'
    ? colorPorNombre(ingrediente.nombre, COLOR_SALSA, COLOR_TOMATE)[0]
    : colorPorNombre(ingrediente.nombre, COLOR_QUESO, COLOR_MOZZARELLA)[0];
}

function colorPorNombre<T>(nombre: string, tabla: readonly (readonly [RegExp, T])[], porDefecto: T): T {
  return tabla.find(([patron]) => patron.test(nombre))?.[1] ?? porDefecto;
}

function anguloDesdeCentro(svg: SVGSVGElement, evento: PointerEvent): number {
  const caja = svg.getBoundingClientRect();
  return (Math.atan2(evento.clientY - (caja.top + caja.height / 2), evento.clientX - (caja.left + caja.width / 2)) * 180) / Math.PI;
}

/** Generador pseudoaleatorio con semilla: la misma pizza siempre se ve igual. */
function aleatorio(semilla: number): () => number {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Puntos repartidos en el círculo sin amontonarse (muestreo con distancia mínima). */
function repartir(semilla: number, cantidad: number, radio: number, separacion: number): Punto[] {
  const azar = aleatorio(semilla * 7919 + 17);
  const puntos: Punto[] = [];
  const distanciaMinima = radio * separacion;
  for (let intento = 0; puntos.length < cantidad && intento < 600; intento++) {
    const angulo = azar() * Math.PI * 2;
    const r = Math.sqrt(azar()) * radio;
    const x = Math.cos(angulo) * r;
    const y = Math.sin(angulo) * r;
    const relajada = intento > 300 ? 0.55 : 1;
    if (puntos.every((p) => Math.hypot(p.x - x, p.y - y) > distanciaMinima * relajada)) {
      puntos.push({ x: Math.round(x), y: Math.round(y), giro: Math.round(azar() * 360), escala: 0.85 + azar() * 0.3 });
    }
  }
  return puntos;
}

/** Puntos en el anillo del borde, para las marcas de horno. */
function enAnillo(semilla: number, cantidad: number, desde: number, hasta: number): Punto[] {
  const azar = aleatorio(semilla);
  return Array.from({ length: cantidad }, (_, i) => {
    const angulo = ((i + azar() * 0.7) / cantidad) * Math.PI * 2;
    const r = desde + azar() * (hasta - desde);
    return { x: Math.round(Math.cos(angulo) * r), y: Math.round(Math.sin(angulo) * r), giro: Math.round((angulo * 180) / Math.PI), escala: 0.6 + azar() * 0.8 };
  });
}

const OREGANO = repartir(77, 34, RADIO_RELLENO + 10, 0.12);
const QUEMADOS = enAnillo(311, 18, 156, 172);
const GRATINADO = repartir(509, 24, RADIO_RELLENO, 0.22);
const BURBUJAS = repartir(613, 7, RADIO_RELLENO - 10, 0.45);
