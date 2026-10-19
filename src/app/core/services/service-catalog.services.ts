import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../api-endpoints';

export interface ServiceCategory {
  id: number;
  name: string;
  iconKey: string;   // e.g. 'plumbing' → drawn by <app-service-icon>
  baseRate: number;  // ₹ per hour
}

export interface PagedResponse<T> {
  content: T[];
  page: number;          // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  constructor(private http: HttpClient) {}

  /** page is 1-based here (the backend is 0-based, converted below). q = optional name filter. */
  getServices(page = 1, size = 8, query = '') {
    let params = new HttpParams().set('page', page - 1).set('size', size);
    
      params = params.set('query', query);
    
    return this.http.get<PagedResponse<ServiceCategory>>(API_ENDPOINTS.services, { params });
  }

    getAllServices() {
    
    return this.http.get<string[]>(API_ENDPOINTS.allprofessions);
  }
}

/*
  api-endpoints.ts needs this line:

    services: `${environment.apiUrl}/api/services`,
*/
