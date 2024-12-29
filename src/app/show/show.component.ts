import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';

import { ApiService } from '../api.service';
import { jwtDecode } from 'jwt-decode';
import { Router, ActivatedRoute } from '@angular/router';
import { ItemsService } from '../items.service'
import { Item } from '../components/interfaces/item.model';
import { ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-items-list',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule],
})
export class ItemsListComponent implements OnInit {
  public items: Item[] = []; //מערך המוצרים של הספריה
  public allItems: Item[] = []; // מערך המכיל את כל הפריטים
  public userType: string = ''; // משתנה לשמירת סוג המשתמש
  private itemsInterval: any;
  constructor(private http: HttpClient, private apiService: ApiService, private router: Router,private itemsService: ItemsService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}



  ngOnInit(): void {
    // console.log("enter oninit of show")
    // this.itemsService.getAllItems().subscribe((data) => {
    //   this.items = data; // שמירת כל הפריטים שהתקבלו מהשרת
    // });
    this.items = this.itemsService.items;
    console.log("items in show component",this.items)
    this.itemsInterval = setInterval(() => {
      if (this.itemsService.items !== this.items) {
        this.items = [...this.itemsService.items];
        this.cdr.detectChanges(); // עדכון ה-UI
      }
    }, 2000); // כל 2 שניות
  
  }




  getUserTypeFromToken(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          this.userType = decodedToken.userType || '';
          console.log(this.userType);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    } else {
      console.warn('Code is running on the server. Skipping token check.');
    }
  }

  // async getItems(page: number = 0, limit: number = 1000,searchTerm:string = '', typeFilter: string = '') {
  //   if(searchTerm!==''&&typeFilter==='')
  //     {this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}`).subscribe({
  //       next: (response) => {
  //       console.log('All items response: ', response);
  
  //         if (Array.isArray(response)) {
  //       this.items=response;
  //         } else {
  //         this.allItems = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //         }
  //       // אם יש סוג בפרמטרים של ה-URL, נסנן מיד
  //       const type = this.route.snapshot.queryParamMap.get('type');
  //       if (type) {
  //         this.filterItemsByType(type);
  //       } else {
  //         this.items = this.allItems; // הצגת כל הפריטים בהתחלה
  //       }
  //       },
  //       error: (err) => {
  //       console.error('Error fetching all items', err);
  //       },
  //     });}
  //     if(searchTerm===''&&typeFilter!=='')
  //       {this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&typeFilter=${typeFilter}`).subscribe({
  //         next: (response) => {
  //           console.log('i this is the response: ', response);
    
  //           if (Array.isArray(response)) {
  //             this.items = response;
  //           } else {
  //             this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //           }
  //         },
  //         error: (err) => {
  //           console.error('Error fetching items', err);
  //         },
  //       });}
  //       if(searchTerm!==''&&typeFilter!=='')
  //         {this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}&typeFilter=${typeFilter}`).subscribe({
  //           next: (response) => {
  //             console.log('i this is the response: ', response);
      
  //             if (Array.isArray(response)) {
  //               this.items = response;
  //             } else {
  //               this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //             }
  //           },
  //           error: (err) => {
  //             console.error('Error fetching items', err);
  //           },
  //         });}
  //         else
  //         { this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`).subscribe({
  //           next: (response) => {
  //             console.log('i this is the response: ', response);
      
  //             if (Array.isArray(response)) {
  //               this.items = response
  //             } else {
  //               this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //             }
  //           },
  //           error: (err) => {
  //             console.error('Error fetching items', err);
  //           },
  //         });}
  // }



  //בכלל לא מגיע לפה
  getItems(page: number = 0, limit: number = 100, searchTerm: string = '', typeFilter: string = '') {
    console.log("enter to getItems in show component")
    const params: any = { page, limit };
    if (searchTerm) params.searchTerm = searchTerm;
    if (typeFilter) params.typeFilter = typeFilter;
  
    this.apiService.Read(`/EducationalResource/getAll${ params }`).subscribe({
      next: (response) => {
        this.items = response.data || [];
        console.log("items in show.component.ts",this.items)
      },
      error: (err) => {
        console.error('Error fetching items:', err);
      },
    });
  }
  

  editItem(item: Item) {
    this.router.navigate(['/edit-media'], {
      state: { id: item.id }
    });
  }

  deleteResource(itemToDelete: Item) {
    console.log('Delete item: ', itemToDelete);
    this.apiService
      .Delete(`/EducationalResource/${itemToDelete.id}`, {})
      .subscribe({
        next: (response) => {
          console.log('Item deleted successfully:', response);
          alert(response.message);
          this.allItems = this.allItems.filter((item) => item.id !== itemToDelete.id);
          this.items = this.allItems; // עדכון הפריטים המוצגים
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          alert(err.error.message || 'Failed to delete item. Please try again.');
        },
      });
  }

  downloadResource(item: Item): void {
    if (!item.id) {
      console.error('Item ID is missing.');
      alert('לא ניתן להוריד את הקובץ. חסר ID');
      return;
    }

    if (!item.filePath) {
      console.error('File path is missing.');
      alert('לא ניתן להוריד את הקובץ. חסר ניתוב');
      return;
    }
    
    this.apiService
      .Read(`/EducationalResource/presigned-url?filePath=${encodeURIComponent(item.filePath)}`)
      
      .subscribe({
        next: (response) => {
          if (response && response.url) {
            const downloadLink = document.createElement('a');
            downloadLink.href = response.url;
            downloadLink.download = item.title; // אפשר להוסיף כאן סיומת אם יש צורך
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } else {
            console.error('Invalid response for download URL.');
            alert('לא ניתן להוריד את הקובץ. אנא נסה שוב.');
          }
        },
        error: (err) => {
          console.error('Error fetching presigned URL:', err);
          alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');
        },
      });
  }

  filterItemsByType(type: string): void {
    console.log('Filtering items by type:', type);
    this.items = this.allItems.filter((item: Item) => item.type === type);
    console.log('Filtered items:', this.items);
  }

  getFileNameFromPath(filePath: string): string {
    return filePath.split('/').pop() || 'downloaded-file';
  }

  addToFavorites(item: Item): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('User is not logged in.');
      alert('עליך להתחבר כדי להוסיף למועדפים.');
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.idNumber;
      const requestData = {
        userId: userId,
        itemId: item.id,
      };
    
      this.apiService.Post('/favorites/add', requestData).subscribe({
        next: (response) => {
          console.log('Item added to favorites:', response);
          alert('המוצר נוסף למועדפים בהצלחה!');
        },
        error: (err) => {
          console.error('Error adding item to favorites:', err);
          alert('שגיאה בהוספת המוצר למועדפים. אנא נסה שוב.');
        },
      });
    } catch(error) {
      console.error('Error decoding token:', error);
      alert('שגיאה באימות המשתמש.');
    }
  }

  getFileExtension(filePath: string): string | null {
    const match = filePath.match(/\.[0-9a-z]+$/i);
    return match ? match[0] : null;
  }

  // הוספת לוגיקת דפדוף
  currentPage: number = 0;

  // nextPage() {
  //   this.currentPage++;
  //   this.getAllItems(this.currentPage);
  // }

  // previousPage() {
  //   if (this.currentPage > 0) {
  //     this.currentPage--;
  //     this.getAllItems(this.currentPage);
  //   }
  // }

  navigateToItemPage(itemId: string): void {
    this.router.navigate([`/item-page/${itemId}`]);
  }
}
