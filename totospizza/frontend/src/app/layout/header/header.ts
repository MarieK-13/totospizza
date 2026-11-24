import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import {
  ArrowRight,
  ChevronDown,
  LogOut,
  LucideAngularModule,
  Menu,
  Pizza,
  ShoppingBag,
  User,
  X,
} from 'lucide-angular';
import { MAIN_CTA, MAIN_NAV } from '../../core/constants/navigation';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { formatearSoles } from '../../core/utils/money';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeAll()',
    '(document:click)': 'onDocumentClick($event)',
    '(window:scroll)': 'onScroll()',
    '[class.is-scrolled]': 'scrolled()',
  },
})
export class SiteHeader {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);

  protected readonly enLogin = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0] === '/login'),
      startWith(this.router.url.split(/[?#]/)[0] === '/login'),
    ),
    { requireSync: true },
  );

  protected readonly cartCount = this.cart.cantidad;
  protected readonly cartTotal = this.cart.total;

  protected readonly nav = MAIN_NAV;
  protected readonly cta = MAIN_CTA;
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly accountOpen = signal(false);
  protected readonly cartLabel = computed(() => formatearSoles(this.cartTotal()));
  protected readonly nombreCompleto = computed(() => {
    const usuario = this.auth.usuario();
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : '';
  });

  protected readonly UserIcon = User;
  protected readonly BagIcon = ShoppingBag;
  protected readonly MenuIcon = Menu;
  protected readonly CloseIcon = X;
  protected readonly PizzaIcon = Pizza;
  protected readonly ArrowIcon = ArrowRight;
  protected readonly ChevronIcon = ChevronDown;
  protected readonly LogoutIcon = LogOut;

  constructor() {
    effect(() => {
      document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
    inject(DestroyRef).onDestroy(() => (document.body.style.overflow = ''));
  }

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected toggleAccount(): void {
    this.accountOpen.update((open) => !open);
  }

  protected closeAccount(): void {
    this.accountOpen.set(false);
  }

  protected closeAll(): void {
    this.closeMenu();
    this.closeAccount();
  }

  protected onDocumentClick(event: Event): void {
    const dentro = (event.target as Element | null)?.closest('.account');
    if (!dentro) this.closeAccount();
  }

  protected cerrarSesion(): void {
    this.closeAll();
    this.auth.logout('/').subscribe(() => this.toast.info('Sesión cerrada', 'Vuelve pronto.'));
  }
}
