// Theme context — dark/light toggle with persistence

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (next: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {}, setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  // Instant theme set — for route-based auto-switching (no animation)
  const setTheme = useCallback((next: Theme) => {
    if (document.documentElement.getAttribute('data-theme') === next) return;
    document.documentElement.setAttribute('data-theme', next);
    setThemeState(next);
  }, []);

  // Smooth animated toggle — for manual user action only
  const toggleTheme = useCallback(() => {
    const current = document.documentElement.getAttribute('data-theme') as Theme;
    const next: Theme = current === 'dark' ? 'light' : 'dark';

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
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
