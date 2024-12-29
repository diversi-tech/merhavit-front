import { Component, OnInit, HostListener } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../../shared/search.service';

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

  searchTerm: string = 'all';
  filterOption: string = '';

  constructor(
    private apiService: ApiService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getUsers();

    // Subscribe לשינויים בנתונים מהשירות
    this.searchService.searchTerm$.subscribe((term) => {
      this.searchTerm = term;
      console.log('searchTerm', this.searchTerm);

      this.filterUsers();
    });

    this.searchService.filterOption$.subscribe((option) => {
      this.filterOption = option;
      console.log('ההסינון', this.filterOption);

      this.filterUsers();
    });
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
    if (user.userType === 'Admin') {
      console.log('Cannot change role for Admin users.');
      return; // אל תפתח את התפריט
    }
    this.selectedUser = this.selectedUser === user ? null : user;
  }

  changeRole(user: any, newRole: string) {
    console.log('changeRole');

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
