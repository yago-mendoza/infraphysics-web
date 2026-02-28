import { useState, useEffect } from 'react';

/** Tracks and returns the view count for the current page via the views API. */
export function useViewCount(slug: string): { views: number | null } {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    fetch(`/api/views${slug}`, { method: 'POST' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data?.views != null) setViews(data.views);
      })
      .catch(() => {}); // Graceful — KV might not be bound locally

    return () => { cancelled = true; };
  }, [slug]);

  return { views };
}
