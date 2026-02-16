// Theme context — dark/light toggle with per-zone persistence
// Two independent theme memories: blog zone (default light) and app zone (default dark)

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'dark' | 'light';
type Zone = 'blog' | 'app';

const ZONE_DEFAULTS: Record<Zone, Theme> = { blog: 'light', app: 'dark' };
const ZONE_KEYS: Record<Zone, string> = { blog: 'theme-blog', app: 'theme-app' };

function readZoneTheme(zone: Zone): Theme {
  try {
    const saved = localStorage.getItem(ZONE_KEYS[zone]) as Theme | null;
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return ZONE_DEFAULTS[zone];
}

function saveZoneTheme(zone: Zone, theme: Theme) {
  try { localStorage.setItem(ZONE_KEYS[zone], theme); } catch {}
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  applyZone: (zone: Zone) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {}, applyZone: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const zoneRef = useRef<Zone>('app');

  const [theme, setThemeState] = useState<Theme>(() => {
    // Read zone from current URL before React Router mounts
    const zone: Zone = window.location.pathname.startsWith('/blog') ? 'blog' : 'app';
    zoneRef.current = zone;
    const initial = readZoneTheme(zone);
    document.documentElement.setAttribute('data-theme', initial);
    return initial;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Called by route watcher — switches to the zone's remembered preference (instant, no animation)
  const applyZone = useCallback((zone: Zone) => {
    zoneRef.current = zone;
    const preferred = readZoneTheme(zone);
    if (document.documentElement.getAttribute('data-theme') === preferred) {
      setThemeState(prev => prev === preferred ? prev : preferred);
      return;
    }
    document.documentElement.setAttribute('data-theme', preferred);
    setThemeState(preferred);
  }, []);

  // Smooth animated toggle — saves to current zone
  const toggleTheme = useCallback(() => {
    const current = document.documentElement.getAttribute('data-theme') as Theme;
    const next: Theme = current === 'dark' ? 'light' : 'dark';

    saveZoneTheme(zoneRef.current, next);
    try { localStorage.setItem('infraphysics:theme-toggled', '1'); } catch {}

    document.documentElement.classList.add('theme-transitioning');
    void document.documentElement.offsetHeight;
    document.documentElement.setAttribute('data-theme', next);

    requestAnimationFrame(() => {
      setThemeState(next);
    });

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 1100);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, applyZone }}>
      {children}
    </ThemeContext.Provider>
  );
};
