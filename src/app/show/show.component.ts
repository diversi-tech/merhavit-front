import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { log } from 'console';
import { Router } from '@angular/router';

interface Item   
 {
  id:string;
  description: string;
  title:string;
  type:string;
  Author:string;
  pablicationDate:Date;
  Tags:Array<string>;
  createdBy:string;
  ApprovedBy:string;
  coverImage:string;
  filePath:string;
}

@Component({
  selector: 'app-items-list',
  templateUrl: './show.component.html', // ודא שהנתיב נכון!
  styleUrls: ['./show.component.css'],
  standalone: true, // זה הופך את הרכיב לעצמאי
  imports: [CommonModule,MatTableModule] // ייבוא ישיר של מודולים
})

//@Injectable({ providedIn: 'root' })
export class ItemsListComponent implements OnInit {

  public items: Item[] = []; //מערך המוצרים של הספריה 

  constructor(private http: HttpClient,private apiService: ApiService,private router: Router) {}

  async ngOnInit(): Promise<void> {

    await this.getItems()
    console.log("items: "+this.items);
    
    // this.getItems().subscribe(items => {
    //   this.items = items;
    // });
  }

  async getItems(page: number = 0, limit: number = 2)
  {
    console.log("hi");
    
    this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`).subscribe({
      next: (response) => {
      
        console.log("i this is the response: ",response);
        
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

  editItem(item:Item)
  {
        // ניווט לדף edit-media
    this.router.navigate(['/edit-media'], {
      state: { id: item.id } 
    })
  }

  deleteResource(itemToDelete:Item)
  {
    alert("hiii")
    console.log('Delete item: ', itemToDelete);
    // הוסף כאן את הלוגיקה למחיקת משתמש

    //הפונקציה מקבלת את הנתיב שאיתו היא תתחבר לפונ המחיקה בשרת 
    //וכן את האובייקט למחיקה
    this.apiService.Delete(`/EducationalResource/${itemToDelete.id}`, {}).subscribe(
      {
        next: (response) => {
          // פעולה במידה והמחיקה הצליחה
          console.log('Item deleted successfully:', response);
          alert(response.message); // הצגת הודעת הצלחה למשתמש
          // ניתן לעדכן את ה-UI או להוריד את הפריט מהרשימה המקומית
          this.items = this.items.filter(item => item.id !== itemToDelete.id);
        },
        error: (err) => {
          // טיפול במקרה של שגיאה
          console.error('Error deleting item:', err);
          alert(err.error.message || 'Failed to delete item. Please try again.');
        },
        complete: () => {
          // פעולה כאשר הקריאה הסתיימה (אופציונלי)
          console.log('Delete request completed.');
        }
      });
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

}




