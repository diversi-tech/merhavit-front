import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-upload-resource',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './upload-resource.component.html',
  styleUrl: './upload-resource.component.css'
})
export class UploadResourceComponent 
{
  // isApproved: boolean = false;
  // uploadDate: string = '';
  // publishDate: string = '';
  // fileType: string = '';
  // loanValidity:string= '';
  // uploadedFileName: string | null = null;

  // onFileSelected(event: Event) 
  // {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) 
  //     {
  //     this.uploadedFileName = input.files[0].name;
  //     }
  // }

  // toggleApproval()
  //  {
  //   this.isApproved = !this.isApproved;
  //  }



  fileForm: FormGroup;
  uploadedFileUrl: string | null = null;
  previewImage: string | ArrayBuffer | null = null;
  fileTypes:Array<string>= ["book","video"];
  purchaseLocations:Array<string>=["חנות אונליין"];
  specializations:Array<string>=["מדעים","מחשבים"];
  topics :Array<string>=["סבלנות"];
  ageGroups:Array<string>=["מבוגרים","ילדים"];
  levels:Array<string>=["נמוכה","גבוהה"];
  languages:Array<string>=["אנגלית","עברית"];
  

  constructor(private fb: FormBuilder) {
    // יצירת טופס
    this.fileForm = this.fb.group({
      publishDate: ['', Validators.required],
      uploadDate: ['', Validators.required],
      fileType: ['', Validators.required],
      topic: ['', Validators.required],
      approved: ['', Validators.required],
      loanValidity: ['', Validators.required],
      specialization: ['', Validators.required],
      ageGroup: ['', Validators.required],
      level: ['', Validators.required],
      language: ['', Validators.required],
      purchaseLocation: ['', Validators.required],
      price: ['', Validators.required],
      catalogNumber: ['', Validators.required],
      copies: ['', Validators.required],
      releaseYear: ['', Validators.required],
      author: ['', Validators.required],
      additionalInfo: ['']
    });
  }

  onFileSelected(event: Event): void 
  {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) 
      {
      const file = input.files[0];

      // קריאה של הקובץ והמרה לנתוני Base64 לתצוגה מקדימה
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result; // שמירת התצוגה המקדימה
      };
      reader.readAsDataURL(file);
      }
  }

  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.uploadedFileUrl = e.target.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  // triggerFileInput() {
  //   document.getElementById('fileInput')?.click();
  // }

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
