import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
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
    classId: '',
    specialization: '',
    assignedSeminaryId: '',
  };
  activeTab: string = 'personal-details';
  originalUser: any = {};
  seminaries: any[] = [];
  specializations: any[] = [];
  classes: any[] = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar
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
                this.apiService.Read(`/users/idNumber/${idNumber}`).subscribe(
                  (userData) => {
                    console.log('User data from server:', userData);
                    this.user = userData; // עדכון כל הנתונים של המשתמש
                    this.originalUser = userData;
                  },
                  (error) => {
                    console.error('Error fetching user data:', error);
                  }
                );
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

  onSubmit() {
    console.log('this.user before submit', this.user);
    this.apiService.Put('/users/update-user', this.user).subscribe(
      (response) => {
        this._snackBar.open('הפרטים האישיים עודכנו בהצלחה!', 'סגור', {
          duration: 2000,
          panelClass: ['my-custom-snackbar'],
          direction: 'rtl',
        });
      },
      (error) => {
        console.error('Error updating data:', error);
        // שליפת ההודעה מתוך אובייקט השגיאה
        const errorMessage =
          error?.error?.message ||
          'אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.';

        // הצגת הודעת השגיאה ב-SnackBar
        this._snackBar.open(errorMessage, 'סגור', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          direction: 'rtl',
        });
      }
    );
  }

  cancel() {
    this.user = { ...this.originalUser }; // שחזור נתוני המשתמש המקוריים
    console.log('this.user', this.user);
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
