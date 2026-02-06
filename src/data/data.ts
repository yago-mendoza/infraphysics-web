import { Post } from '../types';
import postsData from './posts.generated.json';

// Regular posts only (projects, threads, bits2bricks) — fieldnotes loaded via brainIndex
export const posts: Post[] = postsData as Post[];
