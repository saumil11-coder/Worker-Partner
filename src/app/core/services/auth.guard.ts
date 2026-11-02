import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';

// [NEW] Route protection. Flow: before opening a page, check the session's role.
// If it matches, allow. Otherwise redirect to the login page ('/').
export const roleGuard = (role: 'customer' | 'employee'): CanActivateFn => () => {
  const auth = inject(AuthService);
  return auth.session()?.role === role ? true : inject(Router).createUrlTree(['/']);
};