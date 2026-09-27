import { HttpClient,HttpParams  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../api-endpoints'; // match your actual filename/path
//Holds the actual HTTP call logic (post/get, headers, error handling)
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  constructor(private http: HttpClient) {}

  registerCustomer(data: any) {
    return this.http.post(API_ENDPOINTS.RegisterAsCustomer, data);
  }
   verifyAadhar(name: string, aadharNumber: string) {
    const params = new HttpParams()
      .set('name', name)
      .set('aadharNumber', aadharNumber);
    return this.http.get<any>(API_ENDPOINTS.verifyAadhar, { params });
  }

  verifyPan(name: string, panNumber: string) {
    const params = new HttpParams()
      .set('name', name)
      .set('panNumber', panNumber);
    return this.http.get<any>(API_ENDPOINTS.verifyPan, { params });
  }
    registerEmployee(data: any) {
    return this.http.post(API_ENDPOINTS.RegisterAsEmployee, data);
  }
  
}