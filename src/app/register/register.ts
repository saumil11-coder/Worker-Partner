import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterOutlet],
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {}