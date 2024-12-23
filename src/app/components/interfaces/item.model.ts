export interface Item {
  id: string;
  description: string;
  title: string;
  type: string;
  Author: string;
  publicationDate: Date;
  Tags: Array<string>;
  createdBy: string;
  ApprovedBy: string;
  coverImage: string;
  filePath: string;
}