// import { CommonModule } from '@angular/common';
// import { Component, NgModule } from '@angular/core';
// import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
// import { COMMA, ENTER } from '@angular/cdk/keycodes';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
// import { MatInputModule } from '@angular/material/input';
// import { map, Observable, startWith } from 'rxjs';


// @Component({
//   selector: 'app-upload-resource',
//   standalone: true,
//   imports: [CommonModule,FormsModule,ReactiveFormsModule,MatChipsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule],
//   templateUrl: './upload-resource.component.html',
//   styleUrl: './upload-resource.component.css'
// })
// export class UploadResourceComponent 
// {
//   fileForm: FormGroup;
//   readonly separatorKeysCodes = [ENTER, COMMA] as const;

//   uploadedFileUrl: string | null = null;
//   previewImage: string | ArrayBuffer |SafeResourceUrl| null ='assets/camera-placeholder.jpg';
//   isVideo: boolean=false;
//   isPDF:boolean=false;
//   isImage:boolean=true
//   isAudio:boolean=false
//   fileTypes:Array<string>= ["ספר","סרטון","שיר","מערך","תמונה"];
//   purchaseLocations:Array<string>=["חנות אונליין"];
//   topics :Array<string>=["סבלנות"];
//   ageGroups:Array<string>=["מבוגרים","ילדים"];
//   levels:Array<string>=["נמוכה","גבוהה"];
//   languages:Array<string>=["אנגלית","עברית"];
//   specializationsCtrl = new FormControl('');
//   specializations: string[] = [];
//   allSpecializations: string[] = ['מדעים', 'מחשבים', 'היסטוריה', 'ספרות'];
//   filteredSpecializations$: Observable<string[]>;
  
  

//   constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
//     // יצירת טופס
//     this.fileForm = this.fb.group({
//       publishDate: ['', Validators.required],
//       uploadDate: ['', Validators.required],
//       fileType: ['', Validators.required],
//       topic: ['', Validators.required],
//       approved: ['', Validators.required],
//       loanValidity: ['', Validators.required],
//       specializations: [[], Validators.required],
//       ageGroup: ['', Validators.required],
//       level: ['', Validators.required],
//       language: ['', Validators.required],
//       purchaseLocation: ['', Validators.required],
//       price: ['', Validators.required],
//       catalogNumber: ['', Validators.required],
//       copies: ['', Validators.required],
//       releaseYear: ['', Validators.required],
//       author: ['', Validators.required],
//       additionalInfo: [''],
//       tags:['']
//     });
//     this.filteredSpecializations$ = this.specializationsCtrl.valueChanges.pipe(
//       startWith(''),
//       map((value: string | null) => this._filter(value?.trim() ?? ''))
//     );
//   }

//   private _filter(value: string): string[] {
//     const filterValue = value.toLowerCase();
//     const filtered = this.allSpecializations.filter(specialization =>
//       specialization.toLowerCase().includes(filterValue)
//     );
//     console.log("filter: "+filtered);  // בדוק את הפלט
//     return filtered;
//   }

//   selectSpecialization(event: MatAutocompleteSelectedEvent): void {
//     const value = event.option.value.trim(); // השתמשי ב-option.value במקום ב-viewValue
//     if (value && !this.specializations.includes(value)) {
//       this.specializations.push(value);
//     }
//     this.specializationsCtrl.setValue('');
//   }

//   onFileSelected(event: Event): void 
//   {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files[0]) 
//       {
//       const file = input.files[0];
//       const fileType = file.type;
//       const fileName = file.name.toLowerCase();


//       if (fileType.startsWith('video/') ) 
//         {
//           this.clearPreviewsExcept('video');
//         this.previewImage = URL.createObjectURL(file);// שמירת התצוגה המקדימה לוידאו
//         }
//         else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) 
//           {
//             this.clearPreviewsExcept('document');
//             const objectUrl = URL.createObjectURL(file);
//             this.previewImage = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);        
//           }
//         else if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') ) 
//           {
//             this.previewImage = URL.createObjectURL(file);
//             this.clearPreviewsExcept('audio');
//           }
//         else 
//           {
//           this.clearPreviewsExcept('image');
//           const reader = new FileReader();
//           reader.onload = () => {
//             this.previewImage = reader.result; //  שמירת התצוגה המקדימה לתמונה 
//             };
//           reader.readAsDataURL(file);
//           }
//       }
      
//   }

//   clearPreviewsExcept(type: 'image' | 'video' | 'document' | 'audio') {
//     this.isImage = type === 'image' ? true : false;
//     this.isVideo = type === 'video' ? true : false;
//     this.isPDF = type === 'document' ? true : false;
//     this.isAudio = type === 'audio' ? true : false;
//   }


//   add(event: MatChipInputEvent): void {
//     const value = (event.value || '').trim();
//     if (this.allSpecializations.includes(value) && !this.specializations.includes(value)) {
//       this.specializations.push(value);
//     }
//     event.chipInput!.clear();
//     this.specializationsCtrl.setValue('');
//   }

//   remove(specialization: string): void 
//   {
//     const index = this.specializations.indexOf(specialization);
//     if (index >= 0) {
//       this.specializations.splice(index, 1);
//     }
//   }

//   onSubmit(): void 
//   {
//     if (this.fileForm.valid) 
//       {
//         // אם הטופס תקין, אפשר להוציא את הערכים
//         console.log('טופס נשלח בהצלחה:', this.fileForm.value); 
//       } 
//     else 
//       {
//         console.log('יש שגיאות בטופס');
//       }
//   }
// }

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-upload-resource',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatChipsModule, MatAutocompleteModule, 
    MatFormFieldModule, MatInputModule,],
  templateUrl: './upload-resource.component.html',
  styleUrls: ['./upload-resource.component.css']
})
export class UploadResourceComponent 
{
  fileForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  uploadedFileUrl: string | null = null;
  previewImage: string | ArrayBuffer |SafeResourceUrl| null ='assets/camera-placeholder.jpg';
  isVideo: boolean=false;
  isPDF:boolean=false;
  isImage:boolean=true
  isAudio:boolean=false
  fileTypes:Array<string>= ["ספר","סרטון","שיר","מערך","תמונה"];
  purchaseLocations:Array<string>=["חנות אונליין"];
  topics :Array<string>=["סבלנות"];
  ageGroups:Array<string>=["מבוגרים","ילדים"];
  levels:Array<string>=["נמוכה","גבוהה"];
  languages:Array<string>=["אנגלית","עברית"];
  specializationsCtrl = new FormControl('');
  specializations: string[] = [];
  allSpecializations: string[] = ['מדעים', 'מחשבים', 'היסטוריה', 'ספרות'];
  filteredSpecializations$: Observable<string[]>;
  
  

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    // יצירת טופס
    this.fileForm = this.fb.group({
      publishDate: ['', Validators.required],
      uploadDate: ['', Validators.required],
      fileType: ['', Validators.required],
      topic: ['', Validators.required],
      approved: ['', Validators.required],
      loanValidity: ['', Validators.required],
      specializations: [[], Validators.required],
      ageGroup: ['', Validators.required],
      level: ['', Validators.required],
      language: ['', Validators.required],
      purchaseLocation: ['', Validators.required],
      price: ['', Validators.required],
      catalogNumber: ['', Validators.required],
      copies: ['', Validators.required],
      releaseYear: ['', Validators.required],
      author: ['', Validators.required],
      additionalInfo: [''],
      tags:['']
    });
    this.filteredSpecializations$ = this.specializationsCtrl.valueChanges.pipe(
      startWith(''),
      map((value: string | null) => this._filter(value?.trim() ?? ''))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    const filtered = this.allSpecializations.filter(specialization =>
      specialization.toLowerCase().includes(filterValue)
    );
    console.log("filter: "+filtered);  // בדוק את הפלט
    return filtered;
  }

  selectSpecialization(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value.trim(); // השתמשי ב-option.value במקום ב-viewValue
    if (value && !this.specializations.includes(value)) {
      this.specializations.push(value);
    }
    this.specializationsCtrl.setValue('');
  }

  onFileSelected(event: Event): void 
  {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) 
      {
      const file = input.files[0];
      const fileType = file.type;
      const fileName = file.name.toLowerCase();


      if (fileType.startsWith('video/') ) 
        {
          this.clearPreviewsExcept('video');
        this.previewImage = URL.createObjectURL(file);// שמירת התצוגה המקדימה לוידאו
        }
        else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) 
          {
            this.clearPreviewsExcept('document');
            const objectUrl = URL.createObjectURL(file);
            this.previewImage = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);        
          }
        else if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') ) 
          {
            this.previewImage = URL.createObjectURL(file);
            this.clearPreviewsExcept('audio');
          }
        else 
          {
          this.clearPreviewsExcept('image');
          const reader = new FileReader();
          reader.onload = () => {
            this.previewImage = reader.result; //  שמירת התצוגה המקדימה לתמונה 
            };
          reader.readAsDataURL(file);
          }
      }
      
  }

  clearPreviewsExcept(type: 'image' | 'video' | 'document' | 'audio') {
    this.isImage = type === 'image' ? true : false;
    this.isVideo = type === 'video' ? true : false;
    this.isPDF = type === 'document' ? true : false;
    this.isAudio = type === 'audio' ? true : false;
  }


  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (this.allSpecializations.includes(value) && !this.specializations.includes(value)) {
      this.specializations.push(value);
    }
    event.chipInput!.clear();
    this.specializationsCtrl.setValue('');
  }

  remove(specialization: string): void 
  {
    const index = this.specializations.indexOf(specialization);
    if (index >= 0) {
      this.specializations.splice(index, 1);
    }
  }

  onSubmit(): void 
  {
    if (this.fileForm.valid) 
      {
        // אם הטופס תקין, אפשר להוציא את הערכים
        console.log('טופס נשלח בהצלחה:', this.fileForm.value); 
      } 
    else 
      {
        console.log('יש שגיאות בטופס');
      }
  }
}
