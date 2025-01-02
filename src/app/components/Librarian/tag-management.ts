import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Tag {
  _id: string;
  name: string;
  description: string;
  isEditing: boolean;
  originalName: string;
  originalDescription: string;
}

@Component({
  selector: 'app-tag-management',
  templateUrl: './tag-management.html',
  styleUrls: ['./tag-management.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TagManagementComponent implements OnInit {
  tags: Tag[] = []; // שימוש בממשק Tag
  confirmTag: any = null;
  isAddingTag: boolean = false; // משתנה לצורך הוספת תגית חדשה
  newTagName: string = ''; // שם התגית החדשה
  newTagDescription: string = ''; // תיאור התגית החדשה

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.apiService.Read('/tags/getAll').subscribe({
      next: (data: Tag[]) => {
        console.log(data);

        this.tags = data.map((tag) => ({
          ...tag,
          originalName: tag.name,
          originalDescription: tag.description,
        }));
      },
      error: (err) => console.error('Error loading tags:', err),
    });
  }

  showConfirmation(tag: Tag): void {
    this.confirmTag = tag;
  }

  closeConfirmation(): void {
    this.confirmTag = null;
  }

  confirmDeleteTag(): void {
    if (this.confirmTag) {
      console.log(`Deleting tag with ID: ${this.confirmTag._id}`);
      const tagToDelete = this.confirmTag._id;

      this.apiService
        .Delete('/tags/deleteTag', { id: this.confirmTag._id })
        .subscribe({
          next: () => {
            // עדכון הרשימה המקומית לאחר המחיקה
            this.tags = this.tags.filter((tag) => tag._id !== tagToDelete);
            this.confirmTag = null; // איפוס ה-confirmTag לאחר המחיקה
          },
          error: (err) => console.error('Error deleting tag:', err),
        });
    } else {
      console.error('No tag selected for deletion.');
    }
    this.closeConfirmation();
  }

  editTag(tag: Tag): void {
    if (tag.isEditing) {
      this.saveTag(tag);
    } else {
      tag.isEditing = true;
    }
  }

  saveTag(tag: Tag): void {
    if (
      tag.name !== tag.originalName ||
      tag.description !== tag.originalDescription
    ) {
      // שינוי: שליחה דרך BODY במקום PARAM
      this.apiService
        .Put('/tags/updateTag', {
          id: tag._id,
          name: tag.name,
          description: tag.description,
        })
        .subscribe({
          next: () => {
            tag.originalName = tag.name;
            tag.originalDescription = tag.description;
            tag.isEditing = false;
          },
          error: (err) => console.error('Error updating tag:', err),
        });
    } else {
      tag.isEditing = false;
    }
  }

  addNewTag(): void {
    this.isAddingTag = !this.isAddingTag;
  }

  saveNewTag(): void {
    if (this.newTagName && this.newTagDescription) {
      if (
        typeof window !== 'undefined' &&
        typeof localStorage !== 'undefined'
      ) {
        const createdByIdNumber = localStorage.getItem('idNumber'); // קריאה ל-ID מה-LocalStorage

        if (createdByIdNumber) {
          const newTag = {
            name: this.newTagName,
            description: this.newTagDescription,
            createdByIdNumber: createdByIdNumber, // מוסיף את ה-ID שנמצא ב-LocalStorage
          };

          // שליחה דרך BODY במקום PARAM
          this.apiService.Post('/tags/addTag', newTag).subscribe({
            next: (response) => {
              // לאחר ההוספה, הוספת התגית החדשה לא רק למחסנית אלא גם למערך ה-tags
              this.tags.push({
                _id: response.insertedId, // מוודא שאתה מקבל את ה-ID שהשרת מחזיר
                name: this.newTagName,
                description: this.newTagDescription,
                isEditing: false, // אפשר להוסיף גם ערכים נוספים אם נדרשים
                originalName: this.newTagName,
                originalDescription: this.newTagDescription,
              });

              // איפוס השדות
              this.isAddingTag = false; // מסתיר את שורת הוספת תגית חדשה
              this.newTagName = '';
              this.newTagDescription = '';
            },
            error: (err) => console.error('Error adding tag:', err),
          });
        } else {
          console.error('User ID not found in localStorage');
        }
      }
    } else {
      console.error('Access token not found in localStorage');
    }
  }
}
