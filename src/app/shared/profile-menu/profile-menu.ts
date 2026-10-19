import { Component, ElementRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AddressPicker } from '../address-picker/address-picker';

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

  logout(): void {
    this.open.set(false);
    // Later: clear stored session / token here
    this.router.navigate(['/']);
  }

  // Close the dropdown when clicking anywhere outside the menu
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
