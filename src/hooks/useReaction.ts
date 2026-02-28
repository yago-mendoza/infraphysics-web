import { useState, useEffect, useCallback } from 'react';

interface ReactionState {
  hearts: number | null;
  hearted: boolean;
  toggle: () => void;
}

/** Heart reaction toggle for a single article. */
export function useReaction(slug: string): ReactionState {
  const [hearts, setHearts] = useState<number | null>(null);
  const [hearted, setHearted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    fetch(`/api/reactions${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data) {
          setHearts(data.hearts ?? 0);
          setHearted(!!data.hearted);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [slug]);

  const toggle = useCallback(() => {
    if (!slug) return;

    // Optimistic update
    setHearted(prev => !prev);
    setHearts(prev => prev != null ? (hearted ? Math.max(0, prev - 1) : prev + 1) : prev);

    fetch(`/api/reactions${slug}`, { method: 'POST' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setHearts(data.hearts);
          setHearted(data.hearted);
        }
      })
      .catch(() => {
        // Revert on error
        setHearted(prev => !prev);
        setHearts(prev => prev != null ? (hearted ? prev + 1 : Math.max(0, prev - 1)) : prev);
      });
  }, [slug, hearted]);

  return { hearts, hearted, toggle };
}
