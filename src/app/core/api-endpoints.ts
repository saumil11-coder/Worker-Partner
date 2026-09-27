import { environment } from "../../environments/environment";
import { RegisterAsCustomer } from "../register/register-as-customer/register-as-customer";


//Holds the full path for each API route, built from the base URL
export const API_ENDPOINTS = {
    RegisterAsCustomer: `${environment.apiUrl}/registercustomer`,
     verifyAadhar: `${environment.apiUrl}/verify/aadhar`,
  verifyPan: `${environment.apiUrl}/api/verify/pan`,
}