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
    firstName: '',
    lastName: '',
    phone: '',
    mobile: '',
    street: '',
    city: '',
    specialization: '',
    role: '',
  };
  activeTab: string = 'personal-details';


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
    const idNumber = localStorage.getItem('idNumber'); 
    if (idNumber) {
      this.loadUserData(idNumber); 
    }
    else {
      console.error('ID number not found in localStorage');
    }
  }

  goToChangePassword() {
    this.router.navigate(['/change-password']); 
  }
  navigateTo(tab: string) {
    this.activeTab = tab;
    switch (tab) {
      case 'returns':
        this.router.navigate(['/returns']);
        break;
      case 'activity-questions':
        this.router.navigate(['/activity-questions']);
        break;
      case 'orders':
        this.router.navigate(['/orders']);
        break;
      case 'favorites':
        this.router.navigate(['/favorites']);
        break;
      case 'notifications':
        this.router.navigate(['/notifications']);
        break;
      default:
        this.router.navigate(['/personal-details']);
    }
  }
}
