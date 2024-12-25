import { Component, OnInit, HostListener } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { log } from 'node:console';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null; // המשתמש שתפריט התפקיד שלו פתוח
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
    const data = { idNumber: user.idNumber };
    this.apiService.Delete('/users/deleteUser', data).subscribe({
      next: () => {
        console.log('User deleted:', user);
        this.users = this.users.filter((u) => u.idNumber !== user.idNumber); // הסרת המשתמש מהרשימה
      },
      error: (err) => {
        console.error('Error deleting user', err);
      },
    });
  }

  toggleRoleMenu(user: any) {
    if (user.userType === 'Admin') {
      console.log('Cannot change role for Admin users.');
      return; // אל תפתח את התפריט
    }
    this.selectedUser = this.selectedUser === user ? null : user;
  }

  changeRole(user: any, newRole: string) {
    console.log("changrRole");
    
    const data = {
      idNumber: user.idNumber, // חובה לוודא שהוא נכון
      newRole: newRole, // מפתח צריך להיות "newRole" כדי להתאים לצד השרת
    };
    this.apiService.Put(`/users/updateRole`, data).subscribe({
      next: (response) => {
        console.log(`Role updated to ${newRole} for user:`, user);
        user.userType = newRole; // עדכון תפקיד בממשק
        this.selectedUser = null; // סגירת התפריט לאחר שינוי התפקיד
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

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.role-menu') && !target.closest('.action-button')) {
      this.selectedUser = null; // סגור את התפריט אם לוחצים מחוצה לו
    }
  }
}
