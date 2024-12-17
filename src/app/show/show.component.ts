import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { log } from 'console';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar'; // ייבוא MatSnackBar
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';


interface Item   
 {
  _id:string;
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
  templateUrl: './show.component.html', 
  styleUrls: ['./show.component.css'],
  standalone: true, // זה הופך את הרכיב לעצמאי
  imports: [CommonModule,MatTableModule,RouterOutlet,MatPaginatorModule] // ייבוא ישיר של מודולים
})

//@Injectable({ providedIn: 'root' })
export class ItemsListComponent implements OnInit {

  public items: Item[] = []; //מערך המוצרים של הספריה 
  public totalItems: number = 0; // תכונה חדשה למעקב אחרי מספר הנתונים


  constructor(public dialog: MatDialog, private ro:Router, private http: HttpClient,private apiService: ApiService,private router: Router,    private snackBar: MatSnackBar // הוספת MatSnackBar לקונסטרוקטור
  ) {}
 
  async ngOnInit(): Promise<void> {

    await this.getItems()
    console.log("items: "+this.items);
    
  }

onPageChange(event: PageEvent) {
  this.getItems(event.pageIndex, event.pageSize);
}

async getItems(page: number = 0, limit: number = 2) {
  console.log("hi");

  this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`).subscribe({
    next: (response: { data: any[], totalCount: number }) => {
      console.log("i this is the response: ", response);
      
      if (Array.isArray(response.data)) {
        this.items = response.data;
      }
      else
      this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
      this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת
    },
    error: (err) => {
      console.error('Error fetching items', err);
    },
  });
}

  async editItem(item1:Item)
  {
     // ניווט לדף edit-media  עם כמה פרמטרים 
    // this.router.navigate(['/edit-media'], {
    //   state: { id: item.id } 
    // })
    this.router.navigate(['/edit-media', item1._id]);
  }

  deleteResource(itemToDelete:Item)
  {
    alert("hiii")
    console.log('Delete item: ', itemToDelete);
    // הוסף כאן את הלוגיקה למחיקת משתמש

    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {

      if (result) {
     // כאן תוכל לקרוא לפונקציה שמוחקת את הפריט מהשרת
    //הפונקציה מקבלת את הנתיב שאיתו היא תתחבר לפונ המחיקה בשרת 
    //וכן את האובייקט למחיקה
    this.apiService.Delete(`/EducationalResource/${itemToDelete._id}`, {}).subscribe(
      {
        next: (response) => {
          // פעולה במידה והמחיקה הצליחה
          console.log('Item deleted successfully:', response);
           // הצגת הודעת הצלחה למשתמש
           this.snackBar.open('הפריט נמחק בהצלחה', 'Close', {
            duration: 3000,
            panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
          });         
          // ניתן לעדכן את ה-UI או להוריד את הפריט מהרשימה המקומית
          this.items = this.items.filter(item => item._id !== itemToDelete._id);
          this.totalItems--; // עדכון מספר הנתונים לאחר מחיקה

        },
        error: (err) => {
          // טיפול במקרה של שגיאה
          console.error('Error deleting item:', err);
          this.snackBar.open('בעיה במחיקת הפריט , נסה שוב', 'Close', {
            duration: 3000,
            panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
          });
        },
        complete: () => {
          // פעולה כאשר הקריאה הסתיימה (אופציונלי)
          console.log('Delete request completed.');
        }
      });

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




