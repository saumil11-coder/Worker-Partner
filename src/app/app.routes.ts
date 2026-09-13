import { Routes } from '@angular/router';
import { Register } from './register/register'; 
import { RegisterAsCustomer } from './register/register-as-customer/register-as-customer';

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
      // { path: 'employee', component: RegisterAsEmployee } 
    ]
  },
  { 
    path: 'home', 
    loadComponent: () => import('./home/home').then(m => m.Home) 
  }
   ,
   { path: '**', redirectTo: 'RegisterAsCustomer' }
];