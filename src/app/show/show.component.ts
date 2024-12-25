// import { Component, Injectable, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatTableModule } from '@angular/material/table';
// import { HttpClient } from '@angular/common/http';
// // import { Observable } from 'rxjs';
// import { ApiService } from '../api.service';
// // import { log } from 'console';
// import { jwtDecode } from 'jwt-decode';
// import { log } from 'console';
// import { RouterModule, Router, ActivatedRoute } from '@angular/router';


// interface Item {
//   id: string;
//   description: string;
//   title: string;
//   type: string;
//   Author: string;
//   publicationDate: Date;
//   Tags: Array<string>;
//   createdBy: string;
//   ApprovedBy: string;
//   coverImage: string;
//   filePath: string;
// }

// @Component({
//   selector: 'app-items-list',
//   templateUrl: './show.component.html',
//   styleUrls: ['./show.component.css'],
//   standalone: true,
//   imports: [CommonModule, MatTableModule],
// })

// //@Injectable({ providedIn: 'root' })
// export class ItemsListComponent implements OnInit {
//   public items: Item[] = []; //מערך המוצרים של הספריה
//   public userType: string = ''; // משתנה לשמירת סוג המשתמש

//   constructor(
//     private http: HttpClient, 
//     private apiService: ApiService, 
//     private router: Router,
//     private route: ActivatedRoute
//   ) {}

//   async ngOnInit(): Promise<void> {
//     this.getUserTypeFromToken();
//     this.route.queryParams.subscribe(params => {
//       const type = params['type']; // שימו לב לשם הפרמטר שנשלח ב-URL
//       if (type) {
//         this.filterItems(type);  // נקרא לפונקציה של סינון
//       } else {
//        this.getItems();  // אם לא נבחר סוג, נשלוף את כל הפריטים
//       }
//     });
//   }

//   getUserTypeFromToken(): void {
//     if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
//       const token = localStorage.getItem('access_token');
//       if (token) {
//         try {
//           const decodedToken: any = jwtDecode(token);
//           this.userType = decodedToken.userType || '';
//           console.log(this.userType);
//         } catch (error) {
//           console.error('Error decoding token:', error);
//         }
//       }
//     } else {
//       console.warn('Code is running on the server. Skipping token check.');
//     }
//   }

//   async getItems(page: number = 0, limit: number = 100) {
//     console.log('hi');

//     this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`).subscribe({
//       next: (response) => {
//         console.log('i this is the response: ', response);

//         if (Array.isArray(response)) {
//           this.items = response;
//         } else {
//           this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
//         }
//       },
//       error: (err) => {
//         console.error('Error fetching items', err);
//       },
//     });
//   }

//   editItem(item: Item) {
//     // ניווט לדף edit-media
//     this.router.navigate(['/edit-media'], {
//       state: { id: item.id }
//     })
//   }

//   deleteResource(itemToDelete: Item) {
//     console.log('Delete item: ', itemToDelete);
//     // הוסף כאן את הלוגיקה למחיקת משתמש

//     //הפונקציה מקבלת את הנתיב שאיתו היא תתחבר לפונ המחיקה בשרת
//     //וכן את האובייקט למחיקה
//     this.apiService
//       .Delete(`/EducationalResource/${itemToDelete.id}`, {})
//       .subscribe({
//         next: (response) => {
//           // פעולה במידה והמחיקה הצליחה
//           console.log('Item deleted successfully:', response);
//           alert(response.message); // הצגת הודעת הצלחה למשתמש
//           // ניתן לעדכן את ה-UI או להוריד את הפריט מהרשימה המקומית
//           this.items = this.items.filter((item) => item.id !== itemToDelete.id);
//         },
//         error: (err) => {
//           // טיפול במקרה של שגיאה
//           console.error('Error deleting item:', err);
//           alert(err.error.message || 'Failed to delete item. Please try again.');
//         },
//         complete: () => {
//           // פעולה כאשר הקריאה הסתיימה (אופציונלי)
//           console.log('Delete request completed.');
//         },
//       });
//   }


//   downloadResource(item: Item): void {
//     if (!item.id) {
//       console.error('Item ID is missing.');
//       alert('לא ניתן להוריד את הקובץ. חסר ID');
//       return;
//     }

//     if (!item.filePath) {
//       console.error('File path is missing.');
//       alert('לא ניתן להוריד את הקובץ. חסר ניתוב');
//       return;
//     }
    
//     console.log('item.filePath', item.filePath);

//     this.apiService
//       .Read(
//         `/EducationalResource/presigned-url?filePath=${encodeURIComponent(
//           item.filePath
//         )}`
//         // `/EducationalResource/presigned-url?filePath=${encodeURIComponent(
//         //   item.filePath
//         // )}&download=true` 
//       )
//       // .Read(`/EducationalResource/presigned-url?filePath=${item.filePath}`)

//       .subscribe({
//         next: (response) => {
//           const presignedUrl = response.url;
//           if (response && response.url) {
//             const downloadLink = document.createElement('a');
//             downloadLink.href = response.url;
//             downloadLink.download = item.title; // אפשר להוסיף כאן סיומת אם יש צורך
//             document.body.appendChild(downloadLink);
//             downloadLink.click();
//             document.body.removeChild(downloadLink);
//           } else {
//             console.error('Invalid response for download URL.');
//             alert('לא ניתן להוריד את הקובץ. אנא נסה שוב.');
//           }
//         },
//         //   if (presignedUrl) {
//         //     const downloadLink = document.createElement('a');
//         //     downloadLink.href = presignedUrl;
//         //     downloadLink.download = this.getFileNameFromPath(item.filePath); // קביעת שם הקובץ להורדה
//         //     downloadLink.style.display = 'none';

//         //     document.body.appendChild(downloadLink);
//         //     downloadLink.click();
//         //     document.body.removeChild(downloadLink);
//         //   } else {
//         //     alert('שגיאה בקבלת הקישור להורדה.');
//         //   }
//         // },
//         error: (err) => {
//           console.error('Error fetching presigned URL:', err);
//           alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');
//         },
//       });
//   }

//   filterItems(type: string): void {
//     this.apiService.Read(`/EducationalResource/getAll?type=${type}`).subscribe({
//       next: (response) => {
//         if (Array.isArray(response)) {
//           this.items = response;
//         } else {
//           this.items = response.data || [];
//         }
//       },
//       error: (err) => {
//         console.error('Error fetching filtered items', err);
//       }
//     });
//   }
  

//   getFileNameFromPath(filePath: string): string {
//     return filePath.split('/').pop() || 'downloaded-file';
//   }
//   addToFavorites(item: Item): void {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('User is not logged in.');
//       alert('עליך להתחבר כדי להוסיף למועדפים.');
//       return;
//     }

//     try {
//       const decodedToken: any = jwtDecode(token);
//       const userId = decodedToken.idNumber; // נניח שה-`id` של המשתמש נמצא בטוקן
//       const requestData = {
//         userId: userId,
//         itemId: item.id,
//       };
    
//       console.log('Request Data:', requestData);

//     this.apiService.Post('/favorites/add', requestData).subscribe({
//       next: (response) => {
//         console.log('Item added to favorites:', response);
//         alert('המוצר נוסף למועדפים בהצלחה!');
//       },
//       error: (err) => {
//         console.error('Error adding item to favorites:', err);
//         alert('שגיאה בהוספת המוצר למועדפים. אנא נסה שוב.');
//       },
//     });
//   } catch(error) {
//     console.error('Error decoding token:', error);
//     alert('שגיאה באימות המשתמש.');
//   }
// }
// getFileExtension(filePath: string): string | null {
//   const match = filePath.match(/\.[0-9a-z]+$/i);
//   return match ? match[0] : null;
// }
// //הוספת לוגיקת דפדוף
// currentPage: number = 0;

// nextPage() {
//   this.currentPage++;
//   this.getItems(this.currentPage);
// }

// previousPage() {
//   if (this.currentPage > 0) {
//     this.currentPage--;
//     this.getItems(this.currentPage);
//   }

// }

//  navigateToItemPage(itemId: string): void {
//     this.router.navigate([`/item-page/${itemId}`]);
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service';
import { jwtDecode } from 'jwt-decode';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {log} from 'console';


interface Item {
  _id: string;
  description: string;
  title: string;
  type: string;
  author: string;
  publicationDate: Date;
  Tags: Array<string>;
  createdBy: string;
  ApprovedBy: string;
  coverImage: string;
  filePath: string;
}

@Component({
  selector: 'app-items-list',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule],
})
export class ItemsListComponent implements OnInit {
  public items: Item[] = []; // מערך המוצרים של הספריה
  public userType: string = ''; // משתנה לשמירת סוג המשתמש

  constructor(
    private http: HttpClient, 
    private apiService: ApiService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // async ngOnInit(): Promise<void> {
  //   this.getUserTypeFromToken();
  //   this.getItems(); // שליפת כל הפריטים מהשרת בהתחלה
  //   this.route.queryParams.subscribe(params => {
  //     const type = params['type'];
  //     if (type) {
  //       this.filterItemsByType(type);  
  //     } else {
  //       this.items = this.items; // הצגת כל הפריטים אם אין סוג נבחר
  //     }
  //   });
  // }

  async ngOnInit(): Promise<void> {
    this.getUserTypeFromToken();
    this.route.queryParams.subscribe(params => {
      const type = params['type'];
      this.getItems(0, 1000, '', type); // קריאה לפונקציה getItems עם סוג הפריט המתאים
    });
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

  // async getItems(page: number = 0, limit: number = 1000, searchTerm:string = '', typeFilter: string = '') {
  //   if(searchTerm!==''&&typeFilter===''){
  //     this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}`).subscribe({
  //       next: (response) => {
  //         console.log('All items response: ', response);
  
  //         if (Array.isArray(response)) {
  //           this.items = response;
  //         } else {
  //           this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //         }
  //         // אם יש סוג בפרמטרים של ה-URL, נסנן מיד
  //         const type = this.route.snapshot.queryParamMap.get('type');
  //         if (type) {
  //           this.filterItemsByType(type);
  //         } else {
  //           this.items = this.items; // הצגת כל הפריטים בהתחלה
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Error fetching all items', err);
  //       },
  //     });
  //   }
  //   if(searchTerm===''&&typeFilter!=='')
  //     {this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&typeFilter=${typeFilter}`).subscribe({
  //       next: (response) => {
  //         console.log('i this is the response: ', response);
  
  //         if (Array.isArray(response)) {
  //           this.items = response;
  //         } else {
  //           this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Error fetching items', err);
  //       },
  //     });}
  //     if(searchTerm!==''&&typeFilter!=='')
  //       {this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}&typeFilter=${typeFilter}`).subscribe({
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
  //       else
  //       { this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`).subscribe({
  //         next: (response) => {
  //           console.log('i this is the response: ', response);
    
  //           if (Array.isArray(response)) {
  //             this.items = response
  //           } else {
  //             this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //           }
  //         },
  //         error: (err) => {
  //           console.error('Error fetching items', err);
  //         },
  //   });}
    
  // }

  async getItems(page: number = 0, limit: number = 1000, searchTerm:string = '', typeFilter: string = '') {
    if(searchTerm!==''&&typeFilter===''){
      this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}`).subscribe({
        next: (response) => {
          console.log('All items response: ', response);
  
          if (Array.isArray(response)) {
            this.items = response;
          } else {
            this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
          }
          // אם יש סוג בפרמטרים של ה-URL, נסנן מיד
          const type = this.route.snapshot.queryParamMap.get('type');
          if (type) {
            this.filterItemsByType(type);
          } else {
            this.items = this.items; // הצגת כל הפריטים בהתחלה
          }
        },
        error: (err) => {
          console.error('Error fetching all items', err);
        },
      });
    }
    if(searchTerm===''&&typeFilter!=='')
      {this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&typeFilter=${typeFilter}`).subscribe({
        next: (response) => {
          console.log('i this is the response: ', response);
  
          if (Array.isArray(response)) {
            this.items = response;
          } else {
            this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
          }
        },
        error: (err) => {
          console.error('Error fetching items', err);
        },
      });}
      if(searchTerm!==''&&typeFilter!=='')
        {this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}&typeFilter=${typeFilter}`).subscribe({
          next: (response) => {
            console.log('i this is the response: ', response);
    
            if (Array.isArray(response)) {
              this.items = response;
            } else {
              this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
            }
          },
          error: (err) => {
            console.error('Error fetching items', err);
          },
        });}
        else
        { this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`).subscribe({
          next: (response) => {
            console.log('i this is the response: ', response);
    
            if (Array.isArray(response)) {
              this.items = response
            } else {
              this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
            }
          },
          error: (err) => {
            console.error('Error fetching items', err);
          },
    });}
    var apiUrl = `/EducationalResource/getAll?page=${page}&limit=${limit}`;
    if (searchTerm) { 
      apiUrl += `&searchTerm=${searchTerm}`; 
    } 
    if (typeFilter) { 
      apiUrl += `&typeFilter=${typeFilter}`; 
    } 
    this.apiService.Read(apiUrl).subscribe({ 
      next: (response) => { 
        console.log('All items response: ', response); 
        if (Array.isArray(response)) { 
          this.items = response; 
        } else { 
          this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים 
        } }, error: (err) => { 
          console.error('Error fetching items', err); 
        }, });
    
  }

  editItem(item: Item) {
    this.router.navigate(['/edit-media'], {
      state: { id: item._id }
    });
  }

  deleteResource(itemToDelete: Item) {
    this.apiService
      .Delete(`/EducationalResource/${itemToDelete._id}`, {})
      .subscribe({
        next: (response) => {
          console.log('Item deleted successfully:', response);
          alert(response.message);
          this.items = this.items.filter((item) => item._id !== itemToDelete._id);
          this.items = this.items; // עדכון הפריטים המוצגים
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          alert(err.error.message || 'Failed to delete item. Please try again.');
        },
        complete: () => {
          // פעולה כאשר הקריאה הסתיימה (אופציונלי)
          console.log('Delete request completed.');
        },
      });
  }
  
  downloadResource(item: Item): void {
    if (!item._id) {
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


  // filterItemsByType(type: string): void {
  //   console.log('Filtering items by type:', type);
  //   this.items = this.items.filter((item: Item) => item.type === type);
  //   console.log('Filtered items:', this.items);
  // }

  filterItemsByType(type: string): void {
    console.log('Filtering items by type:', type);
    this.apiService.Read(`/EducationalResource/getAll?type=${type}`).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.items = response;
        } else {
          this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
        }
        console.log('Filtered items:', this.items);
      },
      error: (err) => {
        console.error('Error filtering items by type', err);
      }
    });
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
        itemId: item._id,
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

  nextPage() {
    this.currentPage++;
    this.getItems(this.currentPage);
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getItems(this.currentPage);
    }
  }

  navigateToItemPage(item: Item): void {
    if (item && item._id) {
      this.router.navigate(['/item-page', item._id]);  // וודא שהשימוש הוא ב _id
    } else {
      console.error('Item ID is undefined or invalid');
    }
  }
  
}
