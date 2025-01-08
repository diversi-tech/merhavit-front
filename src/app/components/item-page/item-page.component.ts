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
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { signal } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {ChangeDetectionStrategy, model} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {provideNativeDateAdapter} from '@angular/material/core';
import {JsonPipe} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { ChangeDetectorRef } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';



@Component({
  selector: 'app-item-page',
  templateUrl:'./item-page.component.html', //'./item-page.component.html',
  styleUrls: ['./item-page.component.css'],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [CommonModule, MatFormFieldModule, MatChipsModule, MatIconModule,MatCardModule, MatFormFieldModule
    FormsModule, ReactiveFormsModule, JsonPipe, MatDatepickerModule,MatInputModule,MatNativeDateModule,
     MatButtonModule, MatDividerModule, ], // ייבוא המודולים
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
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
  inputValue: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

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


  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog // הוספת MatDialog
  ) {}

  ngOnInit(): void {
  const itemId = this.route.snapshot.paramMap.get('id');
  if (itemId) {
    this.fetchItemDetails(itemId);
    this.fetchSimilarItems(itemId);
    this.fetchTagsFromServer(itemId); // טעינת התגיות מהשרת
  } else {
    console.error('Item ID not found in route');
  }
  this.cdr.detectChanges();
}
borrowItem(){

}


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
    } else if (fileType.includes('pdf') || fileType.includes('ספר דיגיטלי') || fileType.includes('digitalBook')) {
      this.clearPreviewsExcept('ספר דיגיטלי');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    }else if (fileType.includes('ספר להשאלה') || fileType.includes('physicalBook')) {
      this.clearPreviewsExcept('ספר להשאלה');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else {
      console.error('Unknown file type:', fileType);
      this.previewUrl = null;
    }
    console.log('Cover image URL:', this.item?.coverImage);
  }  

  clearPreviewsExcept(type: 'כרזה' | 'דף עבודה' | 'איור' | 'יצירה' | 'סרטון' | 'מערך' | 'ספר דיגיטלי' | 'ספר להשאלה' | 'שיר') {
    this.isPoster = type === 'כרזה';
    this.isWorksheet = type === 'דף עבודה';
    this.isPainting = type === 'איור';
    this.isCreation = type === 'יצירה';
    this.isAudio = type === 'שיר';
    this.isVideo = type === 'סרטון';
    this.isDocument = type === 'מערך';
    this.digitalBook = type === 'ספר דיגיטלי';
    this.physicalBook = type === 'ספר להשאלה';
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
  
}
