import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class UserManagementComponent implements OnInit {
  users: any[] = []; 
  selectedUser: any = null;
  confirmUser: any = null;


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

  deleteUser(user: any) {
    const data = { idNumber: user.idNumber }; // שלח את idNumber בגוף הבקשה
    this.apiService.Delete('/users/deleteUser', data).subscribe({
        next: (response) => {
            console.log('User deleted:', user);
            // הסר את המשתמש מהמַערך המקומי
            this.users = this.users.filter(u => u.id !== user.id);
        },
        error: (err) => {
            console.error('Error deleting user', err);
        },
    });
}

  
  
  toggleRoleMenu(user: any) {
    if (this.selectedUser === user) {
      this.selectedUser = null; // אם המשתמש כבר נבחר, נסגור את התפריט
    } else {
      this.selectedUser = user; // פתח את התפריט עבור המשתמש
    }
  }

  changeRole(user: any, newRole: string) {
    user.role = newRole; // עדכון התפקיד של המשתמש
    this.apiService.Put(`/users/updateRole/${user.id}`, { role: newRole }).subscribe({
      next: (response) => {
        console.log(`Role updated to ${newRole} for user:`, user);
        this.selectedUser = null; // סגור את התפריט לאחר שינוי התפקיד
      },
      error: (err) => {
        console.error('Error updating role', err);
      },
    });
  }
  showConfirmation(user: any) {
    this.confirmUser = user;
  }
  
  closeConfirmation() {
    this.confirmUser = null;
  }
  
  confirmDeleteUser() {
    if (this.confirmUser) {
      this.deleteUser(this.confirmUser);
      this.closeConfirmation();
    }
  }
 
}
