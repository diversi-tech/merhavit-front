// export interface Item {
//   title: string;
//   subject: string;
//   publicationDate: string;
//   ages: string;
//   level: string;
//   language: string;
//   releaseYear: string;
//   author: string;
//   description: string;
//   tags: string[],
//   type: 'image' | 'video' | 'audio' | 'file'  | 'unknown', // הוספת השדה 'type'
//   filePath: string; // הוספת התמונה
//   publishedDate?: string;
// }


export interface Item {
  _id: string;
  title: string;
  publicationDate: string;
  type: string;
  subjects: string[];
  ages: string;
  level: string;
  language: string;
  releaseYear: string;
  author: string;
  description: string;
  tags: string[];
  createdBy: string | null;
  coverImage: string;
  filePath: string;
  specializations: string[];
}
