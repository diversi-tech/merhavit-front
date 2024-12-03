import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-details.html',
  styleUrls: ['./personal-details.css'],
})
export class PersonalDetailsComponent implements OnInit {
  user = {
    fullName: '',
    idNumber: '',
    address: '',
    phoneNumber: '',
    email: '',
    // password: '',
    class: '',
    specialization: '',
    assignedSeminaryId: '',
  };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idNumber = localStorage.getItem('idNumber');
    if (idNumber) {
      this.loadUserData(idNumber);
    } else {
      console.error('ID number not found in localStorage');
      this.router.navigate(['/login']);
    }
  }

  loadUserData(idNumber: string) {
    this.apiService.Read(`/users/idNumber/${idNumber}`).subscribe(
      (data) => {
        console.log('User data from server:', data);
        this.user = data; 
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  onSubmit() {
    console.log('this.user', this.user);
    this.apiService.Put('/users/update-user', this.user).subscribe(
      (response) => {
        alert('Details updated successfully');
      },
      (error) => {
        console.error('Error updating data:', error);
      }
    );
  }

  cancel() {
    const idNumber = this.route.snapshot.paramMap.get('idNumber');
    if (idNumber) {
      this.loadUserData(idNumber); // טעינה מחדש כדי לאפס שינויים
    }
  }

  goToChangePassword() {
    this.router.navigate(['/change-password']); 
  }
}
