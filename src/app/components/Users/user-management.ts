import { Component, OnInit, HostListener } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../../shared/search.service';
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
  selectedUser: any = null; // המשתמש שתפריט התפקיד שלו פתוח
  confirmUser: any = null;
  filteredUsers = [...this.users];
  loggedInUserRole: any = null; // המשתמש שתפריט התפקיד שלו פתוח

  searchTerm: string = 'all';
  filterOption: string = '';

  constructor(
    private apiService: ApiService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getUsers();
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.setUserRole();
    } else {
      console.error('localStorage is not available on the server.');
    }
    // Subscribe לשינויים בנתונים מהשירות
    this.searchService.searchTerm$.subscribe((term) => {
      this.searchTerm = term;

      this.filterUsers();
    });

    this.searchService.filterOption$.subscribe((option) => {
      this.filterOption = option;
      console.log('ההסינון', this.filterOption);

      this.filterUsers();
    });
  }
  // פונקציה לקבלת התפקיד מתוך ה-Token
  private setUserRole(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.loggedInUserRole = decodedToken.userType || null;
      } catch (error) {
        console.error('Failed to decode token', error);
        this.loggedInUserRole = null;
      }
    }
  }
  getUsers() {
    this.apiService.Read('/users/all').subscribe({
      next: (response) => {
        this.users = response;
        this.filterUsers(); // סינון המשתמשים גם לאחר קבלת הנתונים
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
    if (user.userType === 'Admin'||this.loggedInUserRole==='Librarian'||this.loggedInUserRole==='Student'||(this.loggedInUserRole==='Site Manager'&&user.userType==='Site Manager')) {
      console.log('Cannot change role for Admin users.');
      return; // אל תפתח את התפריט
    }
    this.selectedUser = this.selectedUser === user ? null : user;
  }

  changeRole(user: any, newRole: string) {
    // בקרת הרשאות לשינוי תפקידים
    if (this.loggedInUserRole === 'Admin') {
      // Admin יכול לשנות לכל תפקיד
      if (['Site Manager', 'Librarian', 'Student'].includes(newRole)) {
        this.executeRoleChange(user, newRole);
      } else {
        console.error('Admin cannot assign this role:', newRole);
      }
    } else if (this.loggedInUserRole === 'Site Manager') {
      // Site Manager יכול לשנות רק ל-Librarian ו-Site Manager
      if (['Librarian', 'Site Manager'].includes(newRole)) {
        this.executeRoleChange(user, newRole);
      } else {
        console.error('Site Manager cannot assign this role:', newRole);
      }
    } else {
      // משתמשים אחרים לא יכולים לשנות תפקידים
      console.error('User is not authorized to change roles.');
    }
  }

  executeRoleChange(user: any, newRole: string) {
    const data = {
      idNumber: user.idNumber,
      newRole: newRole,
    };

    this.apiService.Put(`/users/updateRole`, data).subscribe({
      next: (response) => {
        console.log(`Role updated to ${newRole} for user:`, user);
        user.userType = newRole; // עדכון התפקיד בממשק
        this.selectedUser = null; // סגירת תפריט התפקידים
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

  filterUsers() {
    console.log('on filter users');

    let tempUsers = [...this.users];

    // אם יש מילת חיפוש
    if (this.filterOption) {
      const filterOption = this.filterOption.split(' '); // מפצל את ה-filterOption למילים בודדות

      tempUsers = tempUsers.filter((user) => {
        return filterOption.every((term) => {
          // נוודא שכל מילה תתאים לשדה המתאים שלה (key:value)
          const [key, value] = term.split(':'); // מפרק כל מילה למפתח וערך
          if (key && value) {
            // אם יש מפתח וערך, נבדוק אם השדה של המשתמש מכיל את הערך הזה
            return (
              user[key] &&
              user[key].toString().toLowerCase().includes(value.toLowerCase())
            );
          }
          return true; // אם אין מפתח וערך, לא משפיע על הסינון
        });
      });

      console.log('tempUsers after filterOption filter', tempUsers);

      // אם לא נמצא שום תוצאה אחרי הסינון, הצג את כל המשתמשים
      if (tempUsers.length === 0) {
        tempUsers = [...this.users];
      }
    }

    // סינון לפי אופציית הסינון (אם לא 'all')
    if (this.searchTerm !== 'all') {
      tempUsers = tempUsers.filter((user) => {
        return Object.values(user).some((field) => {
          if (typeof field === 'string') {
            return field
              .toString()
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase());
          }
          return false; // התעלם משדות שאינם מסוג string או number
        });
      });
    }

    // עדכון רשימת המשתמשים המסוננים
    this.filteredUsers = tempUsers;
  }
}
