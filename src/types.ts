export type Category = 'main' | 'projects' | 'threads' | 'bits2bricks' | 'fieldnotes';

export interface Post {
  id: string;
  title: string;
  displayTitle?: string; // Human readable title without dashes
  category: Category;
  content: string;
  date: string;
  description: string;
  thumbnail?: string; // Optional image URL for list view
}

export interface NavigationItem {
  label: string;
  path: string;
  colorClass: string;
}