import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BenefitsStrip } from '../../components/benefits-strip/benefits-strip';
import { CtaBanner } from '../../components/cta-banner/cta-banner';
import { HeroCarousel } from '../../components/hero-carousel/hero-carousel';
import { MenuPreview } from '../../components/menu-preview/menu-preview';
import { OrderNow } from '../../components/order-now/order-now';
import { RecommendedProducts } from '../../components/recommended-products/recommended-products';
import { SnackCategories } from '../../components/snack-categories/snack-categories';

@Component({
  selector: 'app-home-page',
  imports: [HeroCarousel, BenefitsStrip, MenuPreview, OrderNow, RecommendedProducts, CtaBanner, SnackCategories],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
