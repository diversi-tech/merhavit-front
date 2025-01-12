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
  filteredUsers = [...this.users];
  selectedUser: any = null; // המשתמש שתפריט התפקיד שלו פתוח
  confirmUser: any = null;
  loggedInUserRole: any = null; // התפקיד של המשתמש המחובר
  searchTerm: string = 'all';
  filterOption: string = '';
  seminaries: any[] = [];
  specializations: any[] = [];
  classes: any[] = [];
  readonly roleTranslations: { [key: string]: string } = {
    'Admin': 'מנהל',
    'Site Manager': 'מנהל סמינר',
    'Librarian': 'ספרנית',
    'Student': 'סטודנט'
  };

  constructor(
    private apiService: ApiService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.getUsers();
    this.setUserRole();
    this.subscribeToSearchService();
  }

  loadData() {
    // טוען סמינרים, התמחויות וכיתות תחילה
    this.apiService.Read('/seminaries').subscribe(
      (seminariesData: any[]) => {
        this.seminaries = seminariesData;

        this.apiService.Read('/specializations').subscribe(
          (specializationsData: any[]) => {
            this.specializations = specializationsData;

            this.apiService.Read('/classes').subscribe(
              (classesData: any[]) => {
                this.classes = classesData;

                // כעת טוען את פרטי המשתמש
                this.getUsers();

              },
              (error) => {
                console.error('Error fetching classes:', error);
              }
            );
          },
          (error) => {
            console.error('Error fetching specializations:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching seminaries:', error);
      }
    );
  }

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

  getUsers(): void {
    this.apiService.Read('/users/all').subscribe({
      next: (response: any[]) => {
        this.users = response;
        this.filterUsers(); // עדכון הרשימה המסוננת לאחר קבלת הנתונים
      },
      error: (err) => {
        console.error('Error fetching users', err);
      },
    });
  }

  deleteUser(user: any): void {
    const data = { idNumber: user.idNumber };
    this.apiService.Delete('/users/deleteUser', data).subscribe({
      next: () => {
        console.log('User deleted:', user);
        this.users = this.users.filter((u) => u.idNumber !== user.idNumber);
        this.filterUsers(); // עדכון הרשימה המסוננת לאחר מחיקת משתמש
      },
      error: (err) => {
        console.error('Error deleting user', err);
      },
    });
  }

  toggleRoleMenu(user: any): void {
    if (user.userType === 'Admin' || this.loggedInUserRole === 'Librarian' || this.loggedInUserRole === 'Student' || (this.loggedInUserRole === 'Site Manager' && user.userType === 'Site Manager')) {
      console.log('Cannot change role for this user.');
      return;
    }
    this.selectedUser = this.selectedUser === user ? null : user;
  }

  changeRole(user: any, newRole: string): void {
    if (this.loggedInUserRole === 'Admin' && ['Site Manager', 'Librarian', 'Student'].includes(newRole)) {
      this.executeRoleChange(user, newRole);
    } else if (this.loggedInUserRole === 'Site Manager' && ['Librarian', 'Site Manager'].includes(newRole)) {
      this.executeRoleChange(user, newRole);
    } else {
      console.error('User is not authorized to change roles.');
    }
  }

  executeRoleChange(user: any, newRole: string): void {
    const data = { idNumber: user.idNumber, newRole };
    this.apiService.Put('/users/updateRole', data).subscribe({
      next: () => {
        console.log(`Role updated to ${newRole} for user:`, user);
        user.userType = newRole;
        this.selectedUser = null;
      },
      error: (err) => {
        console.error('Error updating role', err);
      },
    });
  }

  showConfirmation(user: any): void {
    this.confirmUser = user;
  }

  closeConfirmation(): void {
    this.confirmUser = null;
  }

  confirmDeleteUser(): void {
    if (this.confirmUser) {
      this.deleteUser(this.confirmUser);
      this.closeConfirmation();
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.role-menu') && !target.closest('.action-button')) {
      this.selectedUser = null;
    }
  }

  filterUsers(): void {
    let tempUsers = [...this.users];
  
    if (this.filterOption) {
      const filterOption = this.filterOption.split(' ');
      tempUsers = tempUsers.filter((user) =>
        filterOption.every((term) => {
          const [key, value] = term.split(':');
          if (key && value) {
            const fieldValue = user[key]?.toString().toLowerCase();
  
            // אם המפתח הוא userType, יש לתרגם את הערך מאנגלית לעברית
            if (key === 'userType') {
              const translatedValue = this.roleTranslations[user[key]]?.toLowerCase();
              return translatedValue?.includes(value.toLowerCase());
            }
  
            return fieldValue?.includes(value.toLowerCase());
          }
          return true;
        })
      );
    }
  
    if (this.searchTerm !== 'all') {
      tempUsers = tempUsers.filter((user) =>
        Object.values(user).some((field) =>
          typeof field === 'string' && field.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }
  
    this.filteredUsers = tempUsers;
  }
  

  private subscribeToSearchService(): void {
    this.searchService.searchTerm$.subscribe((term) => {
      this.searchTerm = term;
      this.filterUsers();
    });

    this.searchService.filterOption$.subscribe((option) => {
      this.filterOption = option;
      this.filterUsers();
    });
  }

  getEntityName(entityId: string, entities: any[]): string {
    const entity = entities.find(ent => ent._id === entityId);
    return entity ? entity.name : 'N/A';
  }
}
