import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegistrationService } from '../../core/services/registeration-services';


@Component({
  selector: 'app-register-as-customer',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-as-customer.html',
  styleUrl: './register-as-customer.css',
})
export class RegisterAsCustomer {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private registrationService: RegistrationService) {
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
  }

  // Custom validator for password matching
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Customer Registration Successful:', this.registerForm.value);

      this.registrationService.registerCustomer(this.registerForm.value).subscribe({
        next: (res) => alert('Registration Successful!'),
        error: (err) => alert('Registration failed: ' + err.error)
      });

    } else {
      this.registerForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }
}