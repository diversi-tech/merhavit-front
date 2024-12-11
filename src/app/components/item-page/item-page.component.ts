import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { Item } from './interfaces/item-page.interface';
import { SimilarItem } from './interfaces/similar-item-page.interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-item-page',
  templateUrl: './item-page.component.html',
  styleUrls: ['./item-page.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ItemPageComponent implements OnInit {
  item: Item | null = null;
  similarItems: SimilarItem[] = [];

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('id');
    if (itemId) {
      this.fetchItemDetails(itemId);
      this.fetchSimilarItems(itemId);
    } else {
      console.error('Item ID not found in route');
    }
  }

  fetchItemDetails(itemId: string) {
    console.log('Fetching item details for ID:', itemId);
    this.apiService.Read(`/item-page/${itemId}`).subscribe({
      next: (response) => {
        console.log('Item details received:', response);
        this.item = response;
      },
      error: (err) => {
        console.error('Error fetching item details', err);
      },
    });
  }

  fetchSimilarItems(itemId: string) {
    console.log('Fetching similar items for ID:', itemId);
    this.apiService.Read(`/item-page/${itemId}/similar`).subscribe({
      next: (response) => {
        console.log('Similar items received:', response);
        this.similarItems = response;
      },
      error: (err) => {
        console.error('Error fetching similar items', err);
      },
    });
  }
}
