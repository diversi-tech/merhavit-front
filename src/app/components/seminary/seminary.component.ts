import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';

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
  librarians$: Observable<any[]> | undefined;
  users:Array<any>=[]
  confirmSeminar: any = null;
  isAddingSeminar: boolean = false; // משתנה לצורך הוספת סמינר חדש
  newSeminarName: string = ''; //שם הסמינר החדש
  newSeminarLocation: string = ''; // מיקום הסמינר החדש
  newSeminarEmail: string = ''//אימייל הסמינר החדש
  newLibrarians: Array<string> = []//ספרניות הסמינר החדש
  userType:string=''
  isStudentExisted:boolean=false;



  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadSeminaries();
    this.getUsers();
    //this.librarians = this.users.filter(user => user.userType === "Librarian");
    this.getUserTypeFromToken();
  }

  loadSeminaries(): void {
    const userIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage
    this.apiService.Read('/seminaries').subscribe({
      next: (data: Seminar[]) => {
        this.seminaries = data;
        this.seminaries.forEach(seminar=>seminar.siteManagerId=userIdNumber)
        console.log('seminaries', this.seminaries);
      },
      error: (err) => console.error('Error loading seminaries:', err)
    });
  }

  showConfirmation(seminar: Seminar): void {
    if(this.userType==='Admin'){
       this.confirmSeminar = seminar;
    }
    
      if(this.getStudentsBySeminar(this.confirmSeminar).length>0){
        this.isStudentExisted=true;
      }
      else{
        this.isStudentExisted=false;
      }
        
  }

  closeConfirmation(): void {
    this.confirmSeminar = null;
  }

  confirmDeleteSeminar(): void {
    const userIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage
    if (this.confirmSeminar) {
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
      console.error('No Seminar selected for deletion.');
    }
    this.closeConfirmation();
  }

  onChangeFieldsSeminar(seminar: Seminar) {
    console.log("change Seminar");
    seminar.isChanging = true
  }

  // addLibrarian(seminar: Seminar, librarianId: string) {
  //   this.onChangeFieldsSeminar(seminar);
  //   seminar.librarianIds.push(librarianId)
  // }

  removeLibrarian(seminar: Seminar, librarianId: string) {
    this.onChangeFieldsSeminar(seminar);
    const index = seminar.librarianIds.indexOf(librarianId);
    if (index >= 0) {
      seminar.librarianIds.splice(index, 1)
    }
  }

  editSeminar(Seminar: Seminar): void {
    const userIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage
    if (userIdNumber === Seminar.siteManagerId || this.userType=='Admin') {
    if (Seminar.isEditing ) {
      this.saveSeminar(Seminar);
    } else {
      Seminar.isEditing = true;
    }
  }else{
    console.error(" לא ניתן לערוך סמינר אחר");
    
  }
}

  saveSeminar(Seminar: Seminar): void {
    if (Seminar.isChanging ) {
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
    if (!this.librarians || this.librarians.length === 0) {
      return 'טוען...'; // החזר ערך ברירת מחדל אם הנתונים עדיין לא נטענו
    }
    const findLibrarian=this.librarians.find(lib=>lib._id===librarianId)
    
    return findLibrarian ? `${findLibrarian.firstName} ${findLibrarian.lastName}` : 'Unknown';
    
  }


  getUsers() {
    this.apiService.Read('/users/all').subscribe({
      next: (response: any[]) => {
        this.users=response;
        this.librarians = this.users.filter(user => user.userType === "Librarian");
      },
      error: (err) => {
        console.error('Error fetching users', err);
      },
    });
  }

  // filterLibrarianBySeminar(seminar: Seminar): any[] {

  //   const filterArray = this.librarians.filter(lib => lib.assignedSeminaryId === seminar._id)
  //   return filterArray
  // }

  getStudentsBySeminar(seminar:Seminar):any[]{
    return this.users.filter(user=>user.assignedSeminaryId===seminar._id)
  }

  getUserTypeFromToken(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {

      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          this.userType = decodedToken.userType || '';
          console.log(this.userType);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    } else {
      console.error('localStorage is not available on the server.');
    }

  }


}
