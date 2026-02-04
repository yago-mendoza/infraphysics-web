// Theme context — dark/light toggle with persistence

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
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

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    // 1. Declare transitions on every element
    document.documentElement.classList.add('theme-transitioning');

    // 2. Force reflow so the browser registers the transition properties
    //    BEFORE any values change.
    void document.documentElement.offsetHeight;

    // 3. Flip data-theme synchronously — CSS vars update in the same frame,
    //    transitions kick in immediately for all elements.
    document.documentElement.setAttribute('data-theme', next);

    // 4. Delay React re-render to next frame so Chrome commits to the
    //    CSS transition before React touches any DOM attributes/styles.
    requestAnimationFrame(() => {
      setTheme(next);
    });

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 1100);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
