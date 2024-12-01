import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ItemsListComponent } from './show/show.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ItemsListModule } from './show/items-list.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ItemsListComponent,MatDialogModule,ItemsListModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'routing-app';
}
