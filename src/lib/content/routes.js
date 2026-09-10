// Stable identities are independent of public slugs and source filenames.
export const contentBase = category => category === 'wikinotes' ? '/wiki'
  : `/${category === 'projects' ? 'lab' : 'blog'}/${category}`;

// Source directories also contain authoring guides; Windows ignores filename case.
export const isReservedSlug = slug => /^(con|prn|aux|nul|com[0-9]|lpt[0-9]|readme|style|agents)$/i.test(slug);

export function slugify(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, '-plus-').replace(/#/g, '-sharp-').replace(/&/g, '-and-')
    .replace(/['’]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Translated siblings (`<slug>.es.md`) are served under a language prefix on the same slug:
// /es/blog/essays/<slug>. English is the base and carries no prefix. An entry lists the
// languages it has in `langs`; a prefixed url for a page without that language resolves to
// the English page (so it redirects to the canonical English url instead of 404ing).
export const CONTENT_LANGS = ['es'];
const LANG_PREFIX = new RegExp(`^/(${CONTENT_LANGS.join('|')})(?=/|$)`);
export const splitLang = pathname => {
  const m = pathname.match(LANG_PREFIX);
  return m ? { lang: m[1], rest: pathname.slice(m[0].length) || '/' } : { lang: null, rest: pathname };
};

export function createContentRoutes(entries) {
  const byIdentity = new Map();
  const byPath = new Map();
  for (const entry of entries) {
    const { category, id, slug, aliases = [] } = entry;
    const identity = `${category}/${id}`;
    if (!['projects', 'essays', 'bits2bricks', 'wikinotes'].includes(category) || typeof id !== 'string' || !/^[A-Za-z0-9]+$/.test(id)) {
      throw new Error(`Invalid content identity: ${identity}`);
    }
    if (byIdentity.has(identity)) throw new Error(`Duplicate identity: ${identity}`);
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || isReservedSlug(slug)) {
      throw new Error(`Invalid or reserved slug: ${identity}: ${slug}`);
    }
    if (!Array.isArray(aliases) || aliases.some(a => typeof a !== 'string' || !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(a))) throw new Error(`Invalid route aliases: ${identity}`);
    if (category === 'wikinotes' && [slug, id, ...aliases].includes('graph')) throw new Error('Reserved Wiki route: graph');
    const canonical = `${contentBase(category)}/${slug}`;
    const item = { ...entry, canonical };
    byIdentity.set(identity, item);
    const bases = category === 'wikinotes' ? ['/wiki', '/lab/second-brain']
      : [contentBase(category), `/${category}`, ...(category === 'essays' ? ['/blog/threads', '/threads'] : [])];
    for (const base of bases) for (const segment of new Set([id, slug, ...aliases])) {
      const route = `${base}/${segment}`;
      const previous = byPath.get(route);
      if (previous && previous !== item) throw new Error(`Route collision: ${route}`);
      byPath.set(route, item);
    }
  }
  const resolve = pathname => {
    const { lang, rest } = splitLang(pathname.split(/[?#]/)[0].replace(/\/$/, ''));
    const item = byPath.get(rest);
    if (!item) return undefined;
    if (lang && (item.langs || []).includes(lang)) return { ...item, lang, canonical: `/${lang}${item.canonical}` };
    return item;
  };
  const basePath = (category, id) => byIdentity.get(`${category}/${id}`)?.canonical
    || resolve(`${contentBase(category)}/${id}`)?.canonical || `${contentBase(category)}/${id}`;
  // `lang` picks the translated url when that language exists for the page; otherwise the English one.
  const path = (category, id, lang) => {
    const base = basePath(category, id);
    if (lang && lang !== 'en' && (byIdentity.get(`${category}/${id}`)?.langs || []).includes(lang)) return `/${lang}${base}`;
    return base;
  };
  const canonicalize = href => {
    const match = href.match(/^(https:\/\/infraphysics\.net)?(\/[^?#]*)(.*)$/);
    if (!match) return href;
    const item = resolve(match[2]);
    return item ? `${match[1] || ''}${item.canonical}${match[3]}` : href;
  };
  const storagePath = pathname => {
    const entry = resolve(pathname);
    return entry ? `${contentBase(entry.category)}/${entry.id}` : pathname;
  };
  return { byIdentity, byPath, resolve, path, canonicalize, storagePath };
}
