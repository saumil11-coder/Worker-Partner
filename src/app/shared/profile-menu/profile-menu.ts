import { Component, ElementRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AddressPicker } from '../address-picker/address-picker';
import { AuthService } from '../../core/services/auth-service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;            // navigate to a page
  action?: 'addresses';      // or run a built-in action
}

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [AddressPicker],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
})
export class ProfileMenu {
  private router = inject(Router);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
private auth = inject(AuthService);
  // Later: feed this from the logged-in customer's session
  name = input('Customer');

  open = signal(false);
  addressesOpen = signal(false);

  initials = computed(() =>
    this.name().split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
  );

  items: MenuItem[] = [
    { label: 'My Profile', icon: '👤', route: '/customer/profile' },
    { label: 'My Bookings', icon: '📋', route: '/customer/bookings' },
    { label: 'Saved Addresses', icon: '📍', action: 'addresses' },
  ];

  toggle(): void {
    this.open.update((v) => !v);
  }

  onItemClick(item: MenuItem): void {
    this.open.set(false);

    if (item.action === 'addresses') {
      this.addressesOpen.set(true);
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

 // [CHANGED] Flow: close dropdown -> clear the session -> go to login page.
logout(): void {
  this.open.set(false);       // [EXISTING]
  this.auth.logout();         // [NEW] this was the "Later: clear stored session" TODO
  this.router.navigate(['/']); // [EXISTING]
}

  // Close the dropdown when clicking anywhere outside the menu
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
