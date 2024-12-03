import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultService } from 'src/app/services/search-result.service';

@Component({
  selector: 'app-search-result',
  standalone: true, // הגדרת הרכיב כ-standalone
  imports: [CommonModule], // ייבוא CommonModule
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css'],
})
export class SearchResultComponent implements OnInit {
  resources: any[] = [];
  filteredResources: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

  constructor(private searchResultService: SearchResultService) {}

  ngOnInit(): void {
    this.getResources();
  }

  getResources(): void {
    this.searchResultService.getResources().subscribe((data: any[]) => {
      this.resources = data;
      this.filteredResources = [...this.resources];
      this.calculateTotalPages();
    });
  }

  applyFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;

    if (selectedValue) {
      this.filteredResources = this.resources.filter(
        (resource) => resource.type === selectedValue
      );
    } else {
      this.filteredResources = [...this.resources];
    }

    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredResources.length / this.itemsPerPage);
  }

  getPaginatedResources(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredResources.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }
}
