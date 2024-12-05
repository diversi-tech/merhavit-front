import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { log } from 'console';

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

  constructor(private http: HttpClient,private apiService: ApiService) {}

  async ngOnInit(): Promise<void> {

    await this.getItems()
    console.log("items: "+this.items);
    
    // this.getItems().subscribe(items => {
    //   this.items = items;
    // });
  }

  async getItems()
  {
    console.log("hi");
    
    this.apiService.Read('/EducationalResource/getAll').subscribe({
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
          alert('Failed to delete item. Please try again.');
        },
        complete: () => {
          // פעולה כאשר הקריאה הסתיימה (אופציונלי)
          console.log('Delete request completed.');
        }
      });
    }
    





  // getItems(): Observable<Item[]> {
  //   return this.http.get<Item[]>('/EducationalResource/getAll');
  // }

}




