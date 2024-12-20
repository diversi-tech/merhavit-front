import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';



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
    address: '',
    phoneNumber: '',
    email: '',
    password: '',
    class: '',
    specialization: '',
    assignedSeminaryId: '',
  };
  activeTab: string = 'personal-details';


  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          const idNumber = decodedToken.idNumber; 
          console.log('idNumber', idNumber);
          if (idNumber) {
            this.loadUserData(idNumber);
          } else {
            console.error('ID number not found in token');
            this.router.navigate(['/login']);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          this.router.navigate(['/login']);
        }
      } else {
        console.error('Access token not found in localStorage');
        this.router.navigate(['/login']);
      }
    } else {
      console.warn('Code is running on the server. Skipping token check.');
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
