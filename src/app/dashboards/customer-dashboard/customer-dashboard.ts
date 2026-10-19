import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileMenu } from '../../shared/profile-menu/profile-menu';

@Component({
  imports: [RouterLink, ProfileMenu],
  standalone: true,
  selector: 'app-customer-dashboard',
  styleUrl: './customer-dashboard.css',
  templateUrl: './customer-dashboard.html',
})
export class CustomerDashboard {}