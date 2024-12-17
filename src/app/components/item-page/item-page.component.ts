// import { Component, OnInit } from '@angular/core';
// import { ApiService } from '../../api.service';
// import { Item } from './interfaces/item-page.interface';
// import { SimilarItem } from './interfaces/similar-item-page.interface';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
//   previewUrl: SafeResourceUrl | null = null;
//   isImage = false;
//   isAudio = false;
//   isVideo = false;
//   isPDF = false;
//   isPlaying = false; // משתנה לעקוב אם השיר מתנגן או לא
//   isOverlayOpen = false; // משתנה לעקוב אם overlay פתוח
//   audioElement: HTMLAudioElement | null = null; // אלמנט האודיו

//   constructor(
//     private route: ActivatedRoute,
//     private apiService: ApiService,
//     private sanitizer: DomSanitizer
//   ) {}

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
//         // בדיקה האם tags הוא מערך
//         if (!Array.isArray(response.tags)) {
//           response.tags = []; // במקרה שלא, נהפוך אותו למערך ריק
//         }
//         this.item = response;
//         this.setPreviewUrl(response);
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

//   setPreviewUrl(item: Item) {
//     const fileType = item?.type?.toLowerCase() ?? '';
//     const fileUrl = item?.filePath ?? '';

//     if (fileType.includes('תמונה') || fileType.includes('image')) {
//       this.clearPreviewsExcept('image');
//       this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(fileUrl);
//     } else if (fileType.includes('וידאו') || fileType.includes('video')) {
//       this.clearPreviewsExcept('video');
//       this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
//     } else if (fileType.includes('קובץ') || fileType.includes('pdf') || fileType.includes('word')) {
//       this.clearPreviewsExcept('document');
//       this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
//     } else if (fileType.includes('אודיו') || fileType.includes('שיר')) {
//       this.clearPreviewsExcept('audio');
//       this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
//     }
//   }

//   clearPreviewsExcept(type: 'image' | 'video' | 'document' | 'audio') {
//     this.isImage = type === 'image';
//     this.isAudio = type === 'audio';
//     this.isVideo = type === 'video';
//     this.isPDF = type === 'document';
//   }

//   toggleAudioPlayback() {
//     if (this.isPlaying) {
//       if (this.audioElement) {
//         this.audioElement.pause();
//       }
//       this.isPlaying = false;
//     } else {
//       if (!this.audioElement) {
//         this.audioElement = new Audio(this.previewUrl as string);
//         this.audioElement.play();
//       } else {
//         this.audioElement.play();
//       }
//       this.isPlaying = true;
//     }
//   }

//   getCoverImage(item: SimilarItem): string {
//     return item.coverImage || 'נתיב ברירת מחדל לתמונה';
//   }

//   openOverlay() {
//     this.isOverlayOpen = true;
//   }

//   closeOverlay() {
//     this.isOverlayOpen = false;
//   }
// }

import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { Item } from './interfaces/item-page.interface';
import { SimilarItem } from './interfaces/similar-item-page.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
  isAudio = false;
  isVideo = false;
  isPDF = false;
  isPlaying = false; // משתנה לעקוב אם השיר מתנגן או לא
  audioElement: HTMLAudioElement | null = null; // אלמנט האודיו

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

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
        // בדיקה האם tags הוא מערך
        if (!Array.isArray(response.tags)) {
          response.tags = []; // במקרה שלא, נהפוך אותו למערך ריק
        }
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
    } else if (fileType.includes('אודיו') || fileType.includes('שיר')) {
      this.clearPreviewsExcept('audio');
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    }
  }

  clearPreviewsExcept(type: 'image' | 'video' | 'document' | 'audio') {
    this.isImage = type === 'image';
    this.isAudio = type === 'audio';
    this.isVideo = type === 'video';
    this.isPDF = type === 'document';
  }

  toggleAudioPlayback() {
    if (this.isPlaying) {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.isPlaying = false;
    } else {
      if (!this.audioElement) {
        this.audioElement = new Audio(this.previewUrl as string);
        this.audioElement.play();
      } else {
        this.audioElement.play();
      }
      this.isPlaying = true;
    }
  }

  getCoverImage(item: SimilarItem): string {
    return item.coverImage || 'נתיב ברירת מחדל לתמונה';
  }

  navigateToItem(itemId: string) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate(['/item-page', itemId]);
    });
  }
}
