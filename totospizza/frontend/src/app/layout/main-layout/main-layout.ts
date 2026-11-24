import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnnouncementBar } from '../announcement-bar/announcement-bar';
import { SiteFooter } from '../footer/footer';
import { SiteHeader } from '../header/header';
import { OrderFab } from '../order-fab/order-fab';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, AnnouncementBar, SiteHeader, SiteFooter, OrderFab],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected onPageActivate(): void {
    window.scrollTo({ top: 0 });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.main().nativeElement.animate(
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 380, easing: 'cubic-bezier(0, 0, 0.2, 1)' },
    );
  }
}
