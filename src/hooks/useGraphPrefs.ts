// Preferences shared by every wiki graph surface (mini map, expanded workspace, note card).
// Stored once in localStorage and broadcast on change, so each instance stays in step.

import { useCallback, useEffect, useRef, useState } from 'react';

export const GRAPH_PREF_EVENT = 'wiki-graph-pref-change';

export function useSharedPref<T>(key: string, fallback: T): [T, (next: T | ((current: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw) as T; } catch { return fallback; }
  });
  const valueRef = useRef(value);
  valueRef.current = value;
  useEffect(() => {
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: T }>).detail;
      if (detail?.key === key) setValue(detail.value);
    };
    window.addEventListener(GRAPH_PREF_EVENT, receive);
    return () => window.removeEventListener(GRAPH_PREF_EVENT, receive);
  }, [key]);
  const update = useCallback((next: T | ((current: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (current: T) => T)(valueRef.current) : next;
    setValue(resolved);
    try { localStorage.setItem(key, JSON.stringify(resolved)); } catch { /* preferences are optional */ }
    window.dispatchEvent(new CustomEvent(GRAPH_PREF_EVENT, { detail: { key, value: resolved } }));
  }, [key]);
  return [value, update];
}
