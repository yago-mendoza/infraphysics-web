import { useState, useEffect } from 'react';
import type { Post } from '../types';
import { postPath } from '../config/categories';

export interface ArticleStats {
  views: number;
  hearts: number;
}

/** Bulk-fetches views + hearts for a list of posts (used by listing grids). */
export function useArticleStats(posts: Post[]): Record<string, ArticleStats> {
  const [stats, setStats] = useState<Record<string, ArticleStats>>({});

  useEffect(() => {
    if (posts.length === 0) return;
    let cancelled = false;

    const slugs = posts.map(p => postPath(p.category, p.id));

    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [posts]);

  return stats;
}
