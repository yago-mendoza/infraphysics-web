import { useEffect, useState } from 'react';
import {
  HISTORICAL_PAGEVIEW_OFFSET,
  HISTORICAL_VISIT_OFFSET,
  HISTORICAL_VISITOR_OFFSET,
} from '../config/analytics';

export type Presence = {
  lastVisitor: { city?: string; region?: string; country?: string } | null;
  pageViews: number | null;
  visits: number | null;
  visitors: number | null;
};

let cachedPresence: Presence = {
  lastVisitor: null,
  pageViews: HISTORICAL_PAGEVIEW_OFFSET,
  visits: HISTORICAL_VISIT_OFFSET,
  visitors: HISTORICAL_VISITOR_OFFSET,
};
let request: Promise<Presence | null> | null = null;
const listeners = new Set<(presence: Presence) => void>();

export const usePresence = () => {
  const [presence, setPresence] = useState(cachedPresence);

  useEffect(() => {
    listeners.add(setPresence);
    if (!request) {
      request = fetch('/api/presence')
        .then(response => response.ok ? response.json() as Promise<Presence> : null)
        .then(data => {
          if (data) {
            cachedPresence = data;
            listeners.forEach(listener => listener(data));
          }
          return data;
        })
        .catch(() => null);
    }
    return () => { listeners.delete(setPresence); };
  }, []);

  return presence;
};
