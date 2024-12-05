import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-educational-resources',
  templateUrl: './educational-resources.html',
  styleUrls: ['./educational-resources.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class EducationalResourcesComponent implements OnInit {
  resources: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchResources();
  }

  fetchResources(): void {
    this.apiService.Read('/EducationalResource/getAll').subscribe({
      next: (response) => {
        if (response.success) {
          this.resources = response.data;
        }
      },
      error: (error:any) => {
        console.error('Error fetching resources:', error);
      }
    });
  }

  downloadResource(filePath: string): void {
    window.open(filePath, '_blank');
  }
  toggleFavorite(resource: any): void {
    console.log('Added to favorites:', resource);
  }
  }
