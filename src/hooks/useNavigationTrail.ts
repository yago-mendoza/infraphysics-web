// Navigation trail hook — tracks the user's click path through Second Brain concepts

import { useState, useCallback } from 'react';

export interface TrailItem {
  id: string;
  label: string;
}

const MAX_TRAIL = 25;

export const useNavigationTrail = () => {
  const [trail, setTrail] = useState<TrailItem[]>([]);

  /** Clear trail and set to a single item. Grid/search card clicks. */
  const resetTrail = useCallback((item: TrailItem) => {
    setTrail([item]);
  }, []);

  /** Remove existing duplicate if any, append to end. Trim from front if > MAX. Wiki-link/backlink/related clicks. */
  const extendTrail = useCallback((item: TrailItem) => {
    setTrail(prev => {
      const filtered = prev.filter(t => t.id !== item.id);
      const next = [...filtered, item];
      return next.length > MAX_TRAIL ? next.slice(next.length - MAX_TRAIL) : next;
    });
  }, []);

  /** Keep items 0..index inclusive. Breadcrumb clicks. */
  const truncateTrail = useCallback((index: number) => {
    setTrail(prev => prev.slice(0, index + 1));
  }, []);

  /** Set trail to []. "All Concepts" click. */
  const clearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  /** Set to [item] ONLY if trail is empty. Page refresh seed. */
  const initTrail = useCallback((item: TrailItem) => {
    setTrail(prev => (prev.length === 0 ? [item] : prev));
  }, []);

  return { trail, resetTrail, extendTrail, truncateTrail, clearTrail, initTrail };
};
