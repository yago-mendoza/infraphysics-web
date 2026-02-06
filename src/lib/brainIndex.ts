// Async Second Brain index — loads fieldnotes metadata from generated index,
// fetches individual note content on demand.

import { FieldNoteMeta } from '../types';
import { addressToId } from './addressToId';
import { resolveWikiLinks } from './wikilinks';

export interface BrainIndex {
  allFieldNotes: FieldNoteMeta[];
  noteById: Map<string, FieldNoteMeta>;
  backlinksMap: Map<string, FieldNoteMeta[]>;
  relatedConceptsMap: Map<string, FieldNoteMeta[]>;
  parentIds: Set<string>;
  globalStats: {
    totalConcepts: number;
    totalLinks: number;
    orphanCount: number;
    avgRefs: number;
    maxDepth: number;
    density: number;
    mostConnectedHub: FieldNoteMeta | null;
  };
}

let _index: BrainIndex | null = null;
let _initPromise: Promise<BrainIndex> | null = null;

// Content cache: id → resolved HTML (with wiki-links)
const _contentCache = new Map<string, string>();

export async function initBrainIndex(): Promise<BrainIndex> {
  if (_index) return _index;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const indexData: FieldNoteMeta[] = await import('../data/fieldnotes-index.generated.json').then(m => m.default as FieldNoteMeta[]);

    const allFieldNotes = indexData;
    const noteById = new Map(allFieldNotes.map(n => [n.id, n]));

    // Backlinks
    const backlinksMap = new Map<string, FieldNoteMeta[]>();
    allFieldNotes.forEach(note => {
      const seen = new Set<string>();
      (note.references || []).forEach(ref => {
        const refId = addressToId(ref);
        if (seen.has(refId)) return;
        seen.add(refId);
        if (!backlinksMap.has(refId)) backlinksMap.set(refId, []);
        backlinksMap.get(refId)!.push(note);
      });
    });

    // Related concepts
    const relatedConceptsMap = new Map<string, FieldNoteMeta[]>();
    allFieldNotes.forEach(note => {
      if (!note.trailingRefs || note.trailingRefs.length === 0) return;
      const related = note.trailingRefs
        .map(ref => noteById.get(addressToId(ref)))
        .filter((n): n is FieldNoteMeta => n !== undefined);
      if (related.length > 0) relatedConceptsMap.set(note.id, related);
    });

    // Parent IDs
    const addressToNoteId = new Map<string, string>();
    allFieldNotes.forEach(note => {
      if (note.address) addressToNoteId.set(note.address, note.id);
    });
    const parentIds = new Set<string>();
    allFieldNotes.forEach(note => {
      const parts = note.addressParts;
      if (!parts || parts.length <= 1) return;
      for (let i = 1; i < parts.length; i++) {
        const ancestorAddr = parts.slice(0, i).join('//');
        const ancestorId = addressToNoteId.get(ancestorAddr);
        if (ancestorId) parentIds.add(ancestorId);
      }
    });

    // Stats
    const totalConcepts = allFieldNotes.length;
    const totalLinks = allFieldNotes.reduce((sum, n) => sum + (n.references?.length || 0), 0);
    const linkedToSet = new Set<string>();
    allFieldNotes.forEach(n => {
      (n.references || []).forEach(ref => linkedToSet.add(addressToId(ref)));
    });
    const orphanCount = allFieldNotes.filter(n => {
      const hasOutgoing = (n.references?.length || 0) > 0;
      const hasIncoming = linkedToSet.has(n.id);
      return !hasOutgoing && !hasIncoming;
    }).length;
    const avgRefs = totalConcepts > 0 ? Math.round((totalLinks / totalConcepts) * 10) / 10 : 0;
    const maxDepth = allFieldNotes.reduce((max, n) => {
      const d = (n.addressParts || [n.title]).length;
      return d > max ? d : max;
    }, 0);
    const possibleConnections = totalConcepts * (totalConcepts - 1);
    const density = possibleConnections > 0
      ? Math.round((totalLinks / possibleConnections) * 1000) / 10
      : 0;

    let mostConnectedHub: FieldNoteMeta | null = null;
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

    _index = {
      allFieldNotes,
      noteById,
      backlinksMap,
      relatedConceptsMap,
      parentIds,
      globalStats: { totalConcepts, totalLinks, orphanCount, avgRefs, maxDepth, density, mostConnectedHub },
    };

    return _index;
  })();

  return _initPromise;
}

/** Sync accessor — throws if init hasn't completed */
export function getBrainIndex(): BrainIndex {
  if (!_index) throw new Error('brainIndex not initialized — call initBrainIndex() first');
  return _index;
}

/** Fetch + resolve wiki-links for a single note's content. Cached in memory. */
export async function fetchNoteContent(id: string): Promise<string> {
  const cached = _contentCache.get(id);
  if (cached) return cached;

  const index = getBrainIndex();
  const resp = await fetch(`/fieldnotes/${id}.json`);
  if (!resp.ok) return '<p>Content unavailable.</p>';

  const { content } = await resp.json();
  const { html } = resolveWikiLinks(content, index.allFieldNotes, index.noteById);
  _contentCache.set(id, html);
  return html;
}
