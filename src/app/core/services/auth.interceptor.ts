import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth-service';


// [NEW] Runs automatically for EVERY HTTP request in the app.
// Flow: take the token from the session -> add "Authorization: Bearer <token>" header
// -> send the request. If the server answers 401 (token expired or invalid),
// log the user out and send them to the login page.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();

  // Requests are immutable in Angular, so we clone and add the header.
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req; // not logged in (e.g. the login call itself): send as is

     return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/login')) {
        auth.logout();
        router.navigate(['/']);
      }
      return throwError(() => err); // let the caller still see the error
    }),
  );
};