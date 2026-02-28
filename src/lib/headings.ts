import type { HeadingInfo } from '../contexts/ArticleContext';

/** Pixel threshold below viewport top for a heading to be considered "active" */
export const ACTIVE_HEADING_THRESHOLD = 120;

/** Compute the ancestor chain (active heading + all parent sections at shallower depths) */
export function getActiveChain(headings: HeadingInfo[], id: string): Set<string> {
  const ids = new Set<string>();
  if (!id || headings.length < 2) return ids;
  const idx = headings.findIndex(h => h.id === id);
  if (idx === -1) return ids;
  ids.add(id);
  let depth = headings[idx].depth;
  for (let i = idx - 1; i >= 0; i--) {
    if (headings[i].depth < depth) {
      ids.add(headings[i].id);
      depth = headings[i].depth;
      if (depth === 0) break;
    }
  }
  return ids;
}
