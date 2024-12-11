export interface Item {
  title: string;
  subject: string;
  publicationDate: string;
  ages: string;
  level: string;
  language: string;
  releaseYear: string;
  author: string;
  description: string;
  tags: string[];
  filePath: string; // הוספת התמונה
  publishedDate?: string;
}
