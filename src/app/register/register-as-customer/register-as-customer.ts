import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegistrationService } from '../../core/services/registeration-services';
import { DevModeService } from '../../core/services/dev-mode.services';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-register-as-customer',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink,CommonModule],
  templateUrl: './register-as-customer.html',
  styleUrl: './register-as-customer.css',
})
export class RegisterAsCustomer {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private registrationService: RegistrationService,
      private devMode: DevModeService
  ) {
    this.registerForm = this.fb.group({
      // Left Panel Fields
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      
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
  }

  // Custom validator for password matching
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
 
  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Customer Registration Request:', this.registerForm.value);

      this.registrationService.registerCustomer(this.registerForm.value).subscribe({
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