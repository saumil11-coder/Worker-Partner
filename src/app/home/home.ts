import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Custom validator to check for valid Email OR 10-digit Mobile Number
export function emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null; // Let Validators.required handle empty inputs
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9]{10}$/;

  const isValidEmail = emailRegex.test(value);
  const isValidPhone = phoneRegex.test(value);

  return isValidEmail || isValidPhone ? null : { invalidUsername: true };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  homeForm: FormGroup;

  // NEW: selected role (drives button text, register route and login role)
  role: 'customer' | 'employee' = 'customer';

  constructor(private fb: FormBuilder) {
    // Add { updateOn: 'submit' } as the second argument to the group
    this.homeForm = this.fb.group({
      username: ['', [Validators.required, emailOrPhoneValidator]], 
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    }, { updateOn: 'submit' }); 
  }

  // NEW
  setRole(role: 'customer' | 'employee'): void {
    this.role = role;
  }

  onSubmit(): void {
    if (this.homeForm.valid) {
      // NEW: role is added to the payload. Use this wherever you call your login API.
      const payload = { ...this.homeForm.value, role: this.role };
      console.log('Form Submitted Successfully:', payload);
    } else {
      // Optional: Marks all fields as touched so you can display CSS error states
      this.homeForm.markAllAsTouched();
      console.log('Validation Failed');
    } 
  }
}
