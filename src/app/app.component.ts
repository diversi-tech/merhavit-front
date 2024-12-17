import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";
import { MatDialogModule } from '@angular/material/dialog';
import { ItemsListModule } from './show/items-list.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditMediaComponent } from './edit-media/edit-media.component';
import { ReactiveFormsModule } from '@angular/forms';
import { materialize } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatDialogModule,ItemsListModule,FormsModule,ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class AppComponent {
  title = 'routing-app';
}

