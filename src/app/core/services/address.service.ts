import { Injectable, signal } from '@angular/core';

export interface Address {
  id: number;            // 0 = "current location" (not saved)
  label: string;         // Home / Work / Other
  line1: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export type AddressInput = Pick<Address, 'label' | 'line1' | 'city' | 'pincode'>;

@Injectable({ providedIn: 'root' })
export class AddressService {
  // One shared list for the whole app, so the profile menu and the booking page always agree.
  // TODO: replace with  GET /api/customers/me/addresses  once login session / JWT exists.
  private readonly _addresses = signal<Address[]>([
    { id: 1, label: 'Home', line1: '12, Park Street', city: 'Kolkata', pincode: '700016' },
    { id: 2, label: 'Work', line1: 'Sector V, Salt Lake', city: 'Kolkata', pincode: '700091' },
  ]);

  readonly addresses = this._addresses.asReadonly();

  // TODO: POST /api/customers/me/addresses
  add(data: AddressInput): Address {
    const saved: Address = { ...data, id: Date.now() };
    this._addresses.update((list) => [...list, saved]);
    return saved;
  }

  // TODO: PUT /api/customers/me/addresses/{id}
  update(id: number, data: AddressInput): void {
    this._addresses.update((list) => list.map((a) => (a.id === id ? { ...a, ...data, id } : a)));
  }

  // TODO: DELETE /api/customers/me/addresses/{id}
  remove(id: number): void {
    this._addresses.update((list) => list.filter((a) => a.id !== id));
  }
}
