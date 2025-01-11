// success.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-question-successful',
  templateUrl: './question-successful.html',
  styleUrls: ['./question-successful.css'],
  standalone: true,
})
export class QuestionSuccessfulComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/show-details']);
    }, 4000);
  }
}
