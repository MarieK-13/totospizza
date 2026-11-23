import { Component } from '@angular/core';
import { HeroCarousel } from '../../components/hero-carousel/hero-carousel';
import { BenefitsStrip } from '../../components/benefits-strip/benefits-strip';
import { MenuPreview } from '../../components/menu-preview/menu-preview';
import { SnackCategories } from '../../components/snack-categories/snack-categories';
import { OrderNow } from '../../components/order-now/order-now';
import { CtaBanner } from '../../components/cta-banner/cta-banner';
import { RecommendedProducts } from '../../components/recommended-products/recommended-products';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroCarousel, BenefitsStrip, MenuPreview, SnackCategories, OrderNow, CtaBanner,RecommendedProducts],
  templateUrl: './home-page.html',
})
export class HomePage {}
