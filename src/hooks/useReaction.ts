import { useState, useEffect, useCallback, useRef } from 'react';

interface ReactionState {
  hearts: number | null;
  hearted: boolean;
  toggle: () => void;
}

/** Heart reaction toggle for a single article. */
export function useReaction(slug: string): ReactionState {
  const [hearts, setHearts] = useState<number | null>(null);
  const [hearted, setHearted] = useState(false);

  // Mirror of `hearted` for use inside `toggle` without a stale closure, and a
  // flag so a slow initial GET can't clobber an optimistic toggle (the race that
  // made a like briefly read as a subtraction).
  const heartedRef = useRef(false);
  const interacted = useRef(false);
  useEffect(() => { heartedRef.current = hearted; }, [hearted]);

  useEffect(() => {
    if (!slug) return;
    interacted.current = false;
    let cancelled = false;

    fetch(`/api/reactions${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && !interacted.current && data) {
          setHearts(data.hearts ?? 0);
          setHearted(!!data.hearted);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [slug]);

  const toggle = useCallback(() => {
    if (!slug) return;
    interacted.current = true;

    // Optimistic update — direction comes from the ref, never a stale closure.
    const next = !heartedRef.current;
    heartedRef.current = next;
    setHearted(next);
    setHearts(prev => prev == null ? prev : (next ? prev + 1 : Math.max(0, prev - 1)));

    fetch(`/api/reactions${slug}`, { method: 'POST' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          // Reconcile with the server's authoritative count.
          setHearts(data.hearts);
          setHearted(!!data.hearted);
          heartedRef.current = !!data.hearted;
        }
      })
      .catch(() => {
        // Revert the optimistic change.
        const reverted = !heartedRef.current;
        heartedRef.current = reverted;
        setHearted(reverted);
        setHearts(prev => prev == null ? prev : (reverted ? prev + 1 : Math.max(0, prev - 1)));
      });
  }, [slug]);

  return { hearts, hearted, toggle };
}
