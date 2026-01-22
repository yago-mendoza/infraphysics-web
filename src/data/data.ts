import { Post } from '../types';
import { logPosts } from './data-logs';
import { projectPosts } from './data-projects';
import { threadPosts } from './data-threads';
import { bits2bricksPosts } from './data-bits2bricks';

export const posts: Post[] = [
  ...logPosts,
  ...projectPosts,
  ...threadPosts,
  ...bits2bricksPosts
];