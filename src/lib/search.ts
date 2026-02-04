// Search utilities — excerpt extraction and match counting

import { stripHtml } from './content';

/** Extract a plain-text excerpt around the first match of `query` in `html`. */
export function getSearchExcerpt(html: string, query: string, ctx = 50): string | null {
  if (!query) return null;
  const plain = stripHtml(html);
  const index = plain.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return null;
  const start = Math.max(0, index - ctx);
  const end = Math.min(plain.length, index + ctx * 2);
  return '...' + plain.substring(start, end) + '...';
}

/** Count non-overlapping occurrences of `query` in the plain-text version of `html`. */
export function countMatches(html: string, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const plain = stripHtml(html).toLowerCase();
  let count = 0;
  let pos = 0;
  while ((pos = plain.indexOf(q, pos)) !== -1) {
    count++;
    pos += q.length;
  }
  return count;
}
