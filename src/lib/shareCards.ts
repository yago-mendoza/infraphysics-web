// shareCards: what every shareable url puts on its share card. One CardData shape for the five kinds
// (article, playground, wiki note, section shelf, personal page), built from the site's own data.
// Consumed by the dev-only render routes (/og) that scripts/og-cards.js photographs.
// Both use share-card-catalog.js for the inventory.

import { postSummaries } from '../data/postSummaries';
import { catAccentVar, postPath, secondBrainPath } from '../config/categories';
import type { PostSummary, WikiNoteMeta } from '../types';
import type { CardData } from '../views/shareCardDesigns';

import { SECTIONS, PAGES, PLAYGROUNDS } from './share-card-catalog.js';
export { SECTIONS, PAGES, PLAYGROUNDS };

const OXIDE = 'var(--brand-oxide)';
/* The wiki's own accent is a pale lavender that reads grey on the black card; the cards use a fuller purple. */
const WIKI_PURPLE = '#8b5cf6';
/* Playgrounds are tools, not pieces: a warm grey instead of a category colour. */
const PLAYGROUND_GREY = '#b3ada2';

const CATEGORY_LABEL: Record<string, string> = { projects: 'Projects', essays: 'Essays', bits2bricks: 'Bits2Bricks', wikinotes: 'Wiki' };





/* The interactive pages under public/playgrounds/<article id>/<name>.html, with the title each one carries. */


export const playgroundId = (pg: { article: string; file: string }) => `${pg.article}--${pg.file}`;
export const playgroundPath = (pg: { article: string; file: string }) => `/playgrounds/${pg.article}/${pg.file}.html`;

export const fromPost = (post: PostSummary): CardData => ({
  kind: 'article',
  category: post.category,
  // No category label on the card: the design says what it is.
  kicker: '',
  title: post.displayTitle || post.title,
  line: post.subtitle ?? '',
  accent: catAccentVar(post.category),
  image: post.thumbnail,
  imageFocus: post.thumbnailFocus ?? undefined,
  coverArt: post.shareCard === 'cover',
});

export const fromNote = (note: WikiNoteMeta): CardData => {
  const parts = note.address.split('//');
  return {
    kind: 'wiki',
    kicker: parts.length > 1 ? parts.slice(0, -1).join(' / ') : 'wiki · root',
    title: note.displayTitle || note.title,
    line: note.description.replace(/^-\s*/, ''),
    accent: WIKI_PURPLE,
  };
};

export const fromSection = (section: typeof SECTIONS[number]): CardData => ({
  kind: 'section',
  category: section.id,
  kicker: `infraphysics.net${section.to}`,
  title: section.title,
  line: section.line,
  accent: section.id === 'wikinotes' ? WIKI_PURPLE : catAccentVar(section.id),
});

export const fromPage = (page: typeof PAGES[number]): CardData => ({
  kind: 'page',
  kicker: `infraphysics.net${page.to === '/home' ? '' : page.to}`,
  title: page.title,
  line: page.line,
  accent: OXIDE,
  emblem: page.id === 'home',
});

export const fromPlayground = (pg: typeof PLAYGROUNDS[number]): CardData | null => {
  const parent = postSummaries.find(p => p.id === pg.article);
  if (!parent) return null;
  return {
    kind: 'playground',
    kicker: '',
    title: pg.title,
    line: `An interactive page from the article ${parent.displayTitle || parent.title}.`,
    accent: PLAYGROUND_GREY,
  };
};

/** One card by kind and id, for the render route. Wiki notes need the index, passed in. */
export function cardFor(kind: string, id: string, notes: WikiNoteMeta[]): { path: string; data: CardData } | null {
  if (kind === 'article') {
    const post = postSummaries.find(p => p.id === id);
    return post ? { path: postPath(post.category, post.id), data: fromPost(post) } : null;
  }
  if (kind === 'playground') {
    const pg = PLAYGROUNDS.find(p => playgroundId(p) === id);
    const data = pg ? fromPlayground(pg) : null;
    return pg && data ? { path: playgroundPath(pg), data } : null;
  }
  if (kind === 'wiki') {
    const note = notes.find(n => n.id === id);
    return note ? { path: secondBrainPath(note.id), data: fromNote(note) } : null;
  }
  if (kind === 'section') {
    const section = SECTIONS.find(s => s.id === id);
    return section ? { path: section.to, data: fromSection(section) } : null;
  }
  if (kind === 'page') {
    const page = PAGES.find(p => p.id === id);
    return page ? { path: page.to, data: fromPage(page) } : null;
  }
  return null;
}
