import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistrationService } from '../../core/services/registeration-services';

@Component({
  selector: 'app-register-as-employee',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './register-as-employee.html',
  styleUrl: './register-as-employee.css',
})
export class RegisterAsEmployee {
  registerForm: FormGroup;

  // Track verification status + messages for UI feedback
  aadharVerified = false;
  panVerified = false;
  aadharMessage = '';
  panMessage = '';

  constructor(private fb: FormBuilder, private registrationService: RegistrationService) {
    this.registerForm = this.fb.group({
      // Left Panel Fields
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      aadharNumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      panNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],

      // Right Panel Fields
      address: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],

      // Terms Checkbox
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    // If aadhar/pan number changes after verification, reset the verified flag
    this.registerForm.get('aadharNumber')?.valueChanges.subscribe(() => {
      this.aadharVerified = false;
      this.aadharMessage = '';
    });
    this.registerForm.get('panNumber')?.valueChanges.subscribe(() => {
      this.panVerified = false;
      this.panMessage = '';
    });
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
      this.aadharMessage = 'Enter a valid 12-digit Aadhar number first';
      return;
    }

    const name = this.getFullName();
    if (!name) {
      this.aadharMessage = 'Enter first and last name first';
      return;
    }

    this.registrationService.verifyAadhar(name, aadharValue).subscribe({
      next: (res) => {
        this.aadharVerified = res.verified;
        this.aadharMessage = res.message;
      },
      error: (err) => {
        this.aadharVerified = false;
        this.aadharMessage = err.error?.message || 'Verification failed';
      }
    });
  }

  verifyPan(): void {
    const panControl = this.registerForm.get('panNumber');
    const panValue = panControl?.value;

    if (panControl?.invalid) {
      this.panMessage = 'Enter a valid PAN number first';
      return;
    }

    const name = this.getFullName();
    if (!name) {
      this.panMessage = 'Enter first and last name first';
      return;
    }

    this.registrationService.verifyPan(name, panValue).subscribe({
      next: (res) => {
        this.panVerified = res.verified;
        this.panMessage = res.message;
      },
      error: (err) => {
        this.panVerified = false;
        this.panMessage = err.error?.message || 'Verification failed';
      }
    });
  }

  onSubmit(): void {
    if (!this.aadharVerified || !this.panVerified) {
      alert('Please verify Aadhar and PAN before submitting');
      return;
    }

    if (this.registerForm.valid) {
      this.registrationService.registerCustomer(this.registerForm.value).subscribe({
        next: (res) => alert('Registration Successful!'),
        error: (err) => alert('Registration failed: ' + err.error)
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}