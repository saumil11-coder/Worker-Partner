import { Component, HostListener, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address, AddressService } from '../../core/services/address.service';

@Component({
  selector: 'app-address-picker',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './address-picker.html',
  styleUrl: './address-picker.css',
})
export class AddressPicker {
  private fb = inject(FormBuilder);
  readonly addressService = inject(AddressService);

  /**
   * 'select' → booking flow: pick a saved address only (no add / edit / delete)
   * 'manage' → profile menu: add, edit and delete addresses
   */
  mode = input<'select' | 'manage'>('select');
  selectedId = input<number | null>(null);

  picked = output<Address>();
  closed = output<void>();

  // manage-mode state
  formOpen = signal(false);
  editingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);

  // select-mode state
  locating = signal(false);
  locationError = signal('');

  form = this.fb.nonNullable.group({
    label: ['Home', Validators.required],
    line1: ['', Validators.required],
    city: ['', Validators.required],
    pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
  });

  // ---------- select mode ----------
  select(address: Address): void {
    this.picked.emit(address);
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationError.set('Location is not supported on this device.');
      return;
    }
    this.locating.set(true);
    this.locationError.set('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.locating.set(false);
        this.picked.emit({
          id: 0,
          label: 'Current',
          line1: 'Current location',
          city: '',
          pincode: '',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        this.locating.set(false);
        this.locationError.set('Could not get your location. Please allow access or pick a saved address.');
      },
    );
  }

  // ---------- manage mode: add / edit ----------
  openAdd(): void {
    this.editingId.set(null);
    this.form.reset();
    this.formOpen.set(true);
  }

  openEdit(address: Address): void {
    this.confirmDeleteId.set(null);
    this.editingId.set(address.id);
    this.form.setValue({
      label: address.label,
      line1: address.line1,
      city: address.city,
      pincode: address.pincode,
    });
    this.formOpen.set(true);
  }

  cancelForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
  }

  saveForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const id = this.editingId();

    if (id === null) {
      this.addressService.add(value);
    } else {
      this.addressService.update(id, value);
    }
    this.cancelForm();
  }

  // ---------- manage mode: delete ----------
  askDelete(address: Address): void {
    this.cancelForm();
    this.confirmDeleteId.set(address.id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(address: Address): void {
    this.addressService.remove(address.id);
    this.confirmDeleteId.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
