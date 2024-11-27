import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShowComponent } from './show/show.component';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ShowComponent,MatDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Merhavit-front-end';
}
