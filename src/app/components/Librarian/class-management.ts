import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Class {
  _id: string;
  name: string;
  description: string;
  isEditing: boolean;
  originalName: string;
  originalDescription: string;
}

@Component({
  selector: 'app-specialization-management',
  templateUrl: './class-management.html',
  styleUrls: ['./class-management.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ClassManagementComponent implements OnInit {
  classes: Class[] = []; // שימוש בממשק class
  confirmClass: any = null;
  isAddingClass: boolean = false;
  newClassName: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.apiService.Read('/classes').subscribe({
      next: (data: Class[]) => {
        console.log(data);

        this.classes = data.map((classItem) => ({
          ...classItem,
          originalName: classItem.name,
        }));
      },
      error: (err) => console.error('Error loading classes:', err),
    });
  }

  showConfirmation(classItem: Class): void {
    this.confirmClass = classItem;
  }

  closeConfirmation(): void {
    this.confirmClass = null;
  }

  confirmDeleteClass(): void {
    if (this.confirmClass) {
      console.log(`Deleting class with ID: ${this.confirmClass._id}`);
      const classToDelete = this.confirmClass._id;

      this.apiService
        .Delete('/classes/deleteClass', {
          id: this.confirmClass._id,
        })
        .subscribe({
          next: () => {
            // עדכון הרשימה המקומית לאחר המחיקה
            this.classes = this.classes.filter(
              (classItem) => classItem._id !== classToDelete
            );
            this.confirmClass = null; // איפוס ה-confirmTag לאחר המחיקה
          },
          error: (err) => console.error('Error deleting class:', err),
        });
    } else {
      console.error('No class selected for deletion.');
    }
    this.closeConfirmation();
  }

  editClass(classItem: Class): void {
    if (classItem.isEditing) {
      this.saveClass(classItem);
    } else {
      classItem.isEditing = true;
    }
  }

  saveClass(classItem: Class): void {
    if (classItem.name !== classItem.originalName) {
      this.apiService
        .Put('/classes/updateClass', {
          id: classItem._id,
          name: classItem.name,
        })
        .subscribe({
          next: () => {
            classItem.originalName = classItem.name;
            classItem.isEditing = false;
          },
          error: (err) => console.error('Error updating class:', err),
        });
    } else {
      classItem.isEditing = false;
    }
  }

  addNewClass(): void {
    this.isAddingClass = !this.isAddingClass;
  }

  saveNewClass(): void {
    if (this.newClassName) {
      if (
        typeof window !== 'undefined' &&
        typeof localStorage !== 'undefined'
      ) {
        const createdByIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage

        if (createdByIdNumber) {
          const newClass = {
            name: this.newClassName,
            createdByIdNumber: createdByIdNumber, // מוסיף את ה-ID שנמצא ב-LocalStorage
          };

          // שליחה דרך BODY במקום PARAM
          this.apiService
            .Post('/classes/addClass', newClass)
            .subscribe({
              next: (response) => {
                this.classes.push({
                  _id: response.insertedId,
                  name: this.newClassName,
                  description: '', // ערך ברירת מחדל
                  originalDescription: '', // ערך ברירת מחדל
                  isEditing: false,
                  originalName: this.newClassName,
                });

                // איפוס השדות
                this.isAddingClass = false; // מסתיר את שורת הוספת תגית חדשה
                this.newClassName = '';
              },
              error: (err) => console.error('Error adding class:', err),
            });
        } else {
          console.error('User ID not found in localStorage');
        }
      }
    } else {
      console.error('Access token not found in localStorage');
    }
  }
}
