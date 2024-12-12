// import { Component, OnInit } from '@angular/core';
// import { ApiService } from '../../api.service';
// import { Item } from './interfaces/item-page.interface';
// import { SimilarItem } from './interfaces/similar-item-page.interface';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute } from '@angular/router';

// @Component({
//   selector: 'app-item-page',
//   templateUrl: './item-page.component.html',
//   styleUrls: ['./item-page.component.css'],
//   standalone: true,
//   imports: [CommonModule],
// })
// export class ItemPageComponent implements OnInit {
//   item: Item | null = null;
//   similarItems: SimilarItem[] = [];

//   constructor(private route: ActivatedRoute, private apiService: ApiService) {}

//   ngOnInit(): void {
//     const itemId = this.route.snapshot.paramMap.get('id');
//     if (itemId) {
//       this.fetchItemDetails(itemId);
//       this.fetchSimilarItems(itemId);
//     } else {
//       console.error('Item ID not found in route');
//     }
//   }

//   fetchItemDetails(itemId: string) {
//     console.log('Fetching item details for ID:', itemId);
//     this.apiService.Read(`/item-page/${itemId}`).subscribe({
//       next: (response) => {
//         console.log('Item details received:', response);
//         this.item = response;
//       },
//       error: (err) => {
//         console.error('Error fetching item details', err);
//       },
//     });
//   }

//   fetchSimilarItems(itemId: string) {
//     console.log('Fetching similar items for ID:', itemId);
//     this.apiService.Read(`/item-page/${itemId}/similar`).subscribe({
//       next: (response) => {
//         console.log('Similar items received:', response);
//         this.similarItems = response;
//       },
//       error: (err) => {
//         console.error('Error fetching similar items', err);
//       },
//     });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { Item } from './interfaces/item-page.interface';
import { SimilarItem } from './interfaces/similar-item-page.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  previewUrl: SafeResourceUrl | null = null;
  isImage = false;
  isVideo = false;
  isPDF = false;
  isAudio = false;
  isOverlayOpen = false; // משתנה עבור ההגדלה

  constructor(private route: ActivatedRoute, private apiService: ApiService, private sanitizer: DomSanitizer) {}

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
        this.setPreviewUrl(response);
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

  setPreviewUrl(item: Item) {
    const fileType = item?.type?.toLowerCase() ?? '';
    const fileUrl = item?.filePath ?? '';

    if (fileType.includes('תמונה') || fileType.includes('image')) {
      this.clearPreviewsExcept('image');
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(fileUrl);
    } else if (fileType.includes('וידאו') || fileType.includes('video')) {
      this.clearPreviewsExcept('video');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else if (fileType.includes('קובץ') || fileType.includes('pdf') || fileType.includes('word')) {
      this.clearPreviewsExcept('document');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else if (fileType.includes('אודיו') || fileType.includes('audio')) {
      this.clearPreviewsExcept('audio');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    }
  }

  clearPreviewsExcept(type: 'image' | 'video' | 'document' | 'audio') {
    this.isImage = type === 'image';
    this.isVideo = type === 'video';
    this.isPDF = type === 'document';
    this.isAudio = type === 'audio';
  }

  getCoverImage(item: SimilarItem): SafeResourceUrl {
    if (!item || !item.filePath) {
      return this.sanitizer.bypassSecurityTrustUrl(''); // שימוש בערך ברירת מחדל
    }

    const fileType = item.type.toLowerCase();
    return fileType.includes('image') ? this.sanitizer.bypassSecurityTrustUrl(item.filePath) : this.sanitizer.bypassSecurityTrustUrl(item.coverImage ?? '');
  }

  openOverlay() {
    this.isOverlayOpen = true;
  }

  closeOverlay() {
    this.isOverlayOpen = false;
  }
}
