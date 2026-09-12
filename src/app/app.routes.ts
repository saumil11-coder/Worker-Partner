import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login').then(m => m.Login) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./register/register').then(m => m.Register) 
  },
  { 
    path: 'home', 
    loadComponent: () => import('./home/home').then(m => m.Home) 
  },
  { path: '**', redirectTo: 'login' }
];