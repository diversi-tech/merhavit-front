import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsListComponent } from './show.component';
import  { MatTableModule } from '@angular/material/table'; // אם אתה משתמש ב-MatTable

@NgModule({
  declarations: [],
  imports: [CommonModule, MatTableModule],
  exports: [] // מאפשר לייבא את הרכיב הזה למקומות אחרים
})
export class ItemsListModule { }


// ItemsListComponent
// ItemsListComponent