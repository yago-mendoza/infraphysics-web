import { useState, useEffect } from 'react';
import { engagementApiUrl, isLocalEngagementPreview } from '../lib/engagementApi';

/** Tracks and returns the view count for the current page via the views API. */
export function useViewCount(slug: string): { views: number | null } {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    // A localhost preview reads production without incrementing it. A real
    // deployed page records the visit using the normal deduplicated POST.
    fetch(engagementApiUrl(`/api/views${slug}`), {
      method: isLocalEngagementPreview() ? 'GET' : 'POST',
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data?.views != null) setViews(data.views);
      })
      .catch(() => {}); // Graceful — KV might not be bound locally

    return () => { cancelled = true; };
  }, [slug]);

  return { views };
}
