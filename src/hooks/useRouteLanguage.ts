// Which languages the page on screen exists in, and the url of each version. Only articles
// with a translated sibling have more than English; every other page (home, wiki, listings)
// is English only, so the language control in the nav is disabled there.

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { contentRoutes } from '../lib/contentRoutes';
import type { Lang } from '../contexts/LangContext';

export interface RouteLanguage {
  /** Language of the version on screen. */
  current: Lang;
  /** Languages this page exists in, English first. */
  available: Lang[];
  /** Url of the page in a language, or null when it does not exist in it. */
  pathFor: (lang: Lang) => string | null;
}

export function useRouteLanguage(): RouteLanguage {
  const location = useLocation();
  return useMemo(() => {
    const route = contentRoutes.resolve(location.pathname) as (ReturnType<typeof contentRoutes.resolve> & { lang?: string; langs?: string[] }) | undefined;
    const isArticle = !!route && route.category !== 'wikinotes';
    const langs = isArticle ? (route.langs || []) : [];
    const available = ['en', ...langs] as Lang[];
    const current = (isArticle && route.lang === 'es') ? 'es' : 'en';
    const base = isArticle ? route.canonical.replace(/^\/es(?=\/)/, '') : null;
    const pathFor = (lang: Lang) => {
      if (!base) return null;
      if (lang === 'en') return base + location.search + location.hash;
      return langs.includes(lang) ? `/${lang}${base}${location.search}${location.hash}` : null;
    };
    return { current, available, pathFor };
  }, [location.pathname, location.search, location.hash]);
}
