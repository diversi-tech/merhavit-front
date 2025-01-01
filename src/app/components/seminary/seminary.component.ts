import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';

interface Seminar {
  _id: string;
  name: string;
  location: string
  siteManagerId: string
  librarianIds: Array<string>
  email: string
  isEditing: boolean
  isChanging: boolean
}

@Component({
  selector: 'app-seminary',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelect, MatOption, MatFormField, MatLabel],
  templateUrl: './seminary.component.html',
  styleUrl: './seminary.component.css'
})
export class SeminaryComponent implements OnInit {
  seminaries: Array<any> = []
  librarians: Array<any> = []
  confirmSeminar: any = null;
  isAddingSeminar: boolean = false; // משתנה לצורך הוספת סמינר חדש
  newSeminarName: string = ''; //שם הסמינר החדש
  newSeminarLocation: string = ''; // מיקום הסמינר החדש
  newSeminarEmail: string = ''//אימייל הסמינר החדש
  newLibrarians: Array<string> = []//ספרניות הסמינר החדש


  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadSeminaries();
    this.getLibrarians();
  }

  loadSeminaries(): void {
    this.apiService.Read('/seminaries').subscribe({
      next: (data: Seminar[]) => {
        // if (Array.isArray(data)) {
        //       this.seminaries = data;
        //     } else {
        //       this.seminaries = data.data || []; // ברירת מחדל למערך ריק אם אין נתונים
        //     }
        this.seminaries = data;
        console.log('seminaries', this.seminaries);
      },
      error: (err) => console.error('Error loading seminaries:', err)
    });
  }

  showConfirmation(seminar: Seminar): void {
    this.confirmSeminar = seminar;
  }

  closeConfirmation(): void {
    this.confirmSeminar = null;
  }

  confirmDeleteSeminar(): void {
    const userIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage
    if (this.confirmSeminar) {
      if (userIdNumber === this.confirmSeminar.siteManagerId) {
        console.log(`Deleting Seminar with ID: ${this.confirmSeminar._id}`);
        const SeminarToDelete = this.confirmSeminar._id;

        this.apiService.Delete(`/seminaries/${SeminarToDelete}`, {})
          .subscribe({
            next: () => {
              // עדכון הרשימה המקומית לאחר המחיקה
              this.seminaries = this.seminaries.filter(seminar => seminar._id !== SeminarToDelete);
              this.confirmSeminar = null; // איפוס ה-confirmSeminar לאחר המחיקה
            },
            error: (err) => console.error('Error deleting Seminar:', err)
          });
      } else {
        console.error('cannot delete other seminar.');
      }
    } else {
      console.error('No Seminar selected for deletion.');
    }
    this.closeConfirmation();
  }

  onChangeFieldsSeminar(seminar: Seminar) {
    console.log("change Seminar");
    seminar.isChanging = true
  }

  addLibrarian(seminar: Seminar, librarianId: string) {
    this.onChangeFieldsSeminar(seminar);
    seminar.librarianIds.push(librarianId)
  }

  removeLibrarian(seminar: Seminar, librarianId: string) {
    this.onChangeFieldsSeminar(seminar);
    const index = seminar.librarianIds.indexOf(librarianId);
    if (index >= 0) {
      seminar.librarianIds.splice(index, 1)
    }
  }

  editSeminar(Seminar: Seminar): void {
    if (Seminar.isEditing) {
      this.saveSeminar(Seminar);
    } else {
      Seminar.isEditing = true;
    }
  }

  saveSeminar(Seminar: Seminar): void {
    if (Seminar.isChanging) {
      this.apiService.Put(`/seminaries/${Seminar._id}`,
        {
          _id: Seminar._id,    //body
          name: Seminar.name,
          location: Seminar.location,
          email: Seminar.email,
          librarianIds: Seminar.librarianIds
        }).subscribe({
          next: (response) => {
            Seminar.isEditing = false;
            Seminar.isChanging = false;
          },
          error: (err) => console.error('Error updating Seminar:', err)
        });
    } else {
      Seminar.isEditing = false;
      Seminar.isChanging = false;
    }

  }

  addNewSeminar(): void {
    this.isAddingSeminar = !this.isAddingSeminar;
  }

  saveNewSeminar(): void {
    if (this.newSeminarName && this.newSeminarLocation && this.newSeminarEmail) {
      const createdByIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage

      if (createdByIdNumber) {
        const newSeminar = {
          name: this.newSeminarName,
          location: this.newSeminarLocation,
          email: this.newSeminarEmail,
          librarianIds: this.newLibrarians,  //להוסיף את הספרניות 
          siteManagerId: createdByIdNumber,
        };

        // שליחה דרך BODY במקום PARAM
        this.apiService.Post("/seminaries", newSeminar).subscribe({
          next: (response) => {

            // לאחר ההוספה, הוספת התגית החדשה לא רק למחסנית אלא גם למערך ה-Seminars
            this.seminaries.push({
              _id: response.data._id, // מוודא שאתה מקבל את ה-ID שהשרת מחזיר
              name: this.newSeminarName,
              location: this.newSeminarLocation,
              email: this.newSeminarEmail,
              siteManagerId: createdByIdNumber,
              librarianIds: this.newLibrarians,
              isEditing: false,
              isChanging: false
            });

            // איפוס השדות
            this.isAddingSeminar = false; // מסתיר את שורת הוספת תגית חדשה
            this.newSeminarName = '';
            this.newSeminarLocation = '';
            this.newSeminarEmail = '';
            this.newLibrarians = [];

          },
          error: (err) => console.error('Error adding Seminar:', err),
        });
      } else {
        console.error('User ID not found in localStorage');
      }
    }
  }

  getLibrarianById(librarianId: string): string {

    const findLibrarian=this.librarians.find(lib=>lib._id===librarianId)
    console.log("librarian",findLibrarian);
    
    if(findLibrarian)
    {
      return findLibrarian.firstName+" "+findLibrarian.lastName
    }
    return 'Unknown'
  }


  getLibrarians() {
    this.apiService.Read('/users/all').subscribe({
      next: (response: any[]) => {
        this.librarians = response.filter(user => user.userType === "Librarian");
      },
      error: (err) => {
        console.error('Error fetching users', err);
      },
    });
  }

  filterLibrarianBySeminar(seminar: Seminar): any[] {

    const filterArray = this.librarians.filter(lib => lib.assignedSeminaryId === seminar._id)
    return filterArray
  }

}
