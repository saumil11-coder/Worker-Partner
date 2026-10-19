import { Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

import { RegistrationService } from '../../core/services/registeration-services';
import { DevModeService } from '../../core/services/dev-mode.services';
import { ServiceCatalogService } from '../../core/services/service-catalog.services';

@Component({
  selector: 'app-register-as-employee',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-as-employee.html',
  styleUrl: './register-as-employee.css',
})
export class RegisterAsEmployee {
  registerForm: FormGroup;

  // Track verification status + messages for UI feedback
  aadharVerified = signal(false);
  panVerified = signal(false);
  aadharMessage = signal('');
  panMessage = signal('');

  showSuccessModal = signal(false);
  showPassword = signal(false);
  activeStep = signal(1);

  // ---------- professions (from backend) ----------
  // ---------- professions (from backend) ----------
professions = signal<string[]>([]);
professionsLoading = signal(true);
professionsError = signal(false);

// currently chosen [profession1, profession2, profession3]
private chosen = signal<(string | null)[]>([null, null, null]);

// Each dropdown hides what is already picked in the others
profession2Options = computed(() => {
  const [a] = this.chosen();
  return this.professions().filter((p) => p !== a);
});
profession3Options = computed(() => {
  const [a, b] = this.chosen();
  return this.professions().filter((p) => p !== a && p !== b);
});

  private readonly messages: Record<string, string> = {
    firstName: 'Enter your first name',
    lastName: 'Enter your last name',
    profession1: 'Pick your primary profession',
    phone: 'Enter a valid 10-digit mobile number',
    address: 'Enter your street address',
    state: 'Enter your state',
    pincode: 'Enter a 6-digit pincode',
    aadharNumber: 'Aadhar must be 12 digits',
    panNumber: 'PAN format: ABCDE1234F',
    email: 'Enter a valid email address',
    password: 'Use at least 6 characters',
    confirmPassword: 'Confirm your password',
  };

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private devMode: DevModeService,
    private router: Router,
    private serviceCatalog: ServiceCatalogService,
  ) {
    this.registerForm = this.fb.group(
      {
        // Personal
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],

        // Professions (1 required, 2 and 3 optional)
       profession1: [null as string | null, Validators.required],
       profession2: [null as string | null],
       profession3: [null as string | null],

        // Address
        address: ['', Validators.required],
        state: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],

        // Identity
        aadharNumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
        panNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],

        // Account
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],

        // Terms Checkbox
        terms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator },
    );
    this.devMode.stripValidators(this.registerForm);

    // If aadhar/pan number changes after verification, reset the verified flag
    this.registerForm.get('aadharNumber')?.valueChanges.subscribe(() => {
      this.aadharVerified.set(false);
      this.aadharMessage.set('');
    });
    this.registerForm.get('panNumber')?.valueChanges.subscribe(() => {
      this.panVerified.set(false);
      this.panMessage.set('');
    });

    // Profession 2 unlocks after 1, profession 3 after 2; duplicates are cleared
    ['profession1', 'profession2', 'profession3'].forEach((name) =>
      this.registerForm.get(name)?.valueChanges.subscribe(() => this.syncProfessions()),
    );
    this.syncProfessions();
    this.loadProfessions();
  }

  // ---------- professions ----------
loadProfessions(): void {
  this.professionsLoading.set(true);
  this.professionsError.set(false);

  this.serviceCatalog.getAllServices().subscribe({   // <-- note the ()
    next: (list) => {
      this.professions.set(list);
      this.professionsLoading.set(false);
    },
    error: () => {
      this.professionsError.set(true);
      this.professionsLoading.set(false);
    },
  });
}
  private syncProfessions(): void {
    const p1 = this.registerForm.get('profession1')!;
    const p2 = this.registerForm.get('profession2')!;
    const p3 = this.registerForm.get('profession3')!;
    const quiet = { emitEvent: false };

    // No duplicates across the three dropdowns
    if (p2.value !== null && p2.value === p1.value) p2.setValue(null, quiet);
    if (p3.value !== null && (p3.value === p1.value || p3.value === p2.value)) p3.setValue(null, quiet);

    // Unlock in order: 1 -> 2 -> 3
    if (p1.value === null) {
      p2.setValue(null, quiet);
      p2.disable(quiet);
    } else {
      p2.enable(quiet);
    }
    if (p2.value === null) {
      p3.setValue(null, quiet);
      p3.disable(quiet);
    } else {
      p3.enable(quiet);
    }

    this.chosen.set([p1.value, p2.value, p3.value]);
  }

  // ---------- form helpers ----------
  fieldError(name: string): string {
    const c = this.registerForm.get(name);
    if (!c || !c.invalid || !(c.touched || c.dirty)) return '';
    if (c.hasError('duplicateEmail')) return '';
    return this.messages[name] ?? 'Invalid value';
  }

  passwordsMismatch(): boolean {
    const c = this.registerForm.get('confirmPassword');
    return !!c && !!c.value && (c.touched || c.dirty) && this.registerForm.hasError('mismatch');
  }

  goToSection(n: number): void {
    this.activeStep.set(n);
    document.getElementById('section-' + n)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  upperPan(): void {
    const c = this.registerForm.get('panNumber');
    const v: string = c?.value ?? '';
    if (v !== v.toUpperCase()) c?.setValue(v.toUpperCase(), { emitEvent: false });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  private getFullName(): string {
    const firstName = this.registerForm.get('firstName')?.value?.trim() || '';
    const lastName = this.registerForm.get('lastName')?.value?.trim() || '';
    return `${firstName} ${lastName}`.trim();
  }

  verifyAadhar(): void {
    const aadharControl = this.registerForm.get('aadharNumber');
    const aadharValue = aadharControl?.value;

    if (aadharControl?.invalid) {
      this.aadharMessage.set('Enter a valid 12-digit Aadhar number first');
      return;
    }

    const name = this.getFullName();
    if (!name) {
      this.aadharMessage.set('Enter first and last name first');
      return;
    }

    this.registrationService.verifyAadhar(name, aadharValue).subscribe({
      next: (res) => {
        console.log('Response received:', res, 'at', new Date().toISOString());
        this.aadharVerified.set(res.verified);
        this.aadharMessage.set(res.message);
      },
      error: (err) => {
        this.aadharVerified.set(false);
        this.aadharMessage.set(err.error?.message || 'Verification failed');
      },
    });
  }

  verifyPan(): void {
    const panControl = this.registerForm.get('panNumber');
    const panValue = panControl?.value;

    if (panControl?.invalid) {
      this.panMessage.set('Enter a valid PAN number first');
      return;
    }

    const name = this.getFullName();
    if (!name) {
      this.panMessage.set('Enter first and last name first');
      return;
    }

    this.registrationService.verifyPan(name, panValue).subscribe({
      next: (res) => {
        this.panVerified.set(res.verified);
        this.panMessage.set(res.message);
      },
      error: (err) => {
        this.panVerified.set(false);
        this.panMessage.set(err.error?.message || 'Verification failed');
      },
    });
  }

  navigateToHome(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/home']);
  }

  onSubmit(): void {
    //Will have to uncomment further
    // if (!this.aadharVerified() || !this.panVerified()) {
    //   alert('Please verify Aadhar and PAN before submitting');
    //   return;
    // }
    if (this.registerForm.valid) {
      console.log('Customer Registration Request:', this.registerForm.value);
      const { profession1, profession2, profession3, ...rest } = this.registerForm.value;

      const payload = {
    ...rest,
    professionList: [profession1, profession2, profession3].filter((p): p is string => !!p),
  };

      this.registrationService.registerEmployee(payload).subscribe({
        next: (res: any) => {
          // Check if controller returned verifyResponse as false
          if (res.verified === false) {
            // Set custom error 'duplicateEmail' directly on the email form control
            this.registerForm.get('email')?.setErrors({ duplicateEmail: true });

            // Mark email field as touched to force validation display in template
            this.registerForm.get('email')?.markAsTouched();
          } else {
            // Proceed with success workflow
            alert('Registration Successful!');
          }
        },
        error: (err) => {
          alert('Registration failed: ' + (err.error?.message || err.error || 'Server error'));
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }
}
