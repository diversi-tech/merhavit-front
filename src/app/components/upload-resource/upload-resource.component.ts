import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith } from 'rxjs';
import { ApiService } from '../../api.service';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogComponent } from '../dialog/dialog.component';
import {MatRadioModule} from '@angular/material/radio';
import { QuillModule } from 'ngx-quill';
import { transliterate } from 'transliteration';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';




//import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-upload-resource',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatChipsModule, MatAutocompleteModule, 
    MatFormFieldModule, MatInputModule,MatIconModule,OverlayModule,MatAutocompleteModule, 
    MatButtonModule,MatRadioModule,QuillModule,RouterModule,MatCheckboxModule],
  templateUrl: './upload-resource.component.html',
  styleUrls: ['./upload-resource.component.css']
})
export class UploadResourceComponent  
{
  fileForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  formMode:string='add'
  contentOption: string='edit';//שמירת מצב הטופס לפי סוג הקובץ המוכנס לתוכו
  errorMessage: string | null = null;//הודעת שגיאה לכפתור רדיו
  formErrorMessage:string|null=null;//הודעת שגיאה לטופס חסר שדות חובה
  fileErrorMessage: string|null=null //הודעת שגיאה חסר קובץ
  coverImageErrorMessage:string |null=null //הודעת שגיאה חסר תמונת שער
//שמירה באיזה מצב של הטופס מילאו ערך
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
  fileTypes:Array<string>= ["ספר","סרטון","שיר","מערך","כרזה","דף עבודה","איור","יצירה"];
  userId:string=''
  // purchaseLocations:Array<string>=["חנות אונליין"];
  
  levels:Array<string>=["נמוכה","גבוהה"];
  languages:Array<string>=["אנגלית","עברית"];
  isSubmitting = false;//שמירת המצב האם לחצו על שלח או לא

  
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
      allOption: [],
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
      allOption: [],
      // ["סבלנות","מרחביות","סטודיו","מקצועי","הר געש","פסח","מדעים","עונות השנה","מעבדות לחרות"
      //   ,"גיל ההתבגרות","ואהבת לרעך כמוך","עבודת המידות","חסד","נתינה","הפרפר והגולם","מתמטיקה","גאוגרפיה",
      // "גשם","חורף","צונאמי","גדולי ישראל"],
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

  
  
  

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer,private apiService:ApiService,private dialog: MatDialog,private snackBar: MatSnackBar,private router: Router) {
    // יצירת טופס
    this.fileForm = this.fb.group({
      title: ['', Validators.required],
      publicationDate: ['', Validators.required],  
      type: ['', Validators.required],
      subjects: this.fb.array([], [Validators.required]),
      //approved: ['', Validators.required],
      //loanValidity: ['', Validators.required],
      specializations:this.fb.array([],[ Validators.required]),
      ages: this.fb.array([], [Validators.required]),
      level: ['', Validators.required],
      language: ['', Validators.required],
      //purchaseLocation: ['', Validators.required],
      //price: ['', Validators.required],
      //catalogNumber: ['', Validators.required],
      //copies: ['', Validators.required],
      releaseYear: [''],
      author: ['', Validators.required],
      description: [''],
      tags:this.fb.array([[]])
      
    });
    //this.getTags(); //יבוא תגיות מטבלת התגיות במסד הנתונים
//
    Object.entries(this.multipleChoiceFields).forEach(([key, value]) => {
      value.filteredOption$ = value.Ctrl.valueChanges.pipe(
        startWith(''),
        map((value: string |any| null) => this._filter(value?.trim() ?? '',key))
      );
    });
  }

  //פונקציה שמחזירה האם הערך שהתקבל מופיע ברשימה הכוללת
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

 

 //מאתחלת את כל הערכים של בחירה מרובה בטופס לריקים
  ngOnInit(): void {
    Object.keys(this.multipleChoiceFields).forEach((key)=>{
      const Array = this.fileForm.get(key) as FormArray;
      //console.log("Array:",Array);
      
    while (Array?.length > 0) {
      Array.removeAt(0);
    }

    if(key!=='ages')
      {
        console.log("path",this.createPath(key));
         
        this.getfromServer(`/${this.createPath(key)}`,key);
      }
    })
    
    this.fileForm.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this.formErrorMessage = null; // הסתרת ההודעה כאשר הטופס תקין
      }
      
    });
  }

  createPath(key:string):string
  {
    console.log("hi");
    
    if(key=='tags')
      return 'tags/getAll'
    else if(key=='subjects')
      return 'subjects/getAll'
    else
    return key
  }

  //חסימת אפשרות להעלאת כמה סוגי קבצים
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

  //פונקציה לכפתורי עיצוב בסרגל עיצוב
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

//בעת הדבקת קישור
  onLinkChange() {
    // ולידציה בסיסית לקישור
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    this.isValidLink = urlRegex.test(this.link);
    console.log("link:",this.link);
    this.disabledOptions['addLink']= this.link && this.isValidLink? true:false;
    this.errorMessage= this.disabledOptions['addLink']?null:this.errorMessage;
    if(this.link){
            this.fileErrorMessage=null
            this.formErrorMessage=null
    }
    else
      this.fileErrorMessage="חסר קובץ / קישור / תוכן. אנא מלאי אחת מהאפשרויות"
  }

  //בעת בחירת קובץ ממחשב
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
      if(this.file)
      {
                this.fileErrorMessage=null
                this.formErrorMessage=null
      }
  }

  //מחיקת הקובץ הנבחר
  removeSelectedFile()
  {
    this.file=null
    this.previewImage=this.sanitizer.bypassSecurityTrustResourceUrl('assets/camera-placeholder.jpg')
    this.clearPreviewsExcept('image');
    this.disabledOptions['add']=this.file? true:false

    
      this.fileErrorMessage="חסר קובץ / קישור / תוכן. אנא מלאי אחת מהאפשרויות"
  }

  removeCoverImage()
  {
    this.coverImage=null
    this.displayImage=null
    this.coverImageErrorMessage="חסר תמונת תצוגה מקדימה לקובץ"
  }

  removeLink()
  {
    this.link='';
    this.onLinkChange()
  }

  //בעת שינוי סוג קובץ
  onFileTypeChange(event: Event): void {
    const selectedType = (event.target as HTMLSelectElement).value;
    const imagesType:Array<string>=["כרזה","דף עבודה","איור","יצירה"]
    this.isImage =imagesType.includes(selectedType)  ;//עידכון האם מדובר בתמונה כדי לדעת האם נדרש תמונת שער
  }

  //בעת בחירת תמונת שער
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
      if(this.coverImage){
                this.coverImageErrorMessage=null
                this.formErrorMessage=null
      }
      else
       this.coverImageErrorMessage="חסר תמונת תצוגה מקדימה לקובץ"
    }

    //שמירה איזה סוג קובץ נבחר
  clearPreviewsExcept(type: 'image' | 'video' | 'document' | 'audio') {
    this.isImage = type === 'image' ? true : false;
    this.isVideo = type === 'video' ? true : false;
    this.isPDF = type === 'document' ? true : false;
    this.isAudio = type === 'audio' ? true : false;
  }

  //כאשר מקלידים באפשרות עריכת תוכן
  onEditFileSelected()
  {
    console.log("content",this.content);
    this.disabledOptions['edit']= this.content? true:false//חסימה של שאר האפשרויות
    if(this.content){
            this.fileErrorMessage=null
            this.formErrorMessage=null
    }
    else
    this.fileErrorMessage="חסר קובץ / קישור / תוכן. אנא מלאי אחת מהאפשרויות"

  }

  //יצירת קובץ HTML המכיל את התוכן שהמשתמש הקליד
  createTextFile():File
  {
    console.log("content",this.content);
    const tempDiv = document.createElement('div');
  // הכנסת תוכן ה-HTML לתוך האלמנט
  tempDiv.innerHTML = this.content;
  // החזרת התוכן כטקסט רגיל (ללא תגיות)
   const text=tempDiv.textContent || tempDiv.innerText || '';
    const lines = text.split('</p>').map(line => line.trim());//חלוקה לשורות
    const firstLine = lines.find(line => this.isValidText(line) && line !== '');
    console.log("first line",firstLine);

    // הגדרת שם הקובץ
    const fileName = firstLine ? `${firstLine}.html` : 'default.html';//שם הקובץ לפי השורה הראשונ
    this.fileForm.patchValue({ type: 'טקסט' }); // הגדרת ערך ברירת מחדל
    this.updateTypeValidator(false); // הסרת הוולידטור
    
    return new File([this.content], fileName, { type: 'text/html' });//קובץ HTML שמכיל את התוכן בפורמט HTML 
  }

  //סוג 'טקסט' כאשר הקלידו ב'עריכת תוכן' ק
  updateTypeValidator(isRequired: boolean): void {
    const typeControl = this.fileForm.get('type');
    if (isRequired) {
      typeControl?.setValidators([Validators.required]);
    } else {
      typeControl?.clearValidators();
    }
    typeControl?.updateValueAndValidity();
  }

  // פונקציה לבדיקת האם השורה היא מילים בלבד 
  private isValidText(line: string): boolean {
    // בודק אם השורה מכילה רק תווים תקינים (אותיות, מספרים, רווחים וסימנים מסוימים)
    const validTextRegex = /^[a-zA-Zא-ת0-9\s.,!?'"()-]+$/;
    return validTextRegex.test(line);
  }

  //הוספת ערך בשדה בחירה מרובה
  add(event: any, fieldKey: string): void {
    const value = (event.value || '').trim();
    const field = this.multipleChoiceFields[fieldKey];

    const option = field.allOption.find(opt => opt.name === value);
    const optionId = option ? option._id : value;

    if (value && field.allOption.includes(optionId) && !field.optionSelected.includes(optionId)) {
      field.optionSelected.push(optionId);
      const array = this.fileForm.get(fieldKey) as FormArray;
      array.push(new FormControl(optionId));
    }

    event.chipInput!.clear();
    field.Ctrl.setValue('');
    if (this.fileForm.valid) {
      this.formErrorMessage = null; 
    }
  }


  //הסרת ערך משדה בחירה מרובה
  remove(option: string, fieldKey: string): void {
    const field = this.multipleChoiceFields[fieldKey];
    const array = this.fileForm.get(fieldKey) as FormArray;
    const index = field.optionSelected.indexOf(option);

    if (index >= 0) {
      field.optionSelected.splice(index, 1);
      array.removeAt(index);
    }
  }

  //טיפול בהכנסת הערך הנבחר למערכים
   toggleSelection(option:any,fieldKey:string) {
    const field = this.multipleChoiceFields[fieldKey];
    const optionId = typeof option === 'object' ? option._id : option;

    if (!field.optionSelected.includes(optionId)) {
          field.optionSelected.push(optionId);
          const array = this.fileForm.get(fieldKey) as FormArray;
          array.push(new FormControl(optionId));
        }
     else {
      this.remove(optionId, fieldKey);
    }
    
    field.Ctrl.setValue('');
      
  }

//בחירת ערך מרשימה עי סימון לשדה בחירה מרובה
   optionClicked(event: Event, option:any,fieldKey:string) {
    event.stopPropagation();
    this.toggleSelection(option,fieldKey);
  }

  displayFn(value: string): string {
    return value;
  }

//בחירת ערך מרשימה  ע"י לחיצה לשדה בחירה מרובה
  select(event: MatAutocompleteSelectedEvent,fieldKey:string): void {
    const value = event.option.value.trim(); // השתמשי ב-option.value במקום ב-viewValue
     this.toggleSelection(value, fieldKey);   
  }
  
  markFieldAsTouched(fieldName: string): void {
    const field = this.fileForm.get(fieldName);
    if (field && !field.touched) {
      field.markAsTouched();
    }
  }
  
  //יבוא תגיות מטבלת תגיות
  getfromServer(path:string,fieldKey:string)
  {
    this.apiService.Read(path).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.multipleChoiceFields[fieldKey].allOption = response;
          console.log("dataTags: ",this.multipleChoiceFields[fieldKey].allOption);
        } else {
          this.multipleChoiceFields[fieldKey].allOption = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
        }  
      },
        error: (err) => 
          {
          console.error(`Error fetching ${fieldKey}`, err);
          },
      });
  }

  //קבלת שם התגית לפי ה_id שלה
  getOptionById(optionId:string,fieldKey:string)
  {
    return this.multipleChoiceFields[fieldKey].allOption.find(opt=> opt._id===optionId).name
  }

  paramsForDialog(fieldKey:string)
  {
    const params:Record<string,{}>={
      'tags':{
        title:'הוספת תגית חדשה',
        label:'שם תגית',
        isDescription:true
      },
      'specializations':{
        title:'הוספת התמחות חדשה',
        label:'שם התמחות',
        isDescription:false
      },
      'subjects':{
        title:'הוספת נושא חדש',
        label:'שם נושא',
        isDescription:true
      },
    }
    return params[fieldKey]
  }

  //חלון דיאלוג להוספת ערך נוסף
  openDialog(fieldKey:string,path:string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data:this.paramsForDialog(fieldKey)
    });
    const field=this.multipleChoiceFields[fieldKey]

    dialogRef.afterClosed().subscribe((result: any) => {
      if (  result && result.newValue ) {
        const createdByIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage
  
      if (createdByIdNumber) {
        let newObject:any={}
        if(result.description)
        {
          newObject = {
          name: result.newValue,
          description: result.description,
          createdByIdNumber: createdByIdNumber, // מוסיף את ה-ID שנמצא ב-LocalStorage
        };
        }else{
           newObject = {
            name: result.newValue,
            createdByIdNumber: createdByIdNumber, // מוסיף את ה-ID שנמצא ב-LocalStorage
        }
        }
        // שליחה דרך BODY במקום PARAM 
        this.apiService.Post(path, newObject).subscribe({
        next: (response) => {
          field.allOption.push({_id: response.insertedId,...newObject}); // הוספת הנושא לרשימה אם הוזן
          field.optionSelected.push(response.insertedId);
          const Array = this.fileForm.get(fieldKey) as FormArray;
          Array.push(new FormControl(response.insertedId));
      },
      error: (err) => console.error('Error adding:', err),
    });
    }
  }
})
}
    


  //שינוי לשם טוב באנגלית 
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

  //שינוי שם לקובץ
  renameFile(file: File): File {
    return new File([file], this.sanitizeFileName(file.name), { type: file.type });
  }

  //החזרת הערך להכנסה למסד נתונים לפי מצב הטופס 
  getContentOption(option:string)
  {
     const options :Record<string, string>={
     edit:'text',
     add:'file',
     addLink:'link'
     }
     
     const reverseOptions = Object.fromEntries(
      Object.entries(options).map(([key, value]) => [value, key])
    );
  
    // בדיקה לפי מפתח
    if (options[option]) {
      return options[option];
    }
  
    // בדיקה לפי ערך
    return reverseOptions[option];
  
  }

  //קבלת _ID של המשתמש הנוכחי
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

  //שליחת הטופס
  onSubmit() :void
  {
    this.isSubmitting = true;//לחסימת אפשרות ליותר משליחה אחת
    this.getUserIdFromToken();//קבלת _ID למשתמש
    if(this.content && !this.file)//אם הקובץ הוא של העלאת תוכן שמירה שלו במשתנה
    {
       this.file=this.createTextFile();
    }
    if (this.fileForm.valid && (this.file || this.link ) && ((!this.isImage && this.coverImage) || this.isImage)) //ולידציה של השדות
      {
        const formData= new FormData();
        
        const metadata={
          ...this.fileForm.value,
          createdBy:this.userId,
          filePath:this.link, //אם לא הוכנס קישור נכנס מחרוזת ריקה
          contentOption:this.getContentOption(this.contentOption)//מצב הטופס
        }
         
         let str:string=JSON.stringify(metadata)
        console.log("string data: "+str)
        formData.append('metadata',str) //הכנסת אוביקט של הנתונים לאוביקט שליחה
        if(this.file)
        {
         const rename=this.renameFile(this.file)
         console.log(rename);
         
          formData.append('resource',rename)//הכנסת הקובץ לאוביקט לשליחה
        }

        if(this.isImage)
        {
          this.coverImage=this.file //אם סוג תמונה תמונת השער היא אותה תמונה
        }
           

        if(this.coverImage && this.contentOption!=='edit')//הכנסת תמונת שער לאוביקט לשליחה
        {
          console.log("image "+this.coverImage);
          
          formData.append('coverImage',this.renameFile(this.coverImage))
        }
          
       console.log(" נתונים" +formData.get('metaData'));
       
        this.apiService.Post('/EducationalResource',formData).subscribe({
          next: (response) => {
           console.log('טופס נשלח בהצלחה:', this.fileForm.value); 
           Swal.fire({ //הודעה למשתמש
            title: 'טופס נשלח בהצלחה!',
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'OK',
            buttonsStyling: true,
            
            customClass: {
                confirmButton: 'btn btn-primary px-4',
                cancelButton: 'btn btn-danger ms-2 px-4',
            
            },
            });
            this.isSubmitting = false;
            this.router.navigate(['/show-details']);//מעבר למסך הנתונים
          },
          error: (err) =>  
          {
           console.log('תקלה בשליחת טופס',err);
          Swal.fire({ //הודעה למשתמש
            title: 'תקלה בשליחת הטופס!',
            text: 'שגיאה '+err.status ,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            buttonsStyling: true,
            
            customClass: {
                confirmButton: 'btn btn-primary px-4',
                cancelButton: 'btn btn-danger ms-2 px-4',
            
            },
            });
            this.isSubmitting = false;

          },
        });
        this.formErrorMessage=null;
  }else{
    console.log("טופס לא תקין");
    this.isSubmitting = false;

    if(this.file || this.link || this.content){
      this.fileErrorMessage=null
    }
    else{
      this.fileErrorMessage="חסר קובץ / קישור / תוכן. אנא מלאי אחת מהאפשרויות"
    }

    if(this.coverImage)
      this.coverImageErrorMessage=null
    else
     this.coverImageErrorMessage="חסר תמונת תצוגה מקדימה לקובץ"
    
    this.formErrorMessage="טופס לא תקין. אנא וודאי שכל השדות הנדרשים מלאים" //הצגת מסר למשתמש אם השדות לא תקינים
    this.fileForm.markAllAsTouched();
  }
  
}

}


