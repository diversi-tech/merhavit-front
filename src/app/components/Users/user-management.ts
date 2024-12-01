import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service'; // Import ApiService
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
  users: any[] = []; // מערך המשתמשים

  constructor(private apiService: ApiService) {}
  //  כאשר הדף נטען קריאה לשרת לשלוף את המשתמשים
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
    // הוסף כאן את הלוגיקה לעריכת משתמש
  }

  deleteUser(user: any) {
    console.log('Delete user:', user);
    // הוסף כאן את הלוגיקה למחיקת משתמש
  }
  navigateToPersonalArea(user:any){}
}
