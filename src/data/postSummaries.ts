import type { PostSummary } from '../types';
import summariesData from './posts-index.generated.json';

export const postSummaries: PostSummary[] = (summariesData as (PostSummary & { hidden?: boolean })[])
  .filter(post => !post.hidden);
