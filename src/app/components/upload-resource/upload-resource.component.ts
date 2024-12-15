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
import { AfterViewInit, Component, computed, ElementRef, inject, model, signal, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith } from 'rxjs';
import { ApiService } from '../../api.service';
import { title } from 'process';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { Overlay, OverlayModule, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogComponent } from '../dialog/dialog.component';

//import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-upload-resource',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatChipsModule, MatAutocompleteModule, 
    MatFormFieldModule, MatInputModule,MatIconModule,OverlayModule,MatAutocompleteModule,MatDialogModule, MatButtonModule],
  templateUrl: './upload-resource.component.html',
  styleUrls: ['./upload-resource.component.css']
})
export class UploadResourceComponent  
{
  fileForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  //uploadedFileUrl: string | null = null;
  previewImage: string | ArrayBuffer |SafeResourceUrl| null ='assets/camera-placeholder.jpg';
  file:File| null=null;
  coverImage:File|null=null;
  displayImage: string|ArrayBuffer|null=null
  isVideo: boolean=false;
  isPDF:boolean=false;
  isImage:boolean=true
  isAudio:boolean=false
  fileTypes:Array<string>= ["ספר","סרטון","שיר","מערך","תמונה"];
  purchaseLocations:Array<string>=["חנות אונליין"];
  
  levels:Array<string>=["נמוכה","גבוהה"];
  languages:Array<string>=["אנגלית","עברית"];
  
  multipleChoiceFields:{ //מפה לשמירת המשתנים לכל שדה שיש בו בחירה מרובה מתוך רשימה
    [key: string]: {
      Ctrl: FormControl<string | null |any>;
      optionSelected: string[]|any[];
      allOption: string[]|any[];
      filteredOption$: Observable<string[]|any[]> | null;
    };
   } = {
    'specializations':{
      Ctrl : new FormControl(''),
      optionSelected: [] as string[],
      allOption: ['מדעים', 'מחשבים', 'היסטוריה', 'ספרות'],
      filteredOption$: null as Observable<string[]> | null
    },
    'ages':{
      Ctrl : new FormControl(''),
      optionSelected: [] as string[],
      allOption: ["כיתות יד","כיתות יג","מורות"],
      filteredOption$: null as Observable<string[]> | null
    },
    'subjects':{
      Ctrl : new FormControl(''),
      optionSelected: [] as string[],
      allOption: ["סבלנות","מרחביות","סטודיו","מקצועי","הר געש","פסח","מדעים","עונות השנה","מעבדות לחרות"
        ,"גיל ההתבגרות","ואהבת לרעך כמוך","עבודת המידות","חסד","נתינה","הפרפר והגולם","מתמטיקה","גאוגרפיה",
      "גשם","חורף","צונאמי","גדולי ישראל"],
      filteredOption$: null as Observable<string[]> | null
    },
    'tags':{
      Ctrl : new FormControl(''),
      optionSelected: [] ,
      allOption: [],
      filteredOption$: null as Observable<[]> | null
    }
    }

  readonly addOnBlur = true;

  
  
  

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer,private apiService:ApiService,private dialog: MatDialog) {
    // יצירת טופס
    this.fileForm = this.fb.group({
      title: ['', Validators.required],
      publicationDate: ['', Validators.required],
      type: ['', Validators.required],
      subject: this.fb.array([[], Validators.required]),
      //approved: ['', Validators.required],
      //loanValidity: ['', Validators.required],
      specializations:this.fb.array([[], Validators.required]),
      ages: this.fb.array([[], Validators.required]),
      level: ['', Validators.required],
      language: ['', Validators.required],
      //purchaseLocation: ['', Validators.required],
      //price: ['', Validators.required],
      //catalogNumber: ['', Validators.required],
      //copies: ['', Validators.required],
      releaseYear: ['', Validators.required],
      author: ['', Validators.required],
      description: [''],
      tags:this.fb.array([[]]),
      
    });
    this.getTags();

    Object.entries(this.multipleChoiceFields).forEach(([key, value]) => {
      value.filteredOption$ = value.Ctrl.valueChanges.pipe(
        startWith(''),
        map((value: string | null) => this._filter(value?.trim() ?? '',key))
      );
    });
  }

  ngOnInit(): void {
    Object.keys(this.multipleChoiceFields).forEach((key)=>{
      const Array = this.fileForm.get(key) as FormArray;
      //console.log("Array:",Array);
      
    while (Array?.length > 0) {
      Array.removeAt(0);
    }
    })
    
  }

  private _filter(value: string,fieldKey:string): string[] {
    const field=this.multipleChoiceFields[fieldKey]

    const filterValue = value.toLowerCase();
    const filtered = field.allOption.filter(option =>
      option.toLowerCase().includes(filterValue)
    );
    console.log("filter: "+filtered);  // בדוק את הפלט
    return filtered;
  }

  

  onFileSelected(event: Event): void 
  {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) 
      {
      this.file = input.files[0];
      const fileType = this.file.type;
      const fileName = this.file.name.toLowerCase();


      if (fileType.startsWith('video/') ) 
        {
          this.clearPreviewsExcept('video');
        this.previewImage = URL.createObjectURL(this.file);// שמירת התצוגה המקדימה לוידאו
        }
        else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) 
          {
            this.clearPreviewsExcept('document');
            const objectUrl = URL.createObjectURL(this.file);
            this.previewImage = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);        
          }
        else if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') ) 
          {
            this.previewImage = URL.createObjectURL(this.file);
            this.clearPreviewsExcept('audio');
          }
        else 
          {
          this.clearPreviewsExcept('image');
          const reader = new FileReader();
          reader.onload = () => {
            this.previewImage = reader.result; //  שמירת התצוגה המקדימה לתמונה 
            };
          reader.readAsDataURL(this.file);
          }
      }
      
  }

  onImageSelected(event: Event): void 
  {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) 
      {
      this.coverImage = input.files[0];
      const reader = new FileReader();
          reader.onload = () => {
          this.displayImage=reader.result
          }
          reader.readAsDataURL(this.coverImage);


      }
    }

  clearPreviewsExcept(type: 'image' | 'video' | 'document' | 'audio') {
    this.isImage = type === 'image' ? true : false;
    this.isVideo = type === 'video' ? true : false;
    this.isPDF = type === 'document' ? true : false;
    this.isAudio = type === 'audio' ? true : false;
  }

  add(event: MatChipInputEvent,fieldKey:string): void {
    const value = (event.value || '').trim();
    console.log("val: "+value);
    const field=this.multipleChoiceFields[fieldKey]
    
    if (value && field.allOption.includes(value) /*&& !this.specializations.includes(value)*/) {
      field.optionSelected.push(value);
      const Array = this.fileForm.get(fieldKey) as FormArray;
      Array.push(new FormControl(value));
  
    }
  
    event.chipInput!.clear();
  field.Ctrl.setValue('');
  }

  remove(option: string,fieldKey:string): void 
  {
    const field=this.multipleChoiceFields[fieldKey]
    const Array = this.fileForm.get(fieldKey) as FormArray;
  const index = Array.controls.findIndex(ctrl => ctrl.value === option);

  if (index >= 0) {
    Array.removeAt(index);
    field.optionSelected.splice(index, 1);     
  }
  }


  select(event: MatAutocompleteSelectedEvent,fieldKey:string): void {
    const value = event.option.value.trim(); // השתמשי ב-option.value במקום ב-viewValue
    const field=this.multipleChoiceFields[fieldKey]

    if (value && value !== null && value !== undefined) {
      const Array = this.fileForm.get(fieldKey) as FormArray;
      console.log("Array: ",Array);

    if (!field.optionSelected.includes(value)) {
      console.log("value: ",value);
      
      field.optionSelected.push(value);
    
    // הוספת ההתמחות שנבחרה למערך ההתמחויות שבטופס
    Array.push(new FormControl(value));
    }
  }
    field.Ctrl.setValue('');    
  }
  
  getTags()
  {
    this.apiService.Read('/Tag').subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.multipleChoiceFields['tags'].allOption = response;
          console.log("dataTags: ",this.multipleChoiceFields['tags'].allOption = response);
        } else {
          this.multipleChoiceFields['tags'].allOption = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
        }  
      },
        error: (err) => 
          {
          console.error('Error fetching tags', err);
          },
      });
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
    });
    const field=this.multipleChoiceFields['subjects']

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result) {
        field.allOption.push(result); // הוספת הנושא לרשימה אם הוזן
        field.optionSelected.push(result);
      const Array = this.fileForm.get('subject') as FormArray;
      Array.push(new FormControl(result));
      }
    });
  }

  onSubmit() :void
  {
    console.log("spec: "+JSON.stringify(this.fileForm.value.specializations));

    if (this.fileForm.valid && this.file) 
      {
        const formData= new FormData();
        console.log("spec: "+JSON.stringify(this.fileForm.value.specializations));
        
        const metadata={
          ...this.fileForm.value,
          createdBy:localStorage.getItem('idNumber')
        }
         //console.log(" נתונים" +metadata.title);
         let str:string=JSON.stringify(metadata)
        console.log("string data: "+str)
        formData.append('metadata',str)
        formData.append('resource',this.file)

        if(this.coverImage)
        {
          console.log("image "+this.coverImage);
          
          formData.append('coverImage',this.coverImage)
        }
          
       console.log(" נתונים" +formData.get('metaData'));
       
        this.apiService.Post('/EducationalResource',formData).subscribe({
          next: (response) => {
           console.log('טופס נשלח בהצלחה:', this.fileForm.value); 
          },
          error: (err) =>  
          {
           console.log('תקלה בשליחת טופס',err);
          },
        });
  }else{
    console.log("טופס לא תקין");
     
  }
}
}
