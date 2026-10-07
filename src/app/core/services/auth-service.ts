// src/app/core/services/auth.service.ts
import { HttpClient,HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../api-endpoints';


 
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}


  loginEmployee(username: string, password: string) {
   const params = new HttpParams()
      .set('username', username)
      .set('password', password);
       return this.http.get<any>(API_ENDPOINTS.loginEmployee, { params });
  }

    loginCustomer(username: string, password: string) {
   const params = new HttpParams()
      .set('username', username)
      .set('password', password);
       return this.http.get<any>(API_ENDPOINTS.loginCustomer, { params });
  }
 
}