// Theme context. One atmosphere: the site is dark everywhere by default. Light is a reader
// preference, not a zone: a single global setting (gear, Shift+T) remembered for the whole
// site, never inferred from the OS. An article may still force a theme on entry through its
// `theme:` frontmatter; that override is applied but not saved.

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const DEFAULT_THEME: Theme = 'dark';
const STORAGE_KEY = 'infraphysics:theme';

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return DEFAULT_THEME;
}

function saveTheme(theme: Theme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  /** Route watcher: re-apply the reader's preference, or an article's `theme:` override (not saved). Instant, no animation. */
  applyRoute: (override?: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {}, applyRoute: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const initial = readTheme();
    document.documentElement.setAttribute('data-theme', initial);
    return initial;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const applyRoute = useCallback((override?: Theme) => {
    const preferred = override ?? readTheme();
    if (document.documentElement.getAttribute('data-theme') === preferred) {
      setThemeState(prev => prev === preferred ? prev : preferred);
      return;
    }
    document.documentElement.setAttribute('data-theme', preferred);
    setThemeState(preferred);
  }, []);

  // Smooth animated toggle; saves the global preference.
  const toggleTheme = useCallback(() => {
    const current = document.documentElement.getAttribute('data-theme') as Theme;
    const next: Theme = current === 'dark' ? 'light' : 'dark';

    saveTheme(next);
    try { localStorage.setItem('infraphysics:theme-toggled', '1'); } catch {}

    document.documentElement.classList.add('theme-transitioning');
    void document.documentElement.offsetHeight;
    document.documentElement.setAttribute('data-theme', next);

    requestAnimationFrame(() => {
      setThemeState(next);
    });

    const root = document.documentElement;
    const finish = (event?: TransitionEvent) => {
      if (event && event.target !== root) return;
      if (event && event.propertyName !== '--bg-base') return;
      root.classList.remove('theme-transitioning');
      root.removeEventListener('transitionend', finish);
      window.clearTimeout(fallback);
    };
    root.addEventListener('transitionend', finish);
    const fallback = window.setTimeout(() => finish(), 1250);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, applyRoute }}>
      {children}
    </ThemeContext.Provider>
  );
};
