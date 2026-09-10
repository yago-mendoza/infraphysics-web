// Language preference. English is the site's language; some articles also exist in Spanish
// (`<slug>.es.md`, served at /es/<canonical>). The preference is one global reader setting
// (gear, mobile menu) remembered in localStorage, default English, never inferred from the
// browser (same criterion as the theme). It decides which version links and cards point to;
// the url still says which version is on screen.

import React, { createContext, useCallback, useContext, useState } from 'react';

export type Lang = 'en' | 'es';

export const LANG_LABELS: Record<Lang, string> = { en: 'English', es: 'Castellano' };
const DEFAULT_LANG: Lang = 'en';
const STORAGE_KEY = 'infraphysics:lang';

function readLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch {}
  return DEFAULT_LANG;
}

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType>({ lang: DEFAULT_LANG, setLang: () => {} });

export const useLang = () => useContext(LangContext);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(readLang);
  const setLang = useCallback((next: Lang) => {
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    setLangState(next);
  }, []);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
};
