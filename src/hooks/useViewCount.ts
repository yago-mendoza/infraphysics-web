import { useState, useEffect } from 'react';
import { engagementApiUrl, isLocalEngagementPreview } from '../lib/engagementApi';

/** Tracks and returns the view count for the current page via the views API. */
export function useViewCount(slug: string): { views: number | null } {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    let started = false;
    const load = () => {
    if (started || document.visibilityState !== 'visible') return;
    started = true;

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
    };
    load();
    document.addEventListener('visibilitychange', load);

    return () => { cancelled = true; document.removeEventListener('visibilitychange', load); };
  }, [slug]);

  return { views };
}
