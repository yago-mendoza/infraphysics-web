import React, { createContext, useCallback, useContext, useState } from 'react';

const STORAGE_KEY = 'infraphysics:aesthetic-cursor';

type CursorPreferenceContextType = {
  aestheticCursor: boolean;
  toggleAestheticCursor: () => void;
};

// Off by default: the custom cursor is an opt-in from the gear menu or the command palette,
// remembered per browser. Only an explicit 'on' turns it on.
const CursorPreferenceContext = createContext<CursorPreferenceContextType>({
  aestheticCursor: false,
  toggleAestheticCursor: () => {},
});

export const useCursorPreference = () => useContext(CursorPreferenceContext);

export const CursorPreferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aestheticCursor, setAestheticCursor] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'on'; } catch { return false; }
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
