import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class UserManagementComponent implements OnInit {
  users: any[] = []; 

  constructor(private apiService: ApiService) {}
  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.apiService.Read('/users/all').subscribe({
      next: (response) => {
        this.users = response;
      },
      error: (err) => {
        console.error('Error fetching users', err);
      },
    });
  }

  editUser(user: any) {
    console.log('Edit user:', user);
  }

  deleteUser(user: any) {
    console.log('Delete user:', user);
  }
  navigateToPersonalArea(user:any){}
}
