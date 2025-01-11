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
  physicalBook?: boolean; // האם מדובר בספר פיזי
  approved: string;
}
