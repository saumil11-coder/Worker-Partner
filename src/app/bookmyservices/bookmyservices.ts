import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { AddressPicker } from '../shared/address-picker/address-picker';
import { ProfileMenu } from '../shared/profile-menu/profile-menu';
import { ServiceIcon } from '../shared/service-icon/service-icon';
import { Address, AddressService } from '../core/services/address.service';
import { ServiceCatalogService, ServiceCategory } from '../core/services/service-catalog.services';

interface Worker {
  id: number;
  name: string;
  initials: string;
  color: string;
  photo?: string; // optional: real image URL replaces the initials avatar
  verified: boolean;
  rating: number;
  reviewCount: number;
  jobsDone: number;
  distanceKm: number;
  hourlyRate: number;
  topReview: { text: string; author: string };
}

type View = 'select' | 'loading' | 'results';
type SortBy = 'distance' | 'rating' | 'price';

@Component({
  selector: 'app-bookmyservices',
  standalone: true,
  imports: [AddressPicker, ProfileMenu, ServiceIcon],
  templateUrl: './bookmyservices.html',
  styleUrl: './bookmyservices.css',
})
export class Bookmyservices implements OnDestroy {
  private catalog = inject(ServiceCatalogService);
  private addressService = inject(AddressService);

  // ---------- state ----------
  view = signal<View>('select');
  query = signal('');
  showSuggestions = signal(false);
  activeService = signal('');
  workers = signal<Worker[]>([]);
  sortBy = signal<SortBy>('distance');
  toast = signal('');

  // services (from backend)
  categories = signal<ServiceCategory[]>([]);
  categoriesLoading = signal(true);
  categoriesError = signal(false);

  // pagination (server-side, 8 per page)
  readonly pageSize = 8;
  page = signal(1);
  totalPages = signal(1);

  // search suggestions (server-side, debounced)
  suggestions = signal<ServiceCategory[]>([]);
  private selectedCategory = signal<ServiceCategory | null>(null);
  private suggestTimer?: ReturnType<typeof setTimeout>;

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  placeholder = computed(() =>
  this.totalPages() > 1
    ? Array.from({ length: Math.max(0, this.pageSize - this.categories().length) })
    : []
);

  // address (popup, select-only)
  private selectedId = signal<number | null>(null);
  private currentLocation = signal<Address | null>(null);
  addressModalOpen = signal(false);

  // Always reflects the latest saved data: edits show up here, and a deleted address clears the selection
  selectedAddress = computed<Address | null>(() => {
    const id = this.selectedId();
    if (id === null) return null;
    if (id === 0) return this.currentLocation();
    return this.addressService.addresses().find((a) => a.id === id) ?? null;
  });

  private timers: ReturnType<typeof setTimeout>[] = [];

  // Mini-map pin positions (percent) for up to 6 workers
  readonly pins = [
    { x: 62, y: 28 }, { x: 28, y: 58 }, { x: 74, y: 66 },
    { x: 24, y: 26 }, { x: 50, y: 82 }, { x: 82, y: 44 },
  ];

  // Mock profiles. Next step: move this to GET /api/workers/search on the backend.
  private readonly pool = [
    { name: 'Rahul Verma', color: '#2563eb', rating: 4.9, reviewCount: 212, jobsDone: 340, distanceKm: 1.2, rateOffset: 0, verified: true,
      review: 'Arrived on time and fixed my {service} issue in 20 minutes!', author: 'Sarah M.' },
    { name: 'Priya Sen', color: '#0ea5e9', rating: 4.8, reviewCount: 156, jobsDone: 210, distanceKm: 2.1, rateOffset: 50, verified: true,
      review: 'Very professional and neat. Explained everything clearly.', author: 'Anita G.' },
    { name: 'Amit Das', color: '#6366f1', rating: 4.7, reviewCount: 98, jobsDone: 150, distanceKm: 2.8, rateOffset: -30, verified: true,
      review: 'Fair price and great quality. Would hire again for {service}.', author: 'Rohan K.' },
    { name: 'Sneha Roy', color: '#14b8a6', rating: 4.9, reviewCount: 187, jobsDone: 295, distanceKm: 3.4, rateOffset: 60, verified: true,
      review: 'Polite, punctual and finished ahead of schedule.', author: 'Meera P.' },
    { name: 'Imran Sheikh', color: '#f59e0b', rating: 4.6, reviewCount: 64, jobsDone: 90, distanceKm: 4.2, rateOffset: -50, verified: false,
      review: 'Good work at a very reasonable rate.', author: 'Deepak S.' },
    { name: 'Anita Ghosh', color: '#ec4899', rating: 4.8, reviewCount: 132, jobsDone: 178, distanceKm: 4.7, rateOffset: 20, verified: true,
      review: 'Honest advice and spotless finish. Highly recommend!', author: 'Vikram T.' },
  ];

  constructor() {
    this.loadCategories();
    // Default to the first saved address
    this.selectedId.set(this.addressService.addresses()[0]?.id ?? null);
  }

  // ---------- derived ----------
  canSearch = computed(() => this.query().trim().length > 0);

  addressText = computed(() => {
    const a = this.selectedAddress();
    return a ? [a.line1, a.city].filter(Boolean).join(', ') : 'your location';
  });

  sortedWorkers = computed(() => {
    const list = [...this.workers()];
    switch (this.sortBy()) {
      case 'rating': return list.sort((a, b) => b.rating - a.rating);
      case 'price': return list.sort((a, b) => a.hourlyRate - b.hourlyRate);
      default: return list.sort((a, b) => a.distanceKm - b.distanceKm);
    }
  });

  // ---------- services from backend ----------
  loadCategories(page = this.page()): void {
    // Skeleton only on the very first load, so the grid doesn't flash when changing pages
    if (this.categories().length === 0) {
      this.categoriesLoading.set(true);
    }
    this.categoriesError.set(false);

    this.catalog.getServices(page, this.pageSize).subscribe({
      next: (res) => {
        this.categories.set(res.content);
        this.page.set(res.page + 1);
        this.totalPages.set(Math.max(1, res.totalPages));
        this.categoriesLoading.set(false);
      },
      error: () => {
        this.categoriesError.set(true);
        this.categoriesLoading.set(false);
      },
    });
  }

  // ---------- handlers ----------
  onQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.showSuggestions.set(true);

    clearTimeout(this.suggestTimer);
    if (!value.trim()) {
      this.suggestions.set([]);
      return;
    }
    // Wait 250 ms after the last keystroke, then ask the backend
    this.suggestTimer = setTimeout(() => {
      this.catalog.getServices(1, 6, value.trim()).subscribe({
        next: (res) => this.suggestions.set(res.content),
        error: () => this.suggestions.set([]),
      });
    }, 250);
  }

  goToPage(p: number): void {
    const target = Math.min(Math.max(1, p), this.totalPages());
    if (target !== this.page()) {
      this.loadCategories(target);
    }
  }

  pickCategory(cat: ServiceCategory): void {
    this.query.set(cat.name);
    this.selectedCategory.set(cat);
    this.showSuggestions.set(false);
  }

  hideSuggestionsSoon(): void {
    this.showSuggestions.set(false);
  }

  onAddressPicked(address: Address): void {
    if (address.id === 0) this.currentLocation.set(address);
    this.selectedId.set(address.id);
    this.addressModalOpen.set(false);
    // Changing address while viewing results re-runs the search
    if (this.view() === 'results') {
      this.findWorkers();
    }
  }

  findWorkers(): void {
    if (!this.canSearch()) return;

    // No address yet? Ask for one first.
    if (!this.selectedAddress()) {
      this.addressModalOpen.set(true);
      return;
    }

    const category = this.resolveCategory();
    this.activeService.set(category.name);
    this.showSuggestions.set(false);
    this.view.set('loading');

    // Simulates scanning. Replace with your API call, then set workers + view = 'results'.
    this.later(() => {
      this.workers.set(this.buildWorkers(category));
      this.sortBy.set('distance');
      this.view.set('results');
    }, 2200);
  }

  changeService(): void {
    this.view.set('select');
  }

  setSort(sort: SortBy): void {
    this.sortBy.set(sort);
  }

  book(worker: Worker): void {
    this.toast.set(`Booking request sent to ${worker.name}`);
    this.later(() => this.toast.set(''), 3000);
  }

  // ---------- helpers ----------
  private resolveCategory(): ServiceCategory {
    const q = this.query().trim().toLowerCase();
    const picked = this.selectedCategory();
    if (picked && picked.name.toLowerCase() === q) return picked;

    const pool = [...this.suggestions(), ...this.categories()];
    const match = pool.find((c) => c.name.toLowerCase() === q)
      ?? pool.find((c) => c.name.toLowerCase().includes(q));
    return match ?? { id: 0, name: this.query().trim(), iconKey: 'default', baseRate: 300 };
  }

  private buildWorkers(category: ServiceCategory): Worker[] {
    return this.pool.map((p, i) => ({
      id: i + 1,
      name: p.name,
      initials: p.name.split(' ').map((part) => part[0]).join(''),
      color: p.color,
      verified: p.verified,
      rating: p.rating,
      reviewCount: p.reviewCount,
      jobsDone: p.jobsDone,
      distanceKm: p.distanceKm,
      hourlyRate: category.baseRate + p.rateOffset,
      topReview: {
        text: p.review.replace('{service}', category.name.toLowerCase()),
        author: p.author,
      },
    }));
  }

  private later(fn: () => void, ms: number): void {
    this.timers.push(setTimeout(fn, ms));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    clearTimeout(this.suggestTimer);
  }
}
