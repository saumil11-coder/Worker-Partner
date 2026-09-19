import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../api-endpoints'; // match your actual filename/path
//Holds the actual HTTP call logic (post/get, headers, error handling)
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  constructor(private http: HttpClient) {}

  registerCustomer(data: any) {
    return this.http.post(API_ENDPOINTS.RegisterAsCustomer, data);
  }
}