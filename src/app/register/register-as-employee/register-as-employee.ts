import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { RegistrationService } from '../../core/services/registeration-services';
import { DevModeService } from '../../core/services/dev-mode.services';


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
  aadharVerified = signal(false);
  panVerified = signal(false);
  aadharMessage = signal('');
  panMessage = signal('');

  showSuccessModal = signal(false);


  constructor(private fb: FormBuilder, private registrationService: RegistrationService,
        private devMode: DevModeService,
        private router: Router

  ) {
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
        this.aadharVerified.set(res.verified); //aadharVerified= false
        this.aadharMessage.set(res.message);
      },
      error: (err) => {
        this.aadharVerified.set(false);
        this.aadharMessage.set(err.error?.message || 'Verification failed');
      }
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
      }
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

      this.registrationService.registerEmployee(this.registerForm.value).subscribe({
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
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }
}