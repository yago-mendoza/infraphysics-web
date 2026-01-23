import { Post } from '../types';
import postsData from './posts.generated.json';
import categoriesData from './categories.generated.json';

export interface CategoryConfig {
  name: string;
  displayName: string;
  description: string;
  color: string;
}

export const posts: Post[] = postsData as Post[];
export const categoryConfigs: Record<string, CategoryConfig> = categoriesData;