import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MediaService } from './media.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { HttpClient } from '@angular/common/http';
import {Location} from '@angular/common'
import { MatSnackBar } from '@angular/material/snack-bar';


export interface Media {
  id: string;
  title: string;
  description: string;
  tags: string[];
}
@Component({
  selector: 'app-edit-media',
  templateUrl: './edit-media.component.html',
  styleUrls: ['./edit-media.component.css'],
  standalone: true, // זה הופך את הרכיב לעצמאי
  imports: [CommonModule,FormsModule,ReactiveFormsModule] 
})
export class EditMediaComponent implements OnInit {
  media: Media | null = null;
  mediaId :string = '' 
  resourceForm: FormGroup;

  constructor(private location:Location, private http: HttpClient,private apiService: ApiService,private fb: FormBuilder,private me:ActivatedRoute, private snackBar: MatSnackBar)
   {
    this.resourceForm = this.fb.group({
          title: [''],
          description: [''],
          tags: [''],
        });
   }


  ngOnInit()
  {
    //  this.me.params.subscribe(p=>this.mediaId=p["id"])
    this.me.params.subscribe(p => {
      this.mediaId = p["id"];
      this.fetchMediaData(this.mediaId); // קבלת הנתונים של המדיה
    });
  }

  fetchMediaData(mediaId: string) {
    const query = `/EducationalResource/${mediaId}`;
    this.apiService.Read(query).subscribe({
      next: (media: Media) => {
        this.media = media;
        this.resourceForm.patchValue({
          title: media.title,
          description: media.description,
          tags: media.tags.join(', '), // המרה למחרוזת מופרדת בפסיקים
        });
      },
      error: (err) => {
        console.error('Error fetching media data:', err);
        this.snackBar.open('בעיה בהבאת הנתונים, נסה שוב', 'Close', {
          duration: 3000,
          panelClass: ['custom-snack-bar'],
        });
      }
    });
  }
  

  
  // עדכון נתונים בשרת
  updateMediaData() {
    
    const query = `/EducationalResource/${this.mediaId}`;
    this.apiService.Put(query, this.media).subscribe({
      next: (response) => {
        console.log('Media updated successfully:', response);
        this.snackBar.open('הפריט נערך בהצלחה', 'Close', {
          duration: 3000,
          panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
        });   
      },
      error: (err) => {
        console.error('Error updating media data:', err);
        this.snackBar.open('בעיה בעריכת הפריט, נסה שוב', 'Close', {
          duration: 3000,
          panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
        });   
      }
    });}

    onSave()
    {
      const updatedData = {
            ...this.resourceForm.value,
            tags: this.resourceForm.value.tags.split(',').map((tag: string) => tag.trim()),
          };
          this.media=updatedData
      this.updateMediaData()
      this.location.back()
    }

  // resourceForm: FormGroup;
  // resourceId: string;

  // constructor(
  //   private route: ActivatedRoute,
  //   private fb: FormBuilder,
  //   private resourceService: EducationalResourceService
  // ) {
  //   this.resourceForm = this.fb.group({
  //     title: [''],
  //     description: [''],
  //     tags: [''],
  //   });
  // }

  // ngOnInit(): void {
  //   this.resourceId = this.route.snapshot.paramMap.get('id')!;
  //   this.resourceService.getResourceById(this.resourceId).subscribe((data) => {
  //     this.resourceForm.patchValue({
  //       title: data.title,
  //       description: data.description,
  //       tags: data.tags.join(', '),
  //     });
  //   });
  // }

  // onSave(): void {
  //   const updatedData = {
  //     ...this.resourceForm.value,
  //     tags: this.resourceForm.value.tags.split(',').map((tag: string) => tag.trim()),
  //   };
  //   this.resourceService.updateResource(this.resourceId, updatedData).subscribe(
  //     (response:any) => {
  //       alert('Resource updated successfully!');
  //     },
  //     (error:any) => {
  //       console.error('Error updating resource:', error);
  //     }
  //   );
  //}


  // media: Media | null = null;
  // tagsString: string = '';
  // item: any;

  // constructor(
  //   private mediaService: MediaService,
  //   private route: ActivatedRoute
  // ) {}

  // ngOnInit() {
    
  //   this.item = history.state.item;
  //   console.log('Received Item:', this.item);
  //   this.media=this.item
  //   console.log("media",this.media);

  //   const id = this.route.snapshot.paramMap.get('id');
  //   if (id) {
  //     this.mediaService.getMediaById(id).subscribe((media) => {
  //       this.media = media;
  //       this.tagsString = media.tags.join(', ');
  //     });
  //   }
  //   console.log("mediaService",this.mediaService);

  // }

  // onSubmit() {
    
  //   if (this.media) {
  //     const updatedMedia = {
  //       ...this.media,
  //       tags: this.tagsString.split(',').map((tag) => tag.trim()),
        
  //     };
  //     this.mediaService.updateMedia(this.media.id, updatedMedia).subscribe(() => {
  //       alert('Media updated successfully!');
  //     });
  //   }
  // }

 }
