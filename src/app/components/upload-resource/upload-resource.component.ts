import { CommonModule } from '@angular/common';
import { AfterViewInit, Component,ViewEncapsulation, computed, ElementRef, inject, model, signal, ViewChild, ViewContainerRef } from '@angular/core';
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
import {MatRadioModule} from '@angular/material/radio';
import { QuillModule } from 'ngx-quill';
import Quill from 'quill'; // Import Quill
import { transliterate } from 'transliteration';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';




//import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-upload-resource',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatChipsModule, MatAutocompleteModule, 
    MatFormFieldModule, MatInputModule,MatIconModule,OverlayModule,MatAutocompleteModule, 
    MatButtonModule,MatRadioModule,QuillModule],
  templateUrl: './upload-resource.component.html',
  styleUrls: ['./upload-resource.component.css']
})
export class UploadResourceComponent  
{
  @ViewChild('formContainer', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;
  fileForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  formMode: string='edit';//שמירת מצב הטופס לפי סוג הקובץ המוכנס לתוכו
  errorMessage: string | null = null;//הודעת שגיאה לכפתור רדיו
  formErrorMessage:string|null=null;

  disabledOptions: Record<string, boolean> = {
    edit: false,
    add: false,
    addLink: false, 
}
  content = ''; // תוכן העורך
  fileToEdit: File | null = null;
  link: string = ''; // משתנה לשמירת הקישור שהמשתמש מדביק
  isValidLink: boolean = true;
  previewImage: string | ArrayBuffer |SafeResourceUrl| null ='assets/camera-placeholder.jpg';//תצוגה מקדימה לקובץ
  file:File| null=null;//קובץ שנבחר
  coverImage:File|null=null;//תמונת שער שנבחרה
  displayImage: string|ArrayBuffer|null=null//שמירת תצוגה מקדימה לתמונת שער
  isVideo: boolean=false;
  isPDF:boolean=false;
  isImage:boolean=true
  isAudio:boolean=false
  fileTypes:Array<string>= ["ספר","סרטון","שיר","מערך","תמונה"];
  userId:string=''
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
      allOption: [''],
      filteredOption$: null as Observable<[]> | null
    }
    }

  readonly addOnBlur = true;

  
  
  

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer,private apiService:ApiService,private dialog: MatDialog,private snackBar: MatSnackBar) {
    // יצירת טופס
    this.fileForm = this.fb.group({
      title: ['', Validators.required],
      publicationDate: ['', Validators.required],
      type: ['', Validators.required],
      subjects: this.fb.array([[], Validators.required]),
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
      tags:this.fb.array([[]])
      
    });
    this.getTags();

    Object.entries(this.multipleChoiceFields).forEach(([key, value]) => {
      value.filteredOption$ = value.Ctrl.valueChanges.pipe(
        startWith(''),
        map((value: string |any| null) => this._filter(value?.trim() ?? '',key))
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

  handleClick(event:Event,option: string): void {
    const modeAble= Object.keys(this.disabledOptions).find(k=>this.disabledOptions[k])
    if (!this.disabledOptions[option] && modeAble) {
      event.preventDefault();
      this.errorMessage = `לא ניתן לבחור באפשרות "${this.getOptionLabel(option)}" כעת.
      נבחרה כבר אפשרות "${this.getOptionLabel(modeAble)}".
      נקי את בחירת השדות.`;
      
    } else {
      this.errorMessage = null; // מנקה הודעות שגיאה
    }
  }


  getOptionLabel(option: string): string {
    const labels: Record<string, string> = {
      edit: 'עריכת תוכן',
      add: 'העלאת תוכן',
      addLink: 'קישורים',
    };
    return labels[option] || option;
  }

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline'], // עיצוב בסיסי
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'], // קישורים ותמונות
      [{ align: [] }],
    ],
  };

  onFileToEditSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileToEdit = input.files[0];
      console.log('File selected:', this.fileToEdit.name);
    }
  }

  onLinkChange() {
    // ולידציה בסיסית לקישור
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    this.isValidLink = urlRegex.test(this.link);
    console.log("link:",this.link);
    this.disabledOptions['addLink']= this.link && this.isValidLink? true:false;
    this.errorMessage= this.disabledOptions['addLink']?null:this.errorMessage;
  }



  private _filter(value: any,fieldKey:string): any[] {
    const field=this.multipleChoiceFields[fieldKey]  
    const filterValue = value.toLowerCase();

    return field.allOption.filter(option => {
    if (typeof option === 'string') {
      return option.toLowerCase().includes(filterValue);
    } else if (typeof option === 'object' && option.name) {
      return option.name.toLowerCase().includes(filterValue);
    }
    return false;
  });

  }

  

  onFileSelected(event: Event): void 
  {
    const input = event.target as HTMLInputElement;
    this.disabledOptions['add']=this.file? true:false 
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
      this.disabledOptions['add']=this.file? true:false 
  }

  onFileTypeChange(event: Event): void {
    const selectedType = (event.target as HTMLSelectElement).value;
    this.isImage = selectedType == 'תמונה';
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

  onEditFileSelected()
  {
    this.disabledOptions['edit']= this.content? true:false
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
          console.log("dataTags: ",this.multipleChoiceFields['tags'].allOption);
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

  getTagById(tagId:string)
  {
    return this.multipleChoiceFields['tags'].allOption.find(opt=> opt._id===tagId).name
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
      const Array = this.fileForm.get('subjects') as FormArray;
      Array.push(new FormControl(result));
      }
    });
  }

  sanitizeFileName(originalName:string) {
    // תעתוק האותיות לשם באנגלית
    let nameWithoutExtension = originalName.replace(/\.[^/.]+$/, ''); // הסרת הסיומת
    let extension = originalName.split('.').pop(); // שמירת הסיומת
    // המרת עברית לאנגלית
    let transliterated = transliterate(nameWithoutExtension);
    // הסרת כל התווים שאינם אותיות אנגלית או מספרים
    let sanitized = transliterated.replace(/[^a-zA-Z0-9]/g, '');
    // הוספת הסיומת בחזרה
    return sanitized + '.' + extension;
  }

  renameFile(file: File): File {
    return new File([file], this.sanitizeFileName(file.name), { type: file.type });
  }

  getContentOption(option:string)
  {
     const options :Record<string, string>={
     edit:'text',
     add:'file',
     addLink:'link'
     }
     return options[option]
  }

  getUserIdFromToken(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userId = decodedToken.sub || '';
        console.log("userId",this.userId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  onSubmit() :void
  {
    console.log("spec: "+JSON.stringify(this.fileForm.value.specializations));
    this.getUserIdFromToken();
    if (this.fileForm.valid ) 
      {
        const formData= new FormData();
        console.log("spec: "+JSON.stringify(this.fileForm.value.specializations));
        
        const metadata={
          ...this.fileForm.value,
          createdBy:this.userId,
          filePath:this.link, 
          contentOption:this.getContentOption(this.formMode)
        }
         //console.log(" נתונים" +metadata.title);
         let str:string=JSON.stringify(metadata)
        console.log("string data: "+str)
        formData.append('metadata',str)
        if(this.file)
        {
         const rename=this.renameFile(this.file)
         console.log(rename);
         
          formData.append('resource',rename)
        }

        if(this.isImage)
        {
          this.coverImage=this.file
        }
           

        if(this.coverImage)
        {
          console.log("image "+this.coverImage);
          
          formData.append('coverImage',this.renameFile(this.coverImage))
        }
          
       console.log(" נתונים" +formData.get('metaData'));
       
        this.apiService.Post('/EducationalResource',formData).subscribe({
          next: (response) => {
           console.log('טופס נשלח בהצלחה:', this.fileForm.value); 
           Swal.fire({
            title: 'טופס נשלח בהצלחה!',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'OK',
            buttonsStyling: false,
            
            customClass: {
                confirmButton: 'btn btn-primary px-4',
                cancelButton: 'btn btn-danger ms-2 px-4',
            
            },
            });
          },
          error: (err) =>  
          {
           console.log('תקלה בשליחת טופס',err);
          Swal.fire({
            title: 'תקלה בשליחת הטופס!',
            text: ' שגיאה'+err.status ,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'OK',
            buttonsStyling: false,
            
            customClass: {
                confirmButton: 'btn btn-primary px-4',
                cancelButton: 'btn btn-danger ms-2 px-4',
            
            },
            });
          },
        });
        this.formErrorMessage=null;
  }else{
    console.log("טופס לא תקין");
    this.formErrorMessage="טופס לא תקין. אנא וודאי שכל השדות מלאים"
  }
  setTimeout(() => {
    const element = document.querySelector('[id^="cdk-overlay-"]');
    console.log("element",element);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 0);

  
}

}


