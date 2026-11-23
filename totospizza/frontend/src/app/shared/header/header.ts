import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, MapPin, User, ShoppingCart, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  // Íconos de Lucide usados en el Header
  readonly MapPinIcon = MapPin;
  readonly UserIcon = User;
  readonly CartIcon = ShoppingCart;
  readonly MenuIcon = Menu;
  readonly CloseIcon = X;

  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}