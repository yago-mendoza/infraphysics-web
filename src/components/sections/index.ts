// Section renderer barrel exports + shared types

import { Post } from '../../types';
import type { ArticleStats } from '../../hooks/useArticleStats';

export interface SectionRendererProps {
  posts: Post[];
  query: string;
  getExcerpt: (content: string, query: string) => string | null;
  getMatchCount: (content: string, query: string) => number;
  accent: string;
  stats?: Record<string, ArticleStats>;
}

export { Bits2BricksGrid } from './Bits2BricksGrid';
export { ProjectsList } from './ProjectsList';
export { ThreadsList } from './ThreadsList';
export { EmptyState, SearchResultsList } from './SearchResultsList';
