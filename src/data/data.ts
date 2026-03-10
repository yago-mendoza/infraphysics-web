import { Post } from '../types';
import postsData from './posts.generated.json';

// Regular posts only (projects, threads, bits2bricks) — fieldnotes loaded via brainIndex
// Posts with hidden: true in frontmatter are excluded from all views
export const posts: Post[] = (postsData as (Post & { hidden?: boolean })[])
  .filter(p => !p.hidden);
