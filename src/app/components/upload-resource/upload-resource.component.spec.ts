
import { UploadResourceComponent } from './upload-resource.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('UploadResourceComponent', () => {
    let component: UploadResourceComponent;
    let fixture: ComponentFixture<UploadResourceComponent>;
    let dialogSpy: jasmine.Spy;
    let snackBarSpy: jasmine.Spy;

  
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [UploadResourceComponent]
      })
      .compileComponents();
  
      fixture = TestBed.createComponent(UploadResourceComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  

  beforeEach(async () => {
    const mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of({ newValue: 'Test Tag', description: 'Test Description' }),
      }),
    };

    const mockSnackBar = {
      open: jasmine.createSpy('open'),
    };

    await TestBed.configureTestingModule({
      declarations: [UploadResourceComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadResourceComponent);
    component = fixture.componentInstance;
    dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue({
      afterClosed: () => of({}) // מחזיר Observable לדיאלוג שנסגר
    } as MatDialogRef<any>);
    snackBarSpy = spyOn(TestBed.inject(MatSnackBar), 'open').and.returnValue({
      dismiss: () => {} // דוגמה למתודה שמוחזרת
    } as MatSnackBarRef<any>);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('add function', () => {
    it('should add a valid option to the selected list and form array', () => {
      component.multipleChoiceFields = {
        tags: {
          allOption: [{ _id: '1', name: 'Tag1' }],
          optionSelected: [],
          Ctrl: new FormControl(''),
          filteredOption$: of([]) // או Observable אחר אם יש דינמיות
        },
      };

      const mockEvent = { value: 'Tag1', chipInput: { clear: jasmine.createSpy('clear') } };

      component.fileForm = new FormGroup({
        tags: new FormArray([]),
      });

      component.add(mockEvent, 'tags');
      expect(component.multipleChoiceFields['tags'].optionSelected).toContain('1');
      expect((component.fileForm.get('tags') as FormArray).length).toBe(1);
    });

    it('should not add a duplicate option', () => {
      component.multipleChoiceFields = {
        tags: {
          allOption: [{ _id: '1', name: 'Tag1' }],
          optionSelected: ['1'],
          Ctrl: new FormControl(''),
          filteredOption$: of([]) // או Observable אחר אם יש דינמיות
        },
      };

      const mockEvent = { value: 'Tag1', chipInput: { clear: jasmine.createSpy('clear') } };

      component.fileForm = new FormGroup({
        tags: new FormArray([]),
      });

      component.add(mockEvent, 'tags');
      expect(component.multipleChoiceFields['tags'].optionSelected).toEqual(['1']);
    });
  });

  describe('remove function', () => {
    it('should remove an option from the selected list and form array', () => {
      component.multipleChoiceFields = {
        tags: {
          allOption: [{ _id: '1', name: 'Tag1' }],
          optionSelected: ['1'],
          Ctrl: new FormControl(''),
          filteredOption$: of([]) // או Observable אחר אם יש דינמיות
        },
      };

      component.fileForm = new FormGroup({
        tags: new FormArray([new FormControl('1')]),
      });

      component.remove('1', 'tags');
      expect(component.multipleChoiceFields['tags'].optionSelected).not.toContain('1');
      expect((component.fileForm.get('tags') as FormArray).length).toBe(0);
    });
  });

  describe('onSubmit function', () => {
    it('should submit the form when valid', () => {
      spyOn(component.apiService, 'Post').and.returnValue(of({}));

      component.fileForm = new FormGroup({
        type: new FormControl('Test Type'),
        tags: new FormArray([]),
      });
      component.contentOption = 'physicalBook';
      component.isImage = true;
      component.coverImage = new File([''], 'cover.jpg', { type: 'image/jpeg' });

      component.onSubmit();
      expect(component.apiService.Post).toHaveBeenCalled();
      expect(snackBarSpy).toHaveBeenCalledWith('טופס נשלח בהצלחה', 'Close', jasmine.any(Object));
    });

    it('should show error message when form is invalid', () => {
      component.fileForm = new FormGroup({
        type: new FormControl(''),
        tags: new FormArray([]),
      });
      component.onSubmit();
      expect(component.formErrorMessage).toBe('טופס לא תקין. אנא וודאי שכל השדות הנדרשים מלאים');
    });
  });
});