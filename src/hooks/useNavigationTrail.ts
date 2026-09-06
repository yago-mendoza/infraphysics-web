// Navigation trail hook — tracks the user's click path through Second Brain concepts.
// Internalises the pending-action / activePost sync so the consumer only calls
// scheduleReset / scheduleExtend in click handlers.

import { useState, useCallback, useRef, useEffect, type MutableRefObject } from 'react';
import { noteLabel } from '../types';
// Minimal type — works with both Post and FieldNoteMeta
interface TrailSource { id: string; title: string; displayTitle?: string; }

export interface TrailItem {
  id: string;
  label: string;
}

const MAX_TRAIL = 25;
const TRAIL_STORAGE_KEY = 'wiki-navigation-trail-v1';
export const TRAIL_SYNC_EVENT = 'wiki-navigation-trail-change';

const toTrailItem = (post: TrailSource): TrailItem => ({
  id: post.id,
  label: noteLabel(post),
});

type TrailAction =
  | { type: 'reset'; post: TrailSource }
  | { type: 'extend'; post: TrailSource };

interface UseNavigationTrailOptions {
  activePost: TrailSource | null;
  directoryNavRef: MutableRefObject<boolean>;
}

export const useNavigationTrail = ({ activePost, directoryNavRef }: UseNavigationTrailOptions) => {
  const [trail, setTrail] = useState<TrailItem[]>(() => {
    try { return JSON.parse(sessionStorage.getItem(TRAIL_STORAGE_KEY) ?? '[]').slice(-MAX_TRAIL); } catch { return []; }
  });
  const pendingAction = useRef<TrailAction | null>(null);

  const resetTrail = useCallback((item: TrailItem) => {
    setTrail([item]);
  }, []);

  const extendTrail = useCallback((item: TrailItem) => {
    setTrail(prev => {
      // If already in trail, truncate back to that point (like "go back")
      const idx = prev.findIndex(t => t.id === item.id);
      if (idx >= 0) return prev.slice(0, idx + 1);
      // Otherwise append
      const next = [...prev, item];
      return next.length > MAX_TRAIL ? next.slice(next.length - MAX_TRAIL) : next;
    });
  }, []);

  const truncateTrail = useCallback((index: number) => {
    setTrail(prev => prev.slice(0, index + 1));
  }, []);

  const clearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  /** Grid/search navigation is still real visit history; do not erase it. */
  const scheduleReset = useCallback((post: TrailSource) => {
    pendingAction.current = { type: 'extend', post };
  }, []);

  /** Queue a trail extend for the next activePost sync (wiki-link/backlink clicks). */
  const scheduleExtend = useCallback((post: TrailSource) => {
    pendingAction.current = { type: 'extend', post };
  }, []);

  // Track browser back/forward via popstate
  const popstateFlag = useRef(false);
  useEffect(() => {
    const handler = () => { popstateFlag.current = true; };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Sync trail when activePost changes — apply pending action, directory signal, popstate, or init.
  useEffect(() => {
    if (!activePost) return;
    const action = pendingAction.current;
    pendingAction.current = null;

    const fromDirectory = directoryNavRef.current;
    directoryNavRef.current = false;

    const fromPopstate = popstateFlag.current;
    popstateFlag.current = false;

    if (action) {
      if (action.type === 'reset') {
        resetTrail(toTrailItem(action.post));
      } else {
        extendTrail(toTrailItem(action.post));
      }
    } else if (fromDirectory) {
      extendTrail(toTrailItem(activePost));
    } else if (fromPopstate) {
      // Browser back/forward: truncate to this item if in trail, otherwise reset
      setTrail(prev => {
        const idx = prev.findIndex(t => t.id === activePost.id);
        if (idx >= 0) return prev.slice(0, idx + 1);
        return [toTrailItem(activePost)];
      });
    } else {
      // Routes can also change through the graph, search palette, or browser
      // links, none of which schedule an action in this hook. They are still
      // genuine visits and must advance the trail rather than leave the first
      // concept frozen forever.
      extendTrail(toTrailItem(activePost));
    }
  }, [activePost, resetTrail, extendTrail, directoryNavRef]);

  useEffect(() => {
    try { sessionStorage.setItem(TRAIL_STORAGE_KEY, JSON.stringify(trail)); } catch { /* session history is optional */ }
    window.dispatchEvent(new CustomEvent(TRAIL_SYNC_EVENT, { detail: trail }));
  }, [trail]);

  useEffect(() => {
    const sync = (event: Event) => {
      const next = (event as CustomEvent<TrailItem[]>).detail;
      if (!Array.isArray(next)) return;
      const bounded = next.slice(-MAX_TRAIL);
      // This hook also emits the event. Reusing the same logical value avoids
      // an emit -> clone -> emit feedback loop that can starve route updates.
      setTrail(current => current.length === bounded.length && current.every((item, index) => item.id === bounded[index]?.id && item.label === bounded[index]?.label) ? current : bounded);
    };
    window.addEventListener(TRAIL_SYNC_EVENT, sync);
    return () => window.removeEventListener(TRAIL_SYNC_EVENT, sync);
  }, []);

  const isOverflowing = trail.length >= MAX_TRAIL;

  return { trail, scheduleReset, scheduleExtend, truncateTrail, clearTrail, isOverflowing };
};
