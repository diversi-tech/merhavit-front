import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../api.service';
import { Item } from '../interfaces/item-page.interface';
import { SimilarItem } from '../interfaces/similar-item-page.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER, I } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { signal } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChangeDetectionStrategy, model } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ChangeDetectorRef } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { lastValueFrom, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-item-page',
  templateUrl: './item-page.component.html', //'./item-page.component.html',
  styleUrls: ['./item-page.component.css'],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [CommonModule, MatFormFieldModule, MatChipsModule, MatIconModule, MatCardModule, MatFormFieldModule,
    FormsModule, ReactiveFormsModule, JsonPipe, MatDatepickerModule, MatInputModule, MatNativeDateModule,
    MatButtonModule, MatDividerModule,], // ייבוא המודולים
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ItemPageComponent implements OnInit {
  item: Item | null = null;
  similarItems: SimilarItem[] = [];
  previewUrl: SafeResourceUrl | null = null;
  isPoster = false;
  isWorksheet = false;
  isPainting = false;
  isCreation = false;
  isAudio = false;
  isVideo = false;
  digitalBook = false;
  physicalBook = false;
  isDocument = false; // ניהול הצגת המסמך
  text = false;
  inputValue: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  allOptions: any[] = []; // שמירת כל האפשרויות
  public isHeaderDisplayed = false;
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  announcer = inject(LiveAnnouncer); // שימוש ב-inject להזרקת ה-LiveAnnouncer
  // formControl = new FormControl();
  tags = signal<string[]>([]);
  readonly reactiveKeywords = signal(['']);
  readonly formControl = new FormControl(['angular']);
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  multipleChoiceFields: { //מפה לשמירת המשתנים לכל שדה שיש בו בחירה מרובה מתוך רשימה
    [key: string]: {
      Ctrl: FormControl<string | null | any>;
      optionSelected: string[] | any[];
      allOption: string[] | any[];
      filteredOption$: Observable<string[] | any[]> | null | undefined;
    };
  } = {
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


  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog, // הוספת MatDialog
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('id');
    if (itemId) {
      this.fetchItemDetails(itemId);
      this.fetchSimilarItems(itemId);
      this.fetchTagsFromServer(itemId); // טעינת התגיות מהשרת
      const requests: Promise<void>[] = Object.keys(this.multipleChoiceFields).map((key) => {
        return this.getfromServer(`/${this.createPath(key)}`, key);
      })
    } else {
      console.error('Item ID not found in route');
    }
    this.cdr.detectChanges();
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

  borrowItem() { }
  fetchItemDetails(itemId: string) {
    if (!itemId) {
      console.error('Invalid item ID');
      return;
    }

    console.log('Fetching item details for ID:', itemId);
    this.apiService.Read(`/item-page/${itemId}`).subscribe({
      next: (response) => {
        console.log('Item details received:', response);
        if (!Array.isArray(response.tags)) {
          response.tags = [];
        }
        this.item = response;
        // כאן נעדכן את ה-tags מתוך פרטי הפריט
        this.tags.set(response.tags || []);
        this.setPreviewUrl(response);
        // סימון שהמידע השתנה ויש לעדכן את התצוגה
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching item details', err);
      },
    });
  }

  fetchSimilarItems(itemId: string) {
    if (!itemId) {
      console.error('Invalid item ID');
      return;
    }

    console.log('Fetching similar items for ID:', itemId);
    this.apiService.Read(`/item-page/${itemId}/similar`).subscribe({
      next: (response) => {
        console.log('Similar items received:', response);
        this.similarItems = response;
        if (this.similarItems.length == 0)
          this.isHeaderDisplayed = false;
        else
          this.isHeaderDisplayed = true;
        // סימון שהמידע השתנה ויש לעדכן את התצוגה
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching similar items', err);
      },
    });
  }

  setPreviewUrl(item: Item) {
    const fileType = item?.type?.toLowerCase() ?? '';
    const fileUrl = item?.filePath ?? '';

    console.log('File Type:', fileType);
    console.log('File URL:', fileUrl);

    if (fileType.includes('audio') || fileType.includes('אודיו') || fileType.includes('שיר')) {
      this.clearPreviewsExcept('שיר');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else if (fileType.includes('poster') || fileType.includes('כרזה')) {
      this.clearPreviewsExcept('כרזה');
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(fileUrl);
    } else if (fileType.includes('worksheet') || fileType.includes('דף עבודה')) {
      this.clearPreviewsExcept('דף עבודה');
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(fileUrl);
    } else if (fileType.includes('painting') || fileType.includes('איור') || fileType.includes('ציור')) {
      this.clearPreviewsExcept('איור');
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(fileUrl);
    } else if (fileType.includes('creation') || fileType.includes('יצירה')) {
      this.clearPreviewsExcept('יצירה');
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(fileUrl);
    } else if (fileType.includes('video') || fileType.includes('סרטון')) {
      this.clearPreviewsExcept('סרטון');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else if (fileType.includes('pdf') || fileType.includes('מערך')) {
      this.clearPreviewsExcept('מערך');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else if (fileType.includes('text') || fileType.includes('טקסט')) {
      this.clearPreviewsExcept('טקסט');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else if (fileType.includes('pdf') || fileType.includes('ספר דיגיטלי') || fileType.includes('digitalBook')) {
      this.clearPreviewsExcept('ספר דיגיטלי');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else if (fileType.includes('ספר פיזי') || fileType.includes('physicalBook')) {
      this.clearPreviewsExcept('ספר פיזי');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else {
      console.error('Unknown file type:', fileType);
      this.previewUrl = null;
    }
    console.log('Cover image URL:', this.item?.coverImage);
  }

  clearPreviewsExcept(type: 'כרזה' | 'דף עבודה' | 'איור' | 'יצירה' | 'סרטון' | 'מערך' | 'טקסט' | 'ספר דיגיטלי' | 'ספר פיזי' | 'שיר') {
    this.isPoster = type === 'כרזה';
    this.isWorksheet = type === 'דף עבודה';
    this.isPainting = type === 'איור';
    this.isCreation = type === 'יצירה';
    this.isAudio = type === 'שיר';
    this.isVideo = type === 'סרטון';
    this.isDocument = type === 'מערך';
    this.text = type === 'טקסט';
    this.digitalBook = type === 'ספר דיגיטלי';
    this.physicalBook = type === 'ספר פיזי';
  }

    downloadResource(item: Item): void {
    if (!item._id) {
      console.error('Item ID is missing.');
      // alert('לא ניתן להוריד את הקובץ. חסר ID');
      this._snackBar.open('לא ניתן להוריד את הקובץ. חסר ID', 'סגור', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        direction: 'rtl',
      });
      return;
    }
    if (!item.filePath) {
      console.error('File path is missing.');
      // alert('לא ניתן להוריד את הקובץ. חסר ניתוב');
      this._snackBar.open('לא ניתן להוריד את הקובץ. חסר ניתוב', 'סגור', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        direction: 'rtl',
      });
      return;
    }
    this.apiService
      .Read(
        `/EducationalResource/presigned-url?filePath=${encodeURIComponent(
          item.filePath
        )}`
      )
      .subscribe({
        next: (response) => {
          const presignedUrl = response.url;
          if (response && response.url) {
            const downloadLink = document.createElement('a');
            downloadLink.href = response.url;
            downloadLink.download = item.title; // אפשר להוסיף כאן סיומת אם יש צורך
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } else {
            console.error('Invalid response for download URL.');
            // alert('לא ניתן להוריד את הקובץ. אנא נסה שוב.');
            this._snackBar.open(
              'לא ניתן להוריד את הקובץ. אנא נסה שוב.',
              'סגור',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
                direction: 'rtl',
              }
            );
          }
        },
        error: (err) => {
          console.error('Error fetching presigned URL:', err);
          // alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');
          this._snackBar.open('שגיאה בהורדת הקובץ. אנא נסה שוב.', 'סגור', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            direction: 'rtl',
          });
        },
      });
  }

  navigateToItem(itemId: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/item-page', itemId]);
    });
  }

  getCoverImageSimilarItem(item: SimilarItem): string {
    return item.coverImage || 'נתיב ברירת מחדל לתמונה';
  }

  fetchTagsFromServer(itemId: string): void {
    const url = `/item-page/${itemId}/tags`;
    this.apiService.Read(url).subscribe({
      next: (response: any) => {
        console.log('Raw response fetched from server:', response);
        if (response && Array.isArray(response.tags)) {
          this.reactiveKeywords.set(response.tags);  // הגישה למערך מתוך המאפיין 'tags'
        } else {
          console.error('Unexpected response format:', response);
          this.reactiveKeywords.set([]); // מוודא שאין שגיאה בקונסול
        }
        // סימון שהמידע השתנה ויש לעדכן את התצוגה
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching tags from server:', err);
        this.reactiveKeywords.set([]); // הגדרת תגיות ריקות במקרה של שגיאה
      },
    });
  }



  addReactiveKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.reactiveKeywords.update((keywords) => {
        const updatedKeywords = [...keywords, value];

        // שליחת התגיות המעודכנות לשרת
        this.updateTagsOnServer(updatedKeywords);

        return updatedKeywords;
      });

      // ניקוי שדה הקלט
      event.chipInput!.clear();
    }
  }


  removeReactiveKeyword(keyword: string): void {
    this.reactiveKeywords.update((keywords) => {
      const updatedKeywords = keywords.filter((tag) => tag !== keyword);

      // עדכון התגיות בשרת
      this.updateTagsOnServer(updatedKeywords);

      return updatedKeywords;
    });

    this.announcer.announce(`Removed tag: ${keyword}`);
  }



  updateTagsOnServer(tags: string[]): void {
    if (!this.item?._id) {
      console.error('Item ID is missing. Cannot update tags.');
      return;
    }

    const url = `/item-page/${this.item._id}/tags`;
    this.apiService.Put(url, { tags }).subscribe({
      next: () => {
        console.log('Tags updated successfully on the server');
      },
      error: (err) => {
        console.error('Error updating tags on the server:', err);
      },
    });
  }

  validateDates(): void {
    const today = new Date();
    if (this.startDate && this.startDate < today) {
      alert('תאריך ההתחלה חייב להיות מאוחר או שווה להיום!');
      this.startDate = null; // איפוס התאריך
    }
    if (this.endDate && this.endDate > new Date(today.setFullYear(today.getFullYear() + 1))) {
      alert('תאריך הסיום לא יכול להיות רחוק יותר משנה מהתאריך הנוכחי!');
      this.endDate = null; // איפוס התאריך
    }
  }

  // async getFromServer(path: string): Promise<void> {
  //   try {
  //     const response = await lastValueFrom(this.apiService.Read(path));
  //     console.log('Response from server:', response); // לוג של התשובה
  //     if (Array.isArray(response)) {
  //       this.allOptions = response;
  //     } else {
  //       this.allOptions = response.data || [];
  //     }
  //   } catch (err) {
  //     console.error(`Error fetching options from ${path}:`, err);
  //   }
  // }




  // getOptionById(optionId: string): any | undefined {
  //   const option = this.allOptions.find(opt => opt._id === optionId);
  //   if (!option) {
  //     console.warn(`Option with ID ${optionId} not found`);
  //   }
  //   return option;
  // }



  //   //קבלת שם התגית לפי ה_id שלה
  //   getOptionNameById(optionId: string) {
  //     return this.getOptionById(optionId)?.name
  //   }
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
  getOptionById(optionId: string, fieldKey: string) {
    console.log("OptionById", this.multipleChoiceFields[fieldKey].allOption.find(opt => opt._id === optionId));

    return this.multipleChoiceFields[fieldKey].allOption.find(opt => opt._id === optionId)
  }


  //קבלת שם התגית לפי ה_id שלה
  getOptionNameById(optionId: string, fieldKey: string) {
    return this.getOptionById(optionId, fieldKey)?.name
  }


}
