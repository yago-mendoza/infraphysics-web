// Precomputed Second Brain index — runs once at import time, zero React overhead

import { posts } from '../data/data';
import { FieldNote } from '../types';
import { addressToId } from './addressToId';
import { resolveWikiLinks } from './wikilinks';

// All field notes (stable reference)
export const allFieldNotes: FieldNote[] = posts.filter((p): p is FieldNote => p.category === 'fieldnotes');

// O(1) lookup by id
export const noteById: Map<string, FieldNote> = new Map(allFieldNotes.map(n => [n.id, n]));

// Backlinks: conceptId -> list of concepts that reference it (deduplicated per source note)
export const backlinksMap: Map<string, FieldNote[]> = (() => {
  const map = new Map<string, FieldNote[]>();
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

// Related concepts: conceptId -> resolved FieldNote[] from trailingRefs
export const relatedConceptsMap: Map<string, FieldNote[]> = (() => {
  const map = new Map<string, FieldNote[]>();
  allFieldNotes.forEach(note => {
    if (!note.trailingRefs || note.trailingRefs.length === 0) return;
    const related = note.trailingRefs
      .map(ref => noteById.get(addressToId(ref)))
      .filter((n): n is FieldNote => n !== undefined);
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

// Parent set: IDs of notes that have at least one child concept in the address tree.
// Used for O(1) leaf detection — a leaf is any note whose ID is NOT in this set.
// Built in O(N·D) where D is max address depth, by marking all ancestor addresses as parents.
export const parentIds: Set<string> = (() => {
  // Map address string → note id (only for notes that actually exist as concepts)
  const addressToNoteId = new Map<string, string>();
  allFieldNotes.forEach(note => {
    if (note.address) addressToNoteId.set(note.address, note.id);
  });

  const set = new Set<string>();
  allFieldNotes.forEach(note => {
    const parts = note.addressParts;
    if (!parts || parts.length <= 1) return;
    // Walk ancestor prefixes (all but the last part = the note itself)
    for (let i = 1; i < parts.length; i++) {
      const ancestorAddr = parts.slice(0, i).join('//');
      const ancestorId = addressToNoteId.get(ancestorAddr);
      if (ancestorId) set.add(ancestorId);
    }
  });
  return set;
})();

// Global stats (computed once at import time)
export const globalStats = (() => {
  const totalConcepts = allFieldNotes.length;
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

  const avgRefs = totalConcepts > 0
    ? Math.round((totalLinks / totalConcepts) * 10) / 10
    : 0;

  const maxDepth = allFieldNotes.reduce((max, n) => {
    const d = (n.addressParts || [n.title]).length;
    return d > max ? d : max;
  }, 0);

  const possibleConnections = totalConcepts * (totalConcepts - 1);
  const density = possibleConnections > 0
    ? Math.round((totalLinks / possibleConnections) * 1000) / 10
    : 0;

  let mostConnectedHub: FieldNote | null = null;
  let maxConnections = 0;
  allFieldNotes.forEach(n => {
    const outgoing = n.references?.length || 0;
    const incoming = (backlinksMap.get(n.id) || []).length;
    const total = outgoing + incoming;
    if (total > maxConnections) {
      maxConnections = total;
      mostConnectedHub = n;
    }
  });

  return { totalConcepts, totalLinks, orphanCount, avgRefs, maxDepth, density, mostConnectedHub };
})();
