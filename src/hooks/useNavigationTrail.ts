// Navigation trail hook — tracks the user's click path through Second Brain concepts.
// Internalises the pending-action / activePost sync so the consumer only calls
// scheduleReset / scheduleExtend in click handlers.

import { useState, useCallback, useRef, useEffect, type MutableRefObject } from 'react';
import type { Post } from '../types';

export interface TrailItem {
  id: string;
  label: string;
}

const MAX_TRAIL = 25;

const toTrailItem = (post: Post): TrailItem => ({
  id: post.id,
  label: post.displayTitle || post.title,
});

type TrailAction =
  | { type: 'reset'; post: Post }
  | { type: 'extend'; post: Post };

interface UseNavigationTrailOptions {
  activePost: Post | null;
  directoryNavRef: MutableRefObject<boolean>;
}

export const useNavigationTrail = ({ activePost, directoryNavRef }: UseNavigationTrailOptions) => {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const pendingAction = useRef<TrailAction | null>(null);

  const resetTrail = useCallback((item: TrailItem) => {
    setTrail([item]);
  }, []);

  const extendTrail = useCallback((item: TrailItem) => {
    setTrail(prev => {
      const filtered = prev.filter(t => t.id !== item.id);
      const next = [...filtered, item];
      return next.length > MAX_TRAIL ? next.slice(next.length - MAX_TRAIL) : next;
    });
  }, []);

  const truncateTrail = useCallback((index: number) => {
    setTrail(prev => prev.slice(0, index + 1));
  }, []);

  const clearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  const initTrail = useCallback((item: TrailItem) => {
    setTrail(prev => (prev.length === 0 ? [item] : prev));
  }, []);

  /** Queue a trail reset for the next activePost sync (grid/search clicks). */
  const scheduleReset = useCallback((post: Post) => {
    pendingAction.current = { type: 'reset', post };
  }, []);

  /** Queue a trail extend for the next activePost sync (wiki-link/backlink clicks). */
  const scheduleExtend = useCallback((post: Post) => {
    pendingAction.current = { type: 'extend', post };
  }, []);

  // Sync trail when activePost changes — apply pending action, directory signal, or init.
  useEffect(() => {
    if (!activePost) return;
    const action = pendingAction.current;
    pendingAction.current = null;

    const fromDirectory = directoryNavRef.current;
    directoryNavRef.current = false;

    if (action) {
      if (action.type === 'reset') {
        resetTrail(toTrailItem(action.post));
      } else {
        extendTrail(toTrailItem(action.post));
      }
    } else if (fromDirectory) {
      resetTrail(toTrailItem(activePost));
    } else {
      initTrail(toTrailItem(activePost));
    }
  }, [activePost, resetTrail, extendTrail, initTrail, directoryNavRef]);

  const isOverflowing = trail.length >= MAX_TRAIL;

  return { trail, scheduleReset, scheduleExtend, truncateTrail, clearTrail, isOverflowing };
};
