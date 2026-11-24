import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, timeout } from 'rxjs';
import { peticionSilenciosa } from '../../../../core/interceptors/http-context';
import { CatalogoService } from '../../../../core/services/catalogo.service';
import { BenefitsStrip } from '../../components/benefits-strip/benefits-strip';
import { CtaBanner } from '../../components/cta-banner/cta-banner';
import { HeroCarousel } from '../../components/hero-carousel/hero-carousel';
import { MenuPreview } from '../../components/menu-preview/menu-preview';
import { OrderNow } from '../../components/order-now/order-now';
import { RecommendedProducts } from '../../components/recommended-products/recommended-products';
import { SnackCategories } from '../../components/snack-categories/snack-categories';

const ESPERA_MAXIMA_MS = 15_000;
const TAMANO_MENU = 100;

@Component({
  selector: 'app-home-page',
  imports: [HeroCarousel, BenefitsStrip, MenuPreview, OrderNow, RecommendedProducts, CtaBanner, SnackCategories],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly catalogo = inject(CatalogoService);

  private readonly inicio = rxResource({
    stream: () =>
      this.catalogo.home({ context: peticionSilenciosa() }).pipe(
        timeout(ESPERA_MAXIMA_MS),
        catchError(() => of(null)),
      ),
  });
  private readonly menu = rxResource({
    stream: () =>
      this.catalogo.menu({ tamano: TAMANO_MENU }, { context: peticionSilenciosa() }).pipe(
        timeout(ESPERA_MAXIMA_MS),
        catchError(() => of(null)),
      ),
  });

  protected readonly cargandoInicio = this.inicio.isLoading;
  protected readonly cargandoMenu = this.menu.isLoading;

  private readonly promociones = computed(() => this.inicio.value()?.promociones ?? []);
  protected readonly combos = computed(() => this.promociones().filter((p) => p.tipo === 'COMBO'));
  protected readonly promocionesCarrusel = computed(() => this.promociones().filter((p) => p.tipo !== 'COMBO'));
  protected readonly destacados = computed(() => this.inicio.value()?.destacados ?? []);

  protected readonly productos = computed(() => this.menu.value()?.contenido ?? []);
  protected readonly antojitos = computed(() => this.productos().filter((p) => /antojito/i.test(p.categoria)));
}
