// src/app/core/services/auth.service.ts
import { HttpClient,HttpParams  } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_ENDPOINTS } from '../api-endpoints';

export interface Session {
  token: string;
  name: string;
  role: 'customer' | 'employee';
}
interface LoginResponse {
  verified: boolean;
  token: string;
  name: string;
}
 
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  // [NEW] The session as a signal. On first load it is restored from localStorage,
  // so a page refresh does not log the user out.
  private readonly _session = signal<Session | null>(this.restore());

  // [NEW] Read-only views of the session for other components.
  readonly session = this._session.asReadonly();
  readonly isLoggedIn = computed(() => this._session() !== null);
  readonly token = computed(() => this._session()?.token ?? null);

  // [CHANGED] Before: GET with HttpParams. Now: POST with a body.
  // Flow: send credentials -> backend replies with token -> tap() saves the session
  // -> the response still goes on to home.ts.
  loginEmployee(username: string, password: string) {
    return this.http
      .post<LoginResponse>(API_ENDPOINTS.loginEmployee, { username, password })
      .pipe(tap((res) => this.save(res, 'employee')));
  }

    // [CHANGED] Same as above, for customers.
  loginCustomer(username: string, password: string) {
    return this.http
      .post<LoginResponse>(API_ENDPOINTS.loginCustomer, { username, password })
      .pipe(tap((res) => this.save(res, 'customer')));
  }

  // [NEW] Wipes the session from memory and from the browser.
  logout(): void {
    this._session.set(null);
    localStorage.removeItem('session');
  }

  // [NEW] Called after login. If the credentials were wrong, nothing is stored.
  private save(res: LoginResponse, role: 'customer' | 'employee'): void {
    if (!res.verified) return;
    const s: Session = { token: res.token, name: res.name, role };
    this._session.set(s);
    localStorage.setItem('session', JSON.stringify(s));
  }

  // [NEW] Reads the saved session at startup. Returns null if none or corrupted.
  private restore(): Session | null {
    try {
      const raw = localStorage.getItem('session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
 
}