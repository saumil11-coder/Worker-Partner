import { Component,inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileMenu } from '../../shared/profile-menu/profile-menu';
import { AuthService } from '../../core/services/auth-service';

@Component({
  imports: [RouterLink, ProfileMenu],
  standalone: true,
  selector: 'app-customer-dashboard',
  styleUrl: './customer-dashboard.css',
  templateUrl: './customer-dashboard.html',
})
export class CustomerDashboard {
  // [NEW] Exposes the logged-in user's session to the template (for the name).
  session = inject(AuthService).session;
}