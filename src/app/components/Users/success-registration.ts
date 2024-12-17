// success.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success-registration.html',
  styleUrls: ['./success-registration.css'],
  standalone: true,
})
export class SuccessRegistrationComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/next-page']);
    }, 5000);
  }
}
