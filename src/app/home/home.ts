import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth-service';

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
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  homeForm: FormGroup;
  role: 'customer' | 'employee' = 'customer';

  loginMessage = signal('');
   loginPassed = signal(false);
  loginFailed = signal(false);


  constructor(private fb: FormBuilder, private router: Router,
        private authService: AuthService
  ) {
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
    if (this.homeForm.invalid) {
      this.homeForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.homeForm.value;

    const loginCall = this.role === 'employee'
      ? this.authService.loginEmployee(username, password)
      : this.authService.loginCustomer(username, password);

    loginCall.subscribe({
      next: (res) => {
        
        console.log("hit successfully");
        if(res.verified==="true"){
           this.loginPassed.set(res.verified);
           this.loginMessage.set('Valid');
        }
        else{
          this.loginFailed.set(res.verified);
          this.loginMessage.set('Invalid email/phone or password');
        }
        

        // 🔀 Redirect straight to the right portal on success
        const destination = this.role === 'employee' ? '/employee/dashboard' : '/customer/dashboard';
        this.router.navigate([destination]);
      },
      error: (err) => {
        this.loginFailed.set(true);
        this.loginMessage.set(err.error?.message || 'Invalid email/phone or password');
      }
    });
  }
}
