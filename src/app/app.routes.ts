import { Routes } from '@angular/router';
import { Register } from './register/register'; 
import { RegisterAsCustomer } from './register/register-as-customer/register-as-customer';
// 1. Add this import for the employee component
import { RegisterAsEmployee } from './register/register-as-employee/register-as-employee'; 

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login').then(m => m.Login) 
  },
  { 
    path: 'register', 
    component: Register,
    children: [
      { path: 'customer', component: RegisterAsCustomer },
      // 2. Uncomment this line to activate the route
      { path: 'employee', component: RegisterAsEmployee } 
    ]
  },
  { 
    path: 'home', 
    loadComponent: () => import('./home/home').then(m => m.Home) 
  },
  { path: '**', redirectTo: 'login' }
];