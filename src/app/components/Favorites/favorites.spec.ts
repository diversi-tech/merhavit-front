import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
    waitForAsync,
  } from '@angular/core/testing';
  import { FavoritesComponent } from './favorites';
  import { ApiService } from '../../api.service';
  import { Router } from '@angular/router';
  import { MatSnackBar } from '@angular/material/snack-bar';
  import { of } from 'rxjs';
  
  // Mock Services
  class MockApiService {
    Read(url: string) {
      console.log('MockApiService: Read called with URL:', url);
      return of({
        favorites: [
          {
            _id: '677fcf3e791d6faa2e7e97fb',
            userId: '214425100',
            itemId: '677e93be3256a988b52ffb34',
            itemDetail: { title: 'מערך שיעור במתמטיקה' },
          },
        ],
      });
    }
  
    ReadWithParams(url: string, params: any) {
      return of([{ _id: '123', name: 'Item 1', detail: 'Details of Item 1' }]);
    }
  
    Delete(url: string, body: any) {
      return of({});
    }
  }
  
  class MockRouter {
    navigate = jasmine.createSpy('navigate');
  }
  
  class MockMatSnackBar {
    open(message: string, action: string, config: any) {}
  }
  
  describe('FavoritesComponent', () => {
    let component: FavoritesComponent;
    let fixture: ComponentFixture<FavoritesComponent>;
    let apiService: ApiService;
    let router: Router;
    let snackBar: MatSnackBar;
  
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [FavoritesComponent],
        providers: [
          { provide: ApiService, useClass: MockApiService },
          { provide: Router, useClass: MockRouter },
          { provide: MatSnackBar, useClass: MockMatSnackBar },
        ],
      }).compileComponents();
    }));
  
    beforeEach(() => {
      fixture = TestBed.createComponent(FavoritesComponent);
      component = fixture.componentInstance;
      apiService = TestBed.inject(ApiService);
      router = TestBed.inject(Router);
      snackBar = TestBed.inject(MatSnackBar);
      fixture.detectChanges();
    });
  
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  
    it('should fetch favorites on initialization', fakeAsync(() => {
      // מצפה שהקריאה תבוצע לנתיב המתאים
      const favoritesSpy = spyOn(apiService, 'Read').and.returnValue(of({
        favorites: [
          {
            _id: '677fcf3e791d6faa2e7e97fb',
            userId: '214425100',
            itemId: '677e93be3256a988b52ffb34',
            itemDetail: {
              title: 'מערך שיעור במתמטיקה',
            },
          },
        ],
      }));
  
      // קריאה ל-ngOnInit כדי לדמות את אתחול הקומפוננטה
      component.ngOnInit();
      tick(); // מסיים קריאות אסינכרוניות
      fixture.detectChanges();
  
      // בדיקות
      expect(favoritesSpy).toHaveBeenCalledWith('/favorites');
      expect(component.favorites.length).toBeGreaterThan(0);
      expect(component.favorites[0].itemDetail.title).toBe('מערך שיעור במתמטיקה');
      console.log('favorites', component.favorites);
    }));
  
    it('should remove a favorite', () => {
      component.favorites = [{ itemId: '123', name: 'Item 1' }];
      spyOn(apiService, 'Delete').and.callThrough();
      component.removeFavorite('123');
      expect(apiService.Delete).toHaveBeenCalled();
      expect(component.favorites.length).toBe(0);
    });
  
    it('should navigate to item page', () => {
      component.navigateToItemPage('123');
      expect(router.navigate).toHaveBeenCalledWith(['/item-page/123']);
    });
  });
  