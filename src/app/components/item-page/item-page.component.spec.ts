import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';  // הוספתי fakeAsync ו-tick
import { ItemPageComponent } from './item-page.component';
import { ApiService } from '../../api.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ItemPageComponent', () => {
  let component: ItemPageComponent;
  let fixture: ComponentFixture<ItemPageComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;


  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['Read']);
    TestBed.configureTestingModule({
      imports: [ MatDialogModule, BrowserAnimationsModule],
      declarations: [],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '1' } } } }
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ItemPageComponent);
    component = fixture.componentInstance;
  });
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch item details successfully', fakeAsync(() => {
    const mockItem = { id: '1', tags: [], filePath: '', type: 'audio', title: 'Test Item' };
    mockApiService.Read.and.returnValue(of(mockItem)); // החזרת Mock עבור קריאה ל-API
    const itemId = '1';
    component.fetchItemDetails(itemId);
    tick();
    expect(mockApiService.Read).toHaveBeenCalledWith(`/item-page/${itemId}`);
    expect(component.item).toEqual(jasmine.objectContaining(mockItem));
  }));
  it('should handle error when fetching item details', fakeAsync(() => {
    mockApiService.Read.and.returnValue(throwError(() => new Error('API error'))); // החזרת שגיאה
    const itemId = '1';

    // קריאה לפונקציה שמביאה את פרטי הפריט
    component.fetchItemDetails(itemId);

    tick();  // עליך לקרוא ל-tick כדי לדמות את הזמן שעובר

    // בדיקה לוודא שהשגיאה תטופל כראוי
    expect(mockApiService.Read).toHaveBeenCalledWith(`/item-page/${itemId}`);
    expect(component.item).toBeNull();
  }));

  // בדיקה להצלחה בהבאת פריטים דומים
  it('should fetch similar items successfully', fakeAsync(() => {
    const mockSimilarItems = [{ id: '1', coverImage: 'test.jpg' }];
    mockApiService.Read.and.returnValue(of(mockSimilarItems)); // החזרת Mock עבור פריטים דומים
    const itemId = '1';

    // קריאה לפונקציה שמביאה את הפריטים הדומים
    component.fetchSimilarItems(itemId);

    tick();  // עליך לקרוא ל-tick כדי לדמות את הזמן שעובר

    // בדיקות לוודא שהקריאה ל-API נעשתה כראוי ושהנתונים נשמרים ברכיב
    expect(mockApiService.Read).toHaveBeenCalledWith(`/item-page/${itemId}/similar`);
    expect(component.similarItems).toEqual(jasmine.objectContaining(mockSimilarItems));
  }));

  // בדיקה להתמודדות עם שגיאה בעת ניסיון להוריד פריטים דומים
  it('should handle error when fetching similar items', fakeAsync(() => {
    mockApiService.Read.and.returnValue(throwError(() => new Error('API error'))); // החזרת שגיאה
    const itemId = '1';

    // קריאה לפונקציה שמביאה את הפריטים הדומים
    component.fetchSimilarItems(itemId);

    tick();  // עליך לקרוא ל-tick כדי לדמות את הזמן שעובר

    // בדיקה לוודא שהשגיאה תטופל כראוי
    expect(mockApiService.Read).toHaveBeenCalledWith(`/item-page/${itemId}/similar`);
    expect(component.similarItems).toEqual([]); // תוודא שהפריטים הדומים יישארו ריקים במקרה של שגיאה
  }));

  // בדיקה לעדכון כותרת הדף כאשר פרטי הפריט נגרעים
  // it('should update document title when item details are fetched', fakeAsync(() => {
  //   const mockItem = {
  //     _id: '1',
  //     title: 'Test Item',
  //     publicationDate: '11-12-2021',
  //     type: 'audio',
  //     subjects: ['שינוי'],
  //     ages: 15,
  //     level: 'גבוהה',
  //     language: 'עברית',
  //     releaseYear: '2025',
  //     author: 'דוד',
  //     description: 'גדול ומרשים',
  //     tags: ['מבצעים והנחות', 'המלצות וספרים'],
  //     createdBy: null,
  //     coverImage: 'https://merchavit2.s3.eu-north-1.amazonaws.com/media/cover%20images/1734619324344-xxxxxxxx20241219161520.jpg',
  //     filePath: 'https://merchavit2.s3.eu-north-1.amazonaws.com/media/cover%20images/1734619324344-xxxxxxxx20241219161520.jpg',
  //     specializations: ['הוראה', 'מחשבים'],
  //     physicalBook: false,
  //     loanValidity: 1
  //   };
  //   mockApiService.Read.and.returnValue(of(mockItem)); // החזרת Mock עבור פרטי פריט
  //   const itemId = '1';

  //   // קריאה לפונקציה שמביאה את פרטי הפריט
  //   component.fetchItemDetails(itemId);

  //   tick();  // עליך לקרוא ל-tick כדי לדמות את הזמן שעובר

  //   fixture.detectChanges(); // עדכון ה-DOM

  //   // בדיקה לוודא שכותרת הדף השתנתה כראוי
  //   expect(document.title).toBe('Test Item');
  // }));
});
