import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Subject {
  _id: string;
  name: string;
  description: string;
  isEditing: boolean;
  originalName: string;
  originalDescription: string;
}

@Component({
  selector: 'app-subject-management',
  templateUrl: './subject-management.html',
  styleUrls: ['./subject-management.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SubjectManagementComponent implements OnInit {
  subjects: Subject[] = []; // שימוש בממשק Subject
  confirmSubject: any = null;
  isAddingSubject: boolean = false; // משתנה לצורך הוספת תגית חדשה
  newSubjectName: string = ''; // שם התגית החדשה
  newSubjectDescription: string = ''; // תיאור התגית החדשה

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.apiService.Read('/subjects/getAll').subscribe({
      next: (data: Subject[]) => {
        console.log(data);

        this.subjects = data.map((subject) => ({
          ...subject,
          originalName: subject.name,
          originalDescription: subject.description,
        }));
      },
      error: (err) => console.error('Error loading subjects:', err),
    });
  }

  showConfirmation(subject: Subject): void {
    this.confirmSubject = subject;
  }

  closeConfirmation(): void {
    this.confirmSubject = null;
  }

  confirmDeleteSubject(): void {
    if (this.confirmSubject) {
      console.log(`Deleting subject with ID: ${this.confirmSubject._id}`);
      const subjectToDelete = this.confirmSubject._id;

      this.apiService
        .Delete('/subjects/deleteSubject', { id: this.confirmSubject._id })
        .subscribe({
          next: () => {
            // עדכון הרשימה המקומית לאחר המחיקה
            this.subjects = this.subjects.filter(
              (subject) => subject._id !== subjectToDelete
            );
            this.confirmSubject = null; // איפוס ה-confirmSubject לאחר המחיקה
          },
          error: (err) => console.error('Error deleting subject:', err),
        });
    } else {
      console.error('No subject selected for deletion.');
    }
    this.closeConfirmation();
  }

  editSubject(subject: Subject): void {
    if (subject.isEditing) {
      this.saveSubject(subject);
    } else {
      subject.isEditing = true;
    }
  }

  saveSubject(subject: Subject): void {
    if (
      subject.name !== subject.originalName ||
      subject.description !== subject.originalDescription
    ) {
      // שינוי: שליחה דרך BODY במקום PARAM
      this.apiService
        .Put('/subjects/updateSubject', {
          id: subject._id,
          name: subject.name,
          description: subject.description,
        })
        .subscribe({
          next: () => {
            subject.originalName = subject.name;
            subject.originalDescription = subject.description;
            subject.isEditing = false;
          },
          error: (err) => console.error('Error updating subject:', err),
        });
    } else {
      subject.isEditing = false;
    }
  }

  addNewSubject(): void {
    this.isAddingSubject = !this.isAddingSubject;
  }

  saveNewSubject(): void {
    if (this.newSubjectName && this.newSubjectDescription) {
      if (
        typeof window !== 'undefined' &&
        typeof localStorage !== 'undefined'
      ) {
        const createdByIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage

        if (createdByIdNumber) {
          const newSubject = {
            name: this.newSubjectName,
            description: this.newSubjectDescription,
            createdByIdNumber: createdByIdNumber, // מוסיף את ה-ID שנמצא ב-LocalStorage
          };

          // שליחה דרך BODY במקום PARAM
          this.apiService.Post('/subjects/addSubject', newSubject).subscribe({
            next: (response) => {
              // לאחר ההוספה, הוספת התגית החדשה לא רק למחסנית אלא גם למערך ה-subjects
              this.subjects.push({
                _id: response.insertedId, // מוודא שאתה מקבל את ה-ID שהשרת מחזיר
                name: this.newSubjectName,
                description: this.newSubjectDescription,
                isEditing: false, // אפשר להוסיף גם ערכים נוספים אם נדרשים
                originalName: this.newSubjectName,
                originalDescription: this.newSubjectDescription,
              });

              // איפוס השדות
              this.isAddingSubject = false; // מסתיר את שורת הוספת תגית חדשה
              this.newSubjectName = '';
              this.newSubjectDescription = '';
            },
            error: (err) => console.error('Error adding subject:', err),
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
