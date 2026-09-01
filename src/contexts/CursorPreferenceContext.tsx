import React, { createContext, useCallback, useContext, useState } from 'react';

const STORAGE_KEY = 'infraphysics:aesthetic-cursor';

type CursorPreferenceContextType = {
  aestheticCursor: boolean;
  toggleAestheticCursor: () => void;
};

const CursorPreferenceContext = createContext<CursorPreferenceContextType>({
  aestheticCursor: true,
  toggleAestheticCursor: () => {},
});

export const useCursorPreference = () => useContext(CursorPreferenceContext);

export const CursorPreferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aestheticCursor, setAestheticCursor] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== 'off'; } catch { return true; }
  });

  const toggleAestheticCursor = useCallback(() => {
    setAestheticCursor(current => {
      const next = !current;
      try { localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off'); } catch {}
      return next;
    });
  }, []);

  return (
    <CursorPreferenceContext.Provider value={{ aestheticCursor, toggleAestheticCursor }}>
      {children}
    </CursorPreferenceContext.Provider>
  );
};
