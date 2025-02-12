import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewEncapsulation, computed, ElementRef, inject, model, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { lastValueFrom, map, Observable, startWith, tap } from 'rxjs';
import { ApiService } from '../../api.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { Overlay, OverlayModule, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogComponent } from '../dialog/dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { QuillModule } from 'ngx-quill';
import { transliterate } from 'transliteration';
import { Location } from '@angular/common'  // i added
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
// import { HttpResponse } from '@angular/common/http';
import { ItemsService } from '../../items.service';




@Component({
  selector: 'app-upload-resource',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatChipsModule, MatAutocompleteModule,
    MatFormFieldModule, MatInputModule, MatIconModule, OverlayModule, MatAutocompleteModule,
    MatButtonModule, MatRadioModule, QuillModule, RouterModule, MatCheckboxModule, MatDialogModule],
  templateUrl: './upload-resource.component.html',
  styleUrls: ['./upload-resource.component.css']
})
export class UploadResourceComponent {
  filePath: string = ''; // משתנה לשמירה על הערך של ה-input

  isFirstEdit: boolean = false
  itemID: string = '' //i added
  resourceItem: any; // משתנה חדש לשמירת האובייקט שהתקבל
  fileForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  formMode: string = 'add'
  contentOption: string = 'edit';//שמירת מצב הטופס לפי סוג הקובץ המוכנס לתוכו
  errorMessage: string | null = null;//הודעת שגיאה לכפתור רדיו
  formErrorMessage: string | null = null;//הודעת שגיאה לטופס חסר שדות חובה
  fileErrorMessage: string | null = null //הודעת שגיאה חסר קובץ
  coverImageErrorMessage: string | null = null //הודעת שגיאה חסר תמונת שער
  //שמירה באיזה מצב של הטופס מילאו ערך
  disabledOptions: Record<string, boolean> = {
    edit: false,
    add: false,
    addLink: false,
    physicalBook: false
  }
  content = ''; // תוכן העורך
  fileToEdit: File | null = null;
  link: string = ''; // משתנה לשמירת הקישור שהמשתמש מדביק
  isValidLink: boolean = true;
  previewImage: string | ArrayBuffer | SafeResourceUrl | null = 'assets/camera-placeholder.jpg';//תצוגה מקדימה לקובץ
  file: File | null = null;//קובץ שנבחר
  coverImage: File | null = null;//תמונת שער שנבחרה
  displayImage: string | ArrayBuffer | null = null//שמירת תצוגה מקדימה לתמונת שער
  isVideo: boolean = false;
  isPDF: boolean = false;
  isImage: boolean = true
  isAudio: boolean = false
  fileTypes: Array<string> = ['ספר דיגיטלי', "סרטון", "שיר", "מערך", "כרזה", "דף עבודה", "איור", "יצירה"];
  userId: string = ''
  purchaseLocations: Array<string> = ["חנות ספרים", "פוטומן"];

  levels: Array<string> = ["נמוכה", "גבוהה"];
  languages: Array<string> = ["אנגלית", "עברית"];
  isSubmitting = false;//שמירת המצב האם לחצו על שלח או לא


  multipleChoiceFields: { //מפה לשמירת המשתנים לכל שדה שיש בו בחירה מרובה מתוך רשימה
    [key: string]: {
      Ctrl: FormControl<string | null | any>;
      optionSelected: string[] | any[];
      allOption: string[] | any[];
      filteredOption$: Observable<string[] | any[]> | null|undefined;
    };
  } = {
      'specializations': {
        Ctrl: new FormControl(''),
        optionSelected: [] as string[],
        allOption: [],
        filteredOption$: null as Observable<string[]> | null
      },
      'classes': {
        Ctrl: new FormControl(''),
        optionSelected: [] as string[],
        allOption: [],
        filteredOption$: null as Observable<string[]> | null
      },
      'subjects': {
        Ctrl: new FormControl(''),
        optionSelected: [] as string[],
        allOption: [],
        // ["סבלנות","מרחביות","סטודיו","מקצועי","הר געש","פסח","מדעים","עונות השנה","מעבדות לחרות"
        //   ,"גיל ההתבגרות","ואהבת לרעך כמוך","עבודת המידות","חסד","נתינה","הפרפר והגולם","מתמטיקה","גאוגרפיה",
        // "גשם","חורף","צונאמי","גדולי ישראל"],
        filteredOption$: null as Observable<string[]> | null
      },
      'tags': {
        Ctrl: new FormControl(''),
        optionSelected: [],
        allOption: [''],
        filteredOption$: null as Observable<[]> | null
      }
    }

  readonly addOnBlur = true;

  constructor(private itemService:ItemsService, private pr: ActivatedRoute, private location: Location, private me: ActivatedRoute, private fb: FormBuilder, private sanitizer: DomSanitizer, public apiService: ApiService, private dialog: MatDialog, private snackBar: MatSnackBar, private router: Router) {
    // יצירת טופס
    this.fileForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      subjects: this.fb.array([], [Validators.required]),
      approved: ['כן'],
      loanValidity: [0,[Validators.required]],
      specializations: this.fb.array([], [Validators.required]),
      classes: this.fb.array([], [Validators.required]),
      level: ['', Validators.required],
      language: ['', Validators.required],
      purchaseLocation: [''],
      price: [''],
      catalogNumber: [''],
      releaseYear: [''],
      author: ['', Validators.required],
      description: [''],
      tags: this.fb.array([[]]),
      libraryLocation: ['']
    });
    
    Object.entries(this.multipleChoiceFields).forEach(([key, value]) => {
      value.filteredOption$ = value.Ctrl.valueChanges.pipe(
        startWith(''),
        map((value: string | any | null) => this._filter(value?.trim() ?? '', key))
      );
    });
  }

  //פונקציה שמחזירה האם הערך שהתקבל מופיע ברשימה הכוללת
  private _filter(value: any, fieldKey: string): any[] {
    const field = this.multipleChoiceFields[fieldKey]
    const filterValue = value.toLowerCase();

    if (!filterValue) {
      return field.allOption;
    }

    return field.allOption.filter(option => {
      if (typeof option === 'string') {
        return option.toLowerCase().includes(filterValue);
      } else if (typeof option === 'object' && option.name) {
        return option.name.toLowerCase().includes(filterValue);
      }
      return false;
    });
  }

  updateFilteredOptions(fieldKey: string): void {
    const field = this.multipleChoiceFields[fieldKey];
    // קובע את הערך ל-'' כדי להפעיל את המנגנון של סינון האופציות
    field.Ctrl.setValue('');
  }

  //מאתחלת את כל הערכים של בחירה מרובה בטופס לריקים
  ngOnInit(): void {
    this.pr.queryParamMap.subscribe(queryParams => {
      const additionalParam = queryParams.get('additionalParam');
      this.formMode = additionalParam !== null ? additionalParam : this.formMode; // הצבת הערך לתוך formMode או שמירה על ברירת המחדל
    });

    

    const requests:Promise<void>[]= Object.keys(this.multipleChoiceFields).map((key) => {
      const Array = this.fileForm.get(key) as FormArray;

      while (Array?.length > 0) {
        Array.removeAt(0);
      }
        console.log("path", this.createPath(key));

      return this.getfromServer(`/${this.createPath(key)}`, key);
    })

    if (this.formMode == 'edit') {

      this.me.params.subscribe(p => {
        this.itemID = p['_id']
        console.log("Received resource ID: ", this.itemID);
      })

      this.apiService.Read(`/EducationalResource/${this.itemID}`).subscribe({
        next: (response: any) => {
          console.log("This is the response: ", response);
          // שמירת האובייקט במשתנה חדש
          this.resourceItem = response; // resourceItem הוא משתנה חדש בקומפוננטה שלך
           this.contentOption = this.getContentOption(this.resourceItem.contentOption)
           console.log("file "+this.resourceItem.filePath);
           
          this.fileForm.patchValue({
            title: this.resourceItem.title || "",
            description: this.resourceItem.description || "",
            author: this.resourceItem.author || "",
            releaseYear: this.resourceItem.releaseYear || "",
            language: this.resourceItem.language || "",
            level: this.resourceItem.level || "",
            type: this.resourceItem.type || "",
            
            approved:this.resourceItem.approved||"",
            loanValidity:this.resourceItem.loanValidity||"",
            purchaseLocation:this.resourceItem.purchaseLocation ||"",
            price:this.resourceItem.price ||"",
            catalogNumber:this.resourceItem.catalogNumber ||"",
            libraryLocation:this.resourceItem.libraryLocation ||"",
            // subjects: Array.isArray(this.resourceItem.subjects) ? this.resourceItem.subjects : [],
            // tags: Array.isArray(this.resourceItem.tags) ? this.resourceItem.tags : [],
            // specializations: Array.isArray(this.resourceItem.specializations) ? this.resourceItem.specializations : [],
            // classes: Array.isArray(this.resourceItem.classes) ? this.resourceItem.classes : [],
          });
          if (this.contentOption == 'physicalBook') {            
            this.fileForm.patchValue({ libraryLocation:this.resourceItem.filePath || '' })}

          const subjectsArray = this.fileForm.get('subjects') as FormArray;
          this.resourceItem.subjects.forEach((subject:any) => {
            subjectsArray.push(this.fb.control(subject));
          });
          const classesArray = this.fileForm.get('classes') as FormArray;
          this.resourceItem.classes.forEach((classItem: any) => {
            classesArray.push(this.fb.control(classItem));
          });
          // this.fileForm.get('libraryLocation')?.valueChanges.subscribe(value => {
          //   this.filePath = value; // עדכון הערך של filePath
          // });
          
          
          const tagsArray = this.fileForm.get('tags') as FormArray;
          this.resourceItem.tags.forEach((tag:any) => {
            tagsArray.push(this.fb.control(tag));
          });

          const specializationsArray = this.fileForm.get('specializations') as FormArray;
          this.resourceItem.specializations.forEach((specialization:any) => {
            specializationsArray.push(this.fb.control(specialization));
          });
          
          if(this.resourceItem.contentOption=='physicalBook' || this.resourceItem.type==='ספר דיגיטלי'|| this.resourceItem.type==='ספר פיזי'||
            this.resourceItem.type==='שיר' || this.resourceItem.type==='סרטון'
          )  
            this.downloadFile(this.resourceItem.coverImage)
          else
               this.downloadFile(this.resourceItem.filePath)
          if(this.contentOption=='add' || this.contentOption=='edit')  //?
             this.isFirstEdit = true

          Promise.all(requests).then(() => {
            // עכשיו כל הקריאות הושלמו, תוכל לבצע את ההדפסה בבטחה
            Object.entries(this.multipleChoiceFields).forEach(([key, value]) => {
              console.log("array in map", key, value.allOption);
              
              if (this.resourceItem[key]) {
                this.resourceItem[key].forEach((element:string) => {
                   value.optionSelected.push(element)
                  value.filteredOption$ = value.filteredOption$?.pipe(
                    map(options => {
                      
                      // בודקת אם האובייקט הוא מערך, ואם כן מוסיפה את הערך החדש
                      if (Array.isArray(options)) {
                        return [...options];
                      }
                      return options; // מחזירה את המחרוזת במקרה שזה לא מערך
                    })
                  );
                });

                }
                    
            });
          }).catch((err) => {
            console.error("Error in one of the requests", err);
          });
          
         if(this.contentOption=='addLink')
            {  
              this.link=this.resourceItem.filePath
              this.disabledOptions['addLink'] = this.link && this.isValidLink ? true : false;
            }
        },
        error: (err) => {
          console.error('Error fetching resource by ID', err);
        },
      });
    }


    this.fileForm.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this.formErrorMessage = null; // הסתרת ההודעה כאשר הטופס תקין
      }

    });
  }

  createPath(key: string): string {
    console.log("hi");

    if (key == 'tags')
      return 'tags/getAll'
    else if (key == 'subjects')
      return 'subjects/getAll'
    else
      return key
  }

  //חסימת אפשרות להעלאת כמה סוגי קבצים
  handleClick(event: Event, option: string): void {

    const modeAble = Object.keys(this.disabledOptions).find(k => this.disabledOptions[k])
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
      physicalBook: 'ספר פיזי'
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
    this.disabledOptions['addLink'] = this.link && this.isValidLink ? true : false;
    this.errorMessage = this.disabledOptions['addLink'] ? null : this.errorMessage;
    if (this.link) {
      this.fileErrorMessage = null
      this.formErrorMessage = null
    }
    else
      this.fileErrorMessage = "חסר קובץ / קישור / תוכן. אנא מלאי אחת מהאפשרויות"
  }

  //בעת בחירת קובץ ממחשב
  downloadFile(filePath: string) {
    if (this.contentOption != 'addLink') {
      console.log("path in download " + filePath);
      this.apiService
        .Read(`/EducationalResource/presigned-url?filePath=${filePath}`)
        .subscribe({
          next: async (response) => {
            const presignedUrl = response.url;
            if (response && response.url) {
              try {
                const fileResponse = await fetch(presignedUrl);
                console.log("file response----", fileResponse.ok);
  
                if (!fileResponse.ok) {
                  throw new Error('Network response was not ok');
                }
                const blob = await fileResponse.blob();
                const file = new File([blob], this.resourceItem.title, { type: blob.type });
                console.log('File received:', file, this.file);

              if(this.contentOption=='add')
              {
                this.file = file;
                this.onFileSelected();
              }
              else
              {
                this.coverImage=file;
                this.onImageSelected()
              }
               if(this.contentOption==='edit')
               {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target) {
                    this.content = event.target.result as string; // שמירת התוכן במשתנה content
                  } else {
                    console.error('FileReader event target is null.');
                  }
                };
                reader.readAsText(file); // קריאה כטקסט (אם זה קובץ טקסט)
              }
              
              } catch (error) {
                console.error('Error fetching the file:', error);
                this.snackBar.open('שגיאה בהורדת הקובץ', 'סגור', {
                  duration: 3000,
                  panelClass: ['error-snackbar'],
                  direction: 'rtl',
                });
              }
            } else {
              console.error('Invalid response for download URL.');
              this.snackBar.open('לא ניתן להוריד את הקובץ', 'סגור', {
                duration: 3000,
                panelClass: ['error-snackbar'],
                direction: 'rtl',
              });
            }
          },
          error: (err) => {
            console.error('Error fetching presigned URL:', err);
            alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');
          },
        });
    }
  }
  

  onFileSelected(event?: Event, filePath?: string): void {
    if(this.contentOption!='Link')
    {
    if (this.isFirstEdit === false) {
      if (event) {
        const input = event.target as HTMLInputElement;
        this.disabledOptions['add'] = this.file ? true : false
        if (input.files && input.files[0]) {
          this.file = input.files[0];
        }
      }

    }
    this.isFirstEdit = false
    
    if (this.file) {
      const fileType = this.file.type;
      
      
      const fileName = this.file.name.toLowerCase();
      

      if (fileType.startsWith('video/')) {
        this.clearPreviewsExcept('video');
        this.previewImage = URL.createObjectURL(this.file);// שמירת התצוגה המקדימה לוידאו
      }
      else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        this.clearPreviewsExcept('document');
        const objectUrl = URL.createObjectURL(this.file);
        this.previewImage = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      }
      else if (fileName.endsWith('.mp3') || fileName.endsWith('.wav')) {
        this.previewImage = URL.createObjectURL(this.file);
        this.clearPreviewsExcept('audio');
      }
      else {
        this.clearPreviewsExcept('image');
        const reader = new FileReader();
        reader.onload = () => {
          this.previewImage = reader.result; //  שמירת התצוגה המקדימה לתמונה 
         
        };   
        reader.readAsDataURL(this.file);
      }
    }
    this.disabledOptions['add'] = this.file ? true : false
    if (this.file) {
      this.fileErrorMessage = null
      this.formErrorMessage = null
    }
  }
}

  //מחיקת הקובץ הנבחר
  removeSelectedFile() {
    this.file = null
    this.previewImage = this.sanitizer.bypassSecurityTrustResourceUrl('assets/camera-placeholder.jpg')
    this.clearPreviewsExcept('image');
    this.disabledOptions['add'] = this.file ? true : false


    this.fileErrorMessage = "חסר קובץ / קישור / תוכן. אנא מלאי אחת מהאפשרויות"
    if (this.formMode == 'edit')
      this.isFirstEdit = false
  }

  removeCoverImage() {
    this.coverImage = null
    this.displayImage = null
    this.coverImageErrorMessage = "חסר תמונת תצוגה מקדימה לקובץ"
    if(this.contentOption=='physicalBook')
      {
       this.disabledOptions['physicalBook'] = this.coverImage ? true : false
      }
  }

  removeLink() {
    this.link = '';
    this.onLinkChange()
  }

  //בעת שינוי סוג קובץ
  onFileTypeChange(event: Event): void {
    const selectedType = (event.target as HTMLSelectElement).value;
    const imagesType: Array<string> = ["כרזה", "דף עבודה", "איור", "יצירה"]
    this.isImage = imagesType.includes(selectedType);//עידכון האם מדובר בתמונה כדי לדעת האם נדרש תמונת שער
  }

  //בעת בחירת תמונת שער
  onImageSelected(event?: Event,filePath?:string): void {
    
    
    if(event)
    {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.coverImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.displayImage = reader.result
      }
      reader.readAsDataURL(this.coverImage);
      
    }
  }
    if (this.coverImage) {
      this.coverImageErrorMessage = null
      this.formErrorMessage = null
    }
    else{
      this.coverImageErrorMessage = "חסר תמונת תצוגה מקדימה לקובץ"
    }
      
    
    if(this.contentOption=='physicalBook')
       {
        this.disabledOptions['physicalBook'] = this.coverImage ? true : false
       }

       if (this.coverImage) {
        const objectUrl = URL.createObjectURL(this.coverImage);
        this.displayImage = objectUrl; // שמירת התצוגה המקדימה לתמונה
    }
  }

  //שמירה איזה סוג קובץ נבחר
  clearPreviewsExcept(type: 'image' | 'video' | 'document' | 'audio') {
    this.isImage = type === 'image' ? true : false;
    this.isVideo = type === 'video' ? true : false;
    this.isPDF = type === 'document' ? true : false;
    this.isAudio = type === 'audio' ? true : false;
  }

  //כאשר מקלידים באפשרות עריכת תוכן
  onEditFileSelected() {
    this.disabledOptions['edit'] = this.content ? true : false//חסימה של שאר האפשרויות
    if (this.content) {
      this.fileErrorMessage = null
      this.formErrorMessage = null
    }
    else
      this.fileErrorMessage = "חסר קובץ / קישור / תוכן. אנא מלאי אחת מהאפשרויות"

  }

  //יצירת קובץ HTML המכיל את התוכן שהמשתמש הקליד
  createTextFile(): File {
    const tempDiv = document.createElement('div');
    // הכנסת תוכן ה-HTML לתוך האלמנט
    tempDiv.innerHTML = this.content;
    // החזרת התוכן כטקסט רגיל (ללא תגיות)
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const lines = text.split('</p>').map(line => line.trim());//חלוקה לשורות
    const firstLine = lines.find(line => this.isValidText(line) && line !== '');
    // הגדרת שם הקובץ
    const fileName = firstLine ? `${firstLine}.html` : 'default.html';//שם הקובץ לפי השורה הראשונ
    this.fileForm.patchValue({ type: 'טקסט' }); // הגדרת ערך ברירת מחדל לסוג
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
  toggleSelection(option: any, fieldKey: string) {
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
  optionClicked(event: Event, option: any, fieldKey: string) {
    event.stopPropagation();
    this.toggleSelection(option, fieldKey);
  }

  displayFn(value: string): string {
    return value;
  }

  //בחירת ערך מרשימה  ע"י לחיצה לשדה בחירה מרובה
  select(event: MatAutocompleteSelectedEvent, fieldKey: string): void {
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
  // getfromServer(path: string, fieldKey: string) {
  //   this.apiService.Read(path).subscribe({
  //     next: (response) => {
  //       if (Array.isArray(response)) {
  //         this.multipleChoiceFields[fieldKey].allOption = response;
  //       } else {
  //         this.multipleChoiceFields[fieldKey].allOption = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //       }
  //     },
  //     error: (err) => {
  //       console.error(`Error fetching ${fieldKey}`, err);
  //     },
  //   });
  // }
  getfromServer(path: string, fieldKey: string): Promise<void> {
    return lastValueFrom(this.apiService.Read(path)).then((response) => {
      if (Array.isArray(response)) {
        this.multipleChoiceFields[fieldKey].allOption = response;
      } else {
        this.multipleChoiceFields[fieldKey].allOption = response.data || [];
      }
    }).catch((err) => {
      console.error(`Error fetching ${fieldKey}`, err);
      return
    });
  }



//קבלת התגית לפי ה_id שלה
getOptionById(optionId: string, fieldKey: string)
  {    
    return this.multipleChoiceFields[fieldKey].allOption.find(opt => opt._id === optionId)
  }


  //קבלת שם התגית לפי ה_id שלה
  getOptionNameById(optionId: string, fieldKey: string) {
    return this.getOptionById(optionId,fieldKey)?.name
  }

  

  paramsForDialog(fieldKey: string) {
    const params: Record<string, {}> = {
      'tags': {
        title: 'הוספת תגית חדשה',
        label: 'שם תגית',
        isDescription: true
      },
      'specializations': {
        title: 'הוספת התמחות חדשה',
        label: 'שם התמחות',
        isDescription: false
      },
      'subjects': {
        title: 'הוספת נושא חדש',
        label: 'שם נושא',
        isDescription: true
      },
    }
    return params[fieldKey]
  }

  //חלון דיאלוג להוספת ערך נוסף
  openDialog(fieldKey: string, path: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: this.paramsForDialog(fieldKey)
    });
    const field = this.multipleChoiceFields[fieldKey]

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.newValue) {
        const createdByIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage

        if (createdByIdNumber) {
          let newObject: any = {}
          if (result.description) {
            newObject = {
              name: result.newValue,
              description: result.description,
              createdByIdNumber: createdByIdNumber, // מוסיף את ה-ID שנמצא ב-LocalStorage
            };
          } else {
            newObject = {
              name: result.newValue,
              createdByIdNumber: createdByIdNumber, // מוסיף את ה-ID שנמצא ב-LocalStorage
            }
          }
          // שליחה דרך BODY במקום PARAM 
          this.apiService.Post(path, newObject).subscribe({
            next: (response) => {
              field.allOption.push({ _id: response.insertedId, ...newObject }); // הוספת הנושא לרשימה אם הוזן
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
  sanitizeFileName(originalName: string) {
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
  getContentOption(option: string) {
    const options: Record<string, string> = {
      edit: 'text',
      add: 'file',
      addLink: 'link',
      physicalBook: 'physicalBook'
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
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fileForm.get('libraryLocation')?.setValue(input.value);
   }


  //שליחת הטופס
  onSubmit(): void {
    this.isSubmitting = true;//לחסימת אפשרות ליותר משליחה אחת
    this.getUserIdFromToken();//קבלת _ID למשתמש
    if (this.content && !this.file)//אם הקובץ הוא של העלאת תוכן שמירה שלו במשתנה
    {
      this.file = this.createTextFile();
    }

    if (this.contentOption == 'physicalBook') {
      this.fileForm.patchValue({ type: 'ספר פיזי' }); // הגדרת ערך ברירת מחדל
      this.updateTypeValidator(false);
    } else {
      this.fileForm.patchValue({ approved: '' })
      // this.fileForm.patchValue({ loanValidity: '' })
      this.fileForm.patchValue({ purchaseLocation: '' })
      this.fileForm.patchValue({ price: '' })
      this.fileForm.patchValue({ catalogNumber: '' })
      this.fileForm.patchValue({ libraryLocation: '' })
    }
    if ((this.fileForm.valid || (this.contentOption!== 'physicalBook' && this.fileForm.value.loanValidity=='')) && (this.file || this.link || (this.contentOption == 'physicalBook' && this.coverImage)) && ((!this.isImage && this.coverImage) || this.isImage)) //ולידציה של השדות
    {
      const formData = new FormData();

      const { libraryLocation, ...form } = this.fileForm.value;
      const metadata = {
        ...form,
        createdBy: this.userId,
        coverImage:'',
        filePath: libraryLocation || this.link, //אם לא הוכנס קישור או מיקום נכנס מחרוזת ריקה
        contentOption: this.getContentOption(this.contentOption)//מצב הטופס
      }

      let str: string = JSON.stringify(metadata)
      formData.append('metadata', str) //הכנסת אוביקט של הנתונים לאוביקט שליחה
      if (this.file) {
        const rename = this.renameFile(this.file)
        formData.append('resource', rename)//הכנסת הקובץ לאוביקט לשליחה
      }

      if (this.isImage && this.contentOption!=='physicalBook') {
        this.coverImage = this.file //אם סוג תמונה -תמונת השער היא אותה תמונה
      }
      
     

      if (this.coverImage && this.contentOption !== 'edit')//הכנסת תמונת שער לאוביקט לשליחה
      {

        formData.append('coverImage', this.renameFile(this.coverImage))
      }

      this.apiService.Post('/EducationalResource', formData).subscribe({
        next: (response) => {
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
        error: (err) => {
          console.log('תקלה בשליחת טופס', err);
          Swal.fire({ //הודעה למשתמש
            title: '!תקלה בשליחת הטופס',
            text: 'שגיאה ' + err.status,
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
      this.formErrorMessage = null;
    } else {
      this.isSubmitting = false;

      if (this.file || this.link || this.content) {
        this.fileErrorMessage = null
      }
      else {
        this.fileErrorMessage = "חסר קובץ / קישור / תוכן. אנא מלאי אחת מהאפשרויות"
      }

      if (this.coverImage)
        this.coverImageErrorMessage = null
      else
        this.coverImageErrorMessage = "חסר תמונת תצוגה מקדימה לקובץ"

      this.formErrorMessage = "טופס לא תקין. אנא וודאי שכל השדות הנדרשים מלאים" //הצגת מסר למשתמש אם השדות לא תקינים
      this.fileForm.markAllAsTouched();
    }

  }

  onSubmitEdit(): void {
    

    if (this.content && this.contentOption==='edit')//אם הקובץ הוא של העלאת תוכן שמירה שלו במשתנה
    {
      this.file = this.createTextFile();
    }
    console.log(this.fileForm.value);
   
    if (this.contentOption == 'physicalBook') {
      this.fileForm.patchValue({ type: 'ספר פיזי' }); // הגדרת ערך ברירת מחדל
      // this.fileForm.patchValue({ libraryLocation:this.resourceItem.filePath || '' })
      this.updateTypeValidator(false);
    } else {
      this.fileForm.patchValue({ approved: '' })
      // this.fileForm.patchValue({ loanValidity: '' })
      this.fileForm.patchValue({ purchaseLocation: '' })
      this.fileForm.patchValue({ price: '' })
      this.fileForm.patchValue({ catalogNumber: '' })
      this.fileForm.patchValue({ libraryLocation:'' })
    }
    console.log("---");
    
    if ((this.fileForm.valid || (this.contentOption!== 'physicalBook' && this.fileForm.value.loanValidity=='')) && (this.file || this.link || (this.contentOption == 'physicalBook' && this.coverImage)) && ((!this.isImage && this.coverImage) || this.isImage)) //ולידציה של השדות
    {
      
      const formData = new FormData();
      console.log("link",this.link);
      
      const { libraryLocation, ...form } = this.fileForm.value;
      const metadata = {
        ...form,
        coverImage:'',
        filePath: libraryLocation || this.link, //אם לא הוכנס קישור או מיקום נכנס מחרוזת ריקה
        contentOption: this.getContentOption(this.contentOption)//מצב הטופס
      }
      console.log("file path",metadata.filePath);
      
      // const metadata = {
      //   ...this.fileForm.value,
      //    filePath:this.link, //אם לא הוכנס קישור נכנס מחרוזת ריקה
      //   contentOption:this.getContentOption(this.contentOption)//מצב הטופס
      // }
      
      let str: string = JSON.stringify(metadata)
      console.log("string data: " + str)
      formData.append('metadata', str) //הכנסת אוביקט של הנתונים לאוביקט שליחה
      if (this.file) {
        const rename = this.renameFile(this.file)
        console.log(rename);
        
        formData.append('resource', rename)//הכנסת הקובץ לאוביקט לשליחה
      }
      console.log("this is image "+this.isImage);
      
      if (this.isImage && this.contentOption!=='physicalBook') {
        console.log("file",this.file);
        
        this.coverImage = this.file //אם סוג תמונה תמונת השער היא אותה תמונה
        console.log("co",this.coverImage);

      }
      
      // if (this.coverImage &&(this.contentOption === 'addLink' || this.contentOption === 'edit') )  //?
      //   this.coverImage=null
      // else
      if (this.coverImage && this.contentOption !== 'edit')//הכנסת תמונת שער לאוביקט לשליחה
      {
        console.log("image " + this.coverImage);

        formData.append('coverImage', this.renameFile(this.coverImage))
      }

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      

      const query = `/EducationalResource/${this.itemID}`;
      console.log("********qeury*** " + query);

      this.apiService.PutWithoutHeaders(query, formData).subscribe({ 
        next: (response) => {
          console.log('טופס נשלח בהצלחה:', response);
          this.snackBar.open('הפריט נערך בהצלחה', 'Close', {
            duration: 3000,
            panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
          });
          this.itemService.fetchItems()
        },
        error: (err) => {
          console.log('תקלה בשליחת טופס', err);
          this.snackBar.open('תקלה בשליחת טופס', 'סגור', {
            duration: 3000,
            panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
          });
        },
      });
    } else {
      console.log("טופס לא תקין");
      this.snackBar.open('בעיה בעריכת הפריט, נסה שוב', 'סגור', {
        duration: 3000,
        panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
      });
    }
    this.location.back()
  }
}
