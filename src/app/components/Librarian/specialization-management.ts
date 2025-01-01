import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Specialization {
  _id: string;
  name: string;
  //   description: string;
  isEditing: boolean;
  originalName: string;
  //   originalDescription: string;
}

@Component({
  selector: 'app-specialization-management',
  templateUrl: './specialization-management.html',
  styleUrls: ['./specialization-management.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SpecializationManagementComponent implements OnInit {
  specializations: Specialization[] = []; // שימוש בממשק Tag
  confirmSpecialization: any = null;
  isAddingSpecialization: boolean = false; // משתנה לצורך הוספת תגית חדשה
  newSpecializationName: string = ''; // שם התגית החדשה
  //   newTagDescription: string = ''; // תיאור התגית החדשה

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSpecializations();
  }

  loadSpecializations(): void {
    this.apiService.Read('/specializations').subscribe({
      next: (data: Specialization[]) => {
        console.log(data);

        this.specializations = data.map((specialization) => ({
          ...specialization,
          originalName: specialization.name,
          //   originalDescription: tag.description,
        }));
      },
      error: (err) => console.error('Error loading specializations:', err),
    });
  }

  showConfirmation(specialization: Specialization): void {
    this.confirmSpecialization = specialization;
  }

  closeConfirmation(): void {
    this.confirmSpecialization = null;
  }

  confirmDeleteSpecialization(): void {
    if (this.confirmSpecialization) {
      console.log(
        `Deleting specialization with ID: ${this.confirmSpecialization._id}`
      );
      const specializationToDelete = this.confirmSpecialization._id;

      this.apiService
        .Delete('/specializations/deleteSpecialization', {
          id: this.confirmSpecialization._id,
        })
        .subscribe({
          next: () => {
            // עדכון הרשימה המקומית לאחר המחיקה
            this.specializations = this.specializations.filter(
              (specialization) => specialization._id !== specializationToDelete
            );
            this.confirmSpecialization = null; // איפוס ה-confirmTag לאחר המחיקה
          },
          error: (err) => console.error('Error deleting specialization:', err),
        });
    } else {
      console.error('No specialization selected for deletion.');
    }
    this.closeConfirmation();
  }

  editSpecialization(specialization: Specialization): void {
    if (specialization.isEditing) {
      this.saveSpecialization(specialization);
    } else {
      specialization.isEditing = true;
    }
  }

  saveSpecialization(specialization: Specialization): void {
    if (
      specialization.name !== specialization.originalName
      //     ||
      //   tag.description !== tag.originalDescription
    ) {
      // שינוי: שליחה דרך BODY במקום PARAM
      this.apiService
        .Put('/specializations/updateSpecialization', {
          id: specialization._id,
          name: specialization.name,
          //   description: tag.description,
        })
        .subscribe({
          next: () => {
            specialization.originalName = specialization.name;
            // tag.originalDescription = tag.description;
            specialization.isEditing = false;
          },
          error: (err) => console.error('Error updating specialization:', err),
        });
    } else {
      specialization.isEditing = false;
    }
  }

  addNewSpecialization(): void {
    this.isAddingSpecialization = !this.isAddingSpecialization;
  }

  saveNewSpecialization(): void {
    if (this.newSpecializationName) {
      if (
        typeof window !== 'undefined' &&
        typeof localStorage !== 'undefined'
      ) {
        const createdByIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage

        if (createdByIdNumber) {
          const newSpecialization = {
            name: this.newSpecializationName,
            //   description: this.newTagDescription,
            createdByIdNumber: createdByIdNumber, // מוסיף את ה-ID שנמצא ב-LocalStorage
          };

          // שליחה דרך BODY במקום PARAM
          this.apiService
            .Post('/Specializations/addSpecialization', newSpecialization)
            .subscribe({
              next: (response) => {
                this.specializations.push({
                  _id: response.insertedId,
                  name: this.newSpecializationName,
                  isEditing: false,
                  originalName: this.newSpecializationName,
                });

                // איפוס השדות
                this.isAddingSpecialization = false; // מסתיר את שורת הוספת תגית חדשה
                this.newSpecializationName = '';
              },
              error: (err) =>
                console.error('Error adding specialization:', err),
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
