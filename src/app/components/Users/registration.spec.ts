import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationComponent } from './registration';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

class MockApiService {
  Read(url: string) {
    if (url === '/seminaries') {
      return of([{ name: 'Seminary A' }, { name: 'Seminary B' }]);
    } else if (url === '/specializations') {
      return of([{ name: 'Specialization A' }, { name: 'Specialization B' }]);
    } else if (url === '/classes') {
      return of([{ name: 'Class A' }, { name: 'Class B' }]);
    }
    return of([]);
  }

  Post(url: string, data: any) {
    if (url === '/users/register') {
      return of({ access_token: 'mock-token' });
    }
    return throwError(() => new Error('Registration failed'));
  }
}

fdescribe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
  let apiService: MockApiService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule,RegistrationComponent],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
    ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  fit('should create the component', () => {
    expect(component).toBeTruthy();
  });

  fit('should initialize form with required fields', () => {
    expect(component.registrationForm.contains('firstName')).toBeTrue();
    expect(component.registrationForm.contains('lastName')).toBeTrue();
    expect(component.registrationForm.contains('idNumber')).toBeTrue();
  });

  fit('should enable form controls after fetching data', async () => {
    component.ngOnInit();
    await fixture.whenStable(); // מחכה לסיום כל הבטחות ה-async
    fixture.detectChanges();

    expect(component.registrationForm.get('seminar')?.enabled).toBeTrue();
    expect(component.registrationForm.get('specialization')?.enabled).toBeTrue();
    expect(component.registrationForm.get('class')?.enabled).toBeTrue();
  });
  it('should submit the form and navigate on success', fakeAsync(() => {
    spyOn(apiService, 'Post').and.returnValue(of({ access_token: 'mock-token' }));
  
    component.registrationForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      idNumber: '123456789',
      address: '123 Main St',
      phone: '0512345678',
      email: 'john.doe@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      class: 'Class A',
      specialization: 'Specialization A',
      seminar: 'Seminary A',
    });
  
    component.onSubmit();
    tick(); // מסמל ל-Observable לסיים את הבטחות ה-async
  
    expect(apiService.Post).toHaveBeenCalledWith('/users/register', jasmine.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/success-registration']);
  }));
  

  it('should display an error message if registration fails', () => {
    spyOn(apiService, 'Post').and.returnValue(throwError(() => new Error('Registration failed')));
    component.onSubmit();
    expect(component.errorMessage).toBe('הרשמה נכשלה.');
  });

  it('should invalidate the form if passwords do not match', () => {
    component.registrationForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      idNumber: '123456789',
      address: '123 Main St',
      phone: '0512345678',
      email: 'john.doe@example.com',
      password: 'password123',
      confirmPassword: 'differentPassword',
      class: 'Class A',
      specialization: 'Specialization A',
      seminar: 'Seminary A',
    });

    component.onSubmit();

    expect(component.registrationForm.valid).toBeFalse(); // הטופס אמור להיות לא תקין
    expect(component.errorMessage).toBe('הרשמה נכשלה. אנא בדוק את כל השדות ונסה שוב.');
  });
});
