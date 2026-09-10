import entries from '../data/content-routes.generated.json';
import { createContentRoutes, splitLang } from './content/routes.js';

export const contentRoutes = createContentRoutes(entries);

/** The path without its language prefix: `/es/blog/essays/x` and `/blog/essays/x` are the same page. */
export const stripLang = (pathname: string): string => splitLang(pathname).rest;
