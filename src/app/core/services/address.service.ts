import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { API_ENDPOINTS } from '../api-endpoints'; // <-- adjust name / path to your constants file

export interface Address {
  id: number;            // 0 = "current location" (not saved)
  label: string;         // Home / Work / Other
  line1: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export type AddressInput = Pick<Address, 'label' | 'line1' | 'city' | 'state' | 'pincode'>;

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);

  // One shared list for the whole app, so the profile menu and the booking page always agree.
  private readonly _addresses = signal<Address[]>([]);
  readonly addresses = this._addresses.asReadonly();

  readonly loading = signal(false);
  readonly error = signal('');

  private loaded = false;

  /** Fetch the list once (safe to call from several components). */
  ensureLoaded(): void {
    if (!this.loaded) this.load();
  }

  /** Always re-fetch from the backend. */
  load(): void {
    this.loaded = true;
    this.loading.set(true);
    this.error.set('');

    this.fetchAll().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loaded = false;               // allow a retry
        this.loading.set(false);
        this.error.set('Could not load your addresses.');
      },
    });
  }

  // GET  all active addresses
  private fetchAll(): Observable<Address[]> {
    return this.http
      .get<Address[]>(API_ENDPOINTS.getAllActiveAddresses)
      .pipe(tap((list) => this._addresses.set(list)));
  }

  // POST new address, then refresh the list (emits once the list is updated)
  add(data: AddressInput): Observable<Address[]> {
    return this.http
      .post(API_ENDPOINTS.insertNewAddress, data)
      .pipe(switchMap(() => this.fetchAll()));
  }

  // PUT  updated address (id travels in the body), then refresh the list
  update(id: number, data: AddressInput): Observable<Address[]> {
    return this.http
      .put(API_ENDPOINTS.updateActiveAddress, { ...data, id })
      .pipe(switchMap(() => this.fetchAll()));
  }

  // DELETE address (id as request param), then refresh the list
  remove(id: number): Observable<Address[]> {
    return this.http
      .delete(API_ENDPOINTS.deleteActiveAddress, { params: { id } })
      .pipe(switchMap(() => this.fetchAll()));
  }
}