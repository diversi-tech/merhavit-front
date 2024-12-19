import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
// import { log } from 'console';
import { jwtDecode } from 'jwt-decode';
import { log } from 'console';
import { RouterModule, Router } from '@angular/router';


interface Item {
  id: string;
  description: string;
  title: string;
  type: string;
  Author: string;
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

//@Injectable({ providedIn: 'root' })
export class ItemsListComponent implements OnInit {
  public items: Item[] = []; //מערך המוצרים של הספריה
  public userType: string = ''; // משתנה לשמירת סוג המשתמש

  constructor(private http: HttpClient, private apiService: ApiService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.getUserTypeFromToken();
    await this.getItems();
    console.log('items: ' + this.items);

    // this.getItems().subscribe(items => {
    //   this.items = items;
    // });
  }

  getUserTypeFromToken(): void {
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
  }

  async getItems(page: number = 0, limit: number = 2) {
    console.log('hi');

    this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`).subscribe({
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
    });
  }

  

  editItem(item: Item) {
    // ניווט לדף edit-media
    this.router.navigate(['/edit-media'], {
      state: { id: item.id }
    })
  }

  deleteResource(itemToDelete: Item) {
    console.log('Delete item: ', itemToDelete);
    // הוסף כאן את הלוגיקה למחיקת משתמש

    //הפונקציה מקבלת את הנתיב שאיתו היא תתחבר לפונ המחיקה בשרת
    //וכן את האובייקט למחיקה
    this.apiService
      .Delete(`/EducationalResource/${itemToDelete.id}`, {})
      .subscribe({
        next: (response) => {
          // פעולה במידה והמחיקה הצליחה
          console.log('Item deleted successfully:', response);
          alert(response.message); // הצגת הודעת הצלחה למשתמש
          // ניתן לעדכן את ה-UI או להוריד את הפריט מהרשימה המקומית
          this.items = this.items.filter((item) => item.id !== itemToDelete.id);
        },
        error: (err) => {
          // טיפול במקרה של שגיאה
          console.error('Error deleting item:', err);
          alert(err.error.message || 'Failed to delete item. Please try again.');
        },
        complete: () => {
          // פעולה כאשר הקריאה הסתיימה (אופציונלי)
          console.log('Delete request completed.');
        },
      });
  }

  // downloadResource(item: Item): void {
  //   if (!item.filePath) {
  //     console.error('No file path available for this item.');
  //     alert('לא נמצא קובץ להורדה.');
  //     return;
  //   }

  //   this.http.get(item.filePath, { responseType: 'blob' }).subscribe({
  //     next: (blob) => {
  //       const fileExtension = this.getFileExtension(item.filePath) || '';
  //       const downloadLink = document.createElement('a');
  //       const url = window.URL.createObjectURL(blob);

  //       downloadLink.href = url;
  //       downloadLink.download = item.title + fileExtension;
  //       document.body.appendChild(downloadLink);
  //       downloadLink.click();
  //       document.body.removeChild(downloadLink);
  //       window.URL.revokeObjectURL(url);
  //     },
  //     error: (err) => {
  //       console.error('Error downloading file:', err);
  //       alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');
  //     },
  //   });
  // }

  downloadResource(item: Item): void {
    if (!item.id) {
      console.error('Item ID is missing.');
      alert('לא ניתן להוריד את הקובץ.');
      return;
    }
    console.log('item.filePath', item.filePath);

    this.apiService
      .Read(
        `/EducationalResource/presigned-url?filePath=${encodeURIComponent(
          item.filePath
        )}`
        // `/EducationalResource/presigned-url?filePath=${encodeURIComponent(
        //   item.filePath
        // )}&download=true` 
      )
      // .Read(`/EducationalResource/presigned-url?filePath=${item.filePath}`)

      .subscribe({
        next: (response) => {
          // const presignedUrl = response.presignedUrl;
          const presignedUrl = response.url;
          if (presignedUrl) {
            const downloadLink = document.createElement('a');
            downloadLink.href = presignedUrl;
            downloadLink.download = this.getFileNameFromPath(item.filePath); // קביעת שם הקובץ להורדה
            downloadLink.style.display = 'none';

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } else {
            alert('שגיאה בקבלת הקישור להורדה.');
          }
        },
        error: (err) => {
          console.error('Error fetching presigned URL:', err);
          alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');
        },
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
      const userId = decodedToken.idNumber; // נניח שה-`id` של המשתמש נמצא בטוקן
      const requestData = {
        userId: userId,
        itemId: item.id,
      };
    
      console.log('Request Data:', requestData);

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
//הוספת לוגיקת דפדוף
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

 navigateToItemPage(itemId: string): void {
    this.router.navigate([`/item-page/${itemId}`]);
  }
}
