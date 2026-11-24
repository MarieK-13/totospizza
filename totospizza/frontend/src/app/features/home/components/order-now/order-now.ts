import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Check, LucideAngularModule, Plus } from 'lucide-angular';
import { finalize } from 'rxjs';
import type { ProductoResumenResponse, PromocionResponse } from '../../../../core/models/api';
import { AgregarRapidoService } from '../../../../core/services/agregar-rapido.service';
import { ToastService } from '../../../../core/services/toast.service';
import { formatearSoles } from '../../../../core/utils/money';
import { imagenDeProducto } from '../../../../core/utils/producto-imagen';

interface Opcion {
  readonly promo: PromocionResponse;
  /** Lo que cambia en cada opción: "Coca-Cola", "Tequeños"... */
  readonly nombre: string;
  readonly imagen: string | null;
}

interface Duo {
  readonly id: string;
  readonly nombre: string;
  readonly resumen: string;
  readonly imagen: string | null;
  readonly desde: number;
  readonly opciones: readonly Opcion[];
}

/**
 * "Elige tu Duo": combos de la base (promociones tipo COMBO).
 * Las promociones con la misma etiqueta forman un duo; cada una es una opción para completarlo
 * y se agrega al carrito con su precio promocional.
 */
@Component({
  selector: 'app-order-now',
  imports: [LucideAngularModule],
  templateUrl: './order-now.html',
  styleUrl: './order-now.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderNow {
  private readonly agregarRapido = inject(AgregarRapidoService);
  private readonly toast = inject(ToastService);

  readonly combos = input<readonly PromocionResponse[]>([]);
  /** Menú completo, para mostrar la foto del producto principal de cada duo. */
  readonly productos = input<readonly ProductoResumenResponse[]>([]);

  protected readonly CheckIcon = Check;
  protected readonly PlusIcon = Plus;
  protected readonly soles = formatearSoles;

  protected readonly duos = computed<readonly Duo[]>(() => {
    const grupos = new Map<string, PromocionResponse[]>();
    for (const promo of this.combos()) {
      const clave = promo.etiqueta ?? promo.titulo;
      grupos.set(clave, [...(grupos.get(clave) ?? []), promo]);
    }
    return [...grupos.entries()].map(([nombre, promos]) => ({
      id: nombre,
      nombre,
      resumen: promos[0].descripcion,
      imagen: this.imagenPrincipal(promos[0]) ?? promos[0].imagenUrl,
      desde: Math.min(...promos.map((p) => p.precioPromocional)),
      opciones: promos.map((promo) => ({ promo, nombre: nombreDeOpcion(promo, nombre), imagen: promo.imagenUrl })),
    }));
  });

  protected readonly duoActual = signal(0);
  private readonly elecciones = signal<Readonly<Record<string, number>>>({});
  protected readonly agregando = signal(false);
  protected readonly agregado = signal(false);

  protected readonly duo = computed(() => this.duos()[Math.min(this.duoActual(), this.duos().length - 1)] ?? null);
  protected readonly indiceElegido = computed<number | null>(() => {
    const d = this.duo();
    return d ? (this.elecciones()[d.id] ?? null) : null;
  });
  protected readonly opcionElegida = computed(() => {
    const i = this.indiceElegido();
    return i === null ? null : (this.duo()?.opciones[i] ?? null);
  });
  protected readonly total = computed(() => this.opcionElegida()?.promo.precioPromocional ?? this.duo()?.desde ?? 0);

  protected elegirDuo(indice: number): void {
    this.duoActual.set(indice);
    this.agregado.set(false);
  }

  protected elegirOpcion(indice: number): void {
    const d = this.duo();
    if (!d) return;
    this.elecciones.update((prev) => ({ ...prev, [d.id]: indice }));
    this.agregado.set(false);
  }

  protected agregar(): void {
    const opcion = this.opcionElegida();
    if (!opcion) {
      this.toast.warning('Falta un paso', 'Elige una opción para completar tu duo.');
      return;
    }
    if (this.agregando()) return;
    this.agregando.set(true);
    this.agregarRapido
      .agregarPromocion(opcion.promo)
      .pipe(finalize(() => this.agregando.set(false)))
      .subscribe({
        next: (resultado) => this.agregado.set(resultado === 'agregado'),
        error: () => undefined,
      });
  }

  /** Foto del primer producto del combo (el principal), si está en el menú. */
  private imagenPrincipal(promo: PromocionResponse): string | null {
    const principal = this.productos().find((p) => p.id === promo.items[0]?.productoId);
    return principal ? imagenDeProducto(principal) : null;
  }
}

/** "Pack Pepperoni + Coca-Cola" con duo "Pack Pepperoni & Co" → "Coca-Cola". */
function nombreDeOpcion(promo: PromocionResponse, duo: string): string {
  const partes = promo.titulo.split(' + ');
  return partes.length > 1 ? partes.slice(1).join(' + ') : promo.titulo.replace(duo, '').trim() || promo.titulo;
}
