// Precomputed Second Brain index — runs once at import time, zero React overhead

import { posts } from '../data/data';
import { Post } from '../types';
import { addressToId } from './addressToId';
import { resolveWikiLinks } from './wikilinks';

// All field notes (stable reference)
export const allFieldNotes: Post[] = posts.filter(p => p.category === 'fieldnotes');

// O(1) lookup by id
export const noteById: Map<string, Post> = new Map(allFieldNotes.map(n => [n.id, n]));

// Backlinks: conceptId -> list of concepts that reference it (deduplicated per source note)
export const backlinksMap: Map<string, Post[]> = (() => {
  const map = new Map<string, Post[]>();
  allFieldNotes.forEach(note => {
    const seen = new Set<string>();
    (note.references || []).forEach(ref => {
      const refId = addressToId(ref);
      if (seen.has(refId)) return;
      seen.add(refId);
      if (!map.has(refId)) map.set(refId, []);
      map.get(refId)!.push(note);
    });
  });
  return map;
})();

// Related concepts: conceptId -> resolved Post[] from trailingRefs
export const relatedConceptsMap: Map<string, Post[]> = (() => {
  const map = new Map<string, Post[]>();
  allFieldNotes.forEach(note => {
    if (!note.trailingRefs || note.trailingRefs.length === 0) return;
    const related = note.trailingRefs
      .map(ref => noteById.get(addressToId(ref)))
      .filter((n): n is Post => n !== undefined);
    if (related.length > 0) map.set(note.id, related);
  });
  return map;
})();

// Pre-resolved HTML for every field note (wiki-links already resolved)
export const resolvedHtmlMap: Map<string, string> = (() => {
  const map = new Map<string, string>();
  allFieldNotes.forEach(note => {
    const { html } = resolveWikiLinks(note.content, allFieldNotes, noteById);
    map.set(note.id, html);
  });
  return map;
})();

// Global stats (computed once)
export const globalStats = (() => {
  const totalLinks = allFieldNotes.reduce((sum, n) => sum + (n.references?.length || 0), 0);

  const linkedToSet = new Set<string>();
  allFieldNotes.forEach(n => {
    (n.references || []).forEach(ref => {
      linkedToSet.add(addressToId(ref));
    });
  });

  const orphanCount = allFieldNotes.filter(n => {
    const hasOutgoing = (n.references?.length || 0) > 0;
    const hasIncoming = linkedToSet.has(n.id);
    return !hasOutgoing && !hasIncoming;
  }).length;

  return { totalLinks, orphanCount };
})();
