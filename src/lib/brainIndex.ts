// Async Second Brain index — loads fieldnotes metadata from generated index,
// fetches individual note content on demand.

import { FieldNoteMeta, ConnectionRef } from '../types';
import { resolveWikiLinks } from './wikilinks';

export interface Connection {
  note: FieldNoteMeta;
  annotation: string | null;       // from the declaring side
  reverseAnnotation: string | null; // from the other side (if bilateral)
}

export interface Neighborhood {
  parent: FieldNoteMeta | null;
  siblings: FieldNoteMeta[];
  children: FieldNoteMeta[];
}

export interface BrainIndex {
  allFieldNotes: FieldNoteMeta[];
  noteById: Map<string, FieldNoteMeta>;
  addressToNoteId: Map<string, string>;
  backlinksMap: Map<string, FieldNoteMeta[]>;
  connectionsMap: Map<string, Connection[]>;
  mentionsMap: Map<string, FieldNoteMeta[]>;
  neighborhoodMap: Map<string, Neighborhood>;
  homonymsMap: Map<string, FieldNoteMeta[]>;
  parentIds: Set<string>;
  globalStats: {
    totalConcepts: number;
    totalLinks: number;
    isolatedCount: number;
    avgRefs: number;
    maxDepth: number;
    density: number;
    mostConnectedHub: FieldNoteMeta | null;
  };
}

let _index: BrainIndex | null = null;
let _initPromise: Promise<BrainIndex> | null = null;

// Content cache: id → resolved HTML (with wiki-links).
// Capped at MAX_CACHE entries — oldest inserted entries are evicted first.
const _contentCache = new Map<string, string>();
const MAX_CACHE = 150;

function _cacheSet(id: string, html: string) {
  // Delete first so re-insertion moves it to the end (Map preserves insertion order)
  _contentCache.delete(id);
  _contentCache.set(id, html);
  // Evict oldest entries if over limit
  if (_contentCache.size > MAX_CACHE) {
    const first = _contentCache.keys().next().value!;
    _contentCache.delete(first);
  }
}

export async function initBrainIndex(freshData?: FieldNoteMeta[]): Promise<BrainIndex> {
  if (!freshData && _index) return _index;
  if (!freshData && _initPromise) return _initPromise;

  _initPromise = (async () => {
    const indexData: FieldNoteMeta[] = freshData ??
      await fetch('/fieldnotes-index.json').then(r => r.json());

    const allFieldNotes = indexData;
    const noteById = new Map(allFieldNotes.map(n => [n.id, n]));

    // Address → note ID mapping (for neighborhood computation)
    const addressToNoteId = new Map<string, string>();
    allFieldNotes.forEach(note => {
      if (note.address) addressToNoteId.set(note.address, note.id);
    });

    // Collect trailing ref UIDs per note (for excluding from mentions)
    const trailingRefIds = new Map<string, Set<string>>();
    allFieldNotes.forEach(note => {
      const refs = note.trailingRefs || [];
      const ids = new Set<string>();
      refs.forEach(ref => {
        ids.add(ref.uid);
      });
      trailingRefIds.set(note.id, ids);
    });

    // Backlinks (all references, including inline body + trailing)
    // references[] now stores UIDs directly
    const backlinksMap = new Map<string, FieldNoteMeta[]>();
    allFieldNotes.forEach(note => {
      const seen = new Set<string>();
      (note.references || []).forEach(refUid => {
        if (seen.has(refUid)) return;
        seen.add(refUid);
        if (!backlinksMap.has(refUid)) backlinksMap.set(refUid, []);
        backlinksMap.get(refUid)!.push(note);
      });
    });

    // Bilateral connections from trailing refs
    const connectionsMap = new Map<string, Connection[]>();

    // First pass: collect all declared trailing ref connections
    const declaredConnections = new Map<string, Map<string, string | null>>(); // noteId → Map<targetId, annotation>
    allFieldNotes.forEach(note => {
      const refs = note.trailingRefs || [];
      if (refs.length === 0) return;
      const map = new Map<string, string | null>();
      refs.forEach(ref => {
        const targetId = ref.uid;
        const annotation = ref.annotation;
        if (targetId !== note.id) { // Skip self-refs
          map.set(targetId, annotation);
        }
      });
      declaredConnections.set(note.id, map);
    });

    // Second pass: build bilateral connections for each note
    allFieldNotes.forEach(note => {
      const seen = new Set<string>();
      const connections: Connection[] = [];

      // From this note's own trailing refs
      const myDeclared = declaredConnections.get(note.id);
      if (myDeclared) {
        myDeclared.forEach((annotation, targetId) => {
          const target = noteById.get(targetId);
          if (!target || seen.has(targetId)) return;
          seen.add(targetId);

          // Check if target also declared a connection back
          const theirDeclared = declaredConnections.get(targetId);
          const reverseAnnotation = theirDeclared?.get(note.id) ?? null;

          connections.push({ note: target, annotation, reverseAnnotation });
        });
      }

      // From other notes' trailing refs that point to this note (bilateral reverse)
      declaredConnections.forEach((theirRefs, otherId) => {
        if (otherId === note.id || seen.has(otherId)) return;
        if (theirRefs.has(note.id)) {
          const other = noteById.get(otherId);
          if (!other) return;
          seen.add(otherId);
          connections.push({
            note: other,
            annotation: null, // this note didn't declare the connection
            reverseAnnotation: theirRefs.get(note.id) ?? null,
          });
        }
      });

      if (connections.length > 0) {
        connectionsMap.set(note.id, connections);
      }
    });

    // Mentions: body-text backlinks EXCLUDING trailing refs
    const mentionsMap = new Map<string, FieldNoteMeta[]>();
    allFieldNotes.forEach(note => {
      const seen = new Set<string>();
      const myTrailingIds = trailingRefIds.get(note.id) || new Set();

      (note.references || []).forEach(refUid => {
        if (seen.has(refUid) || refUid === note.id) return;
        seen.add(refUid);

        // Skip if this ref is also a trailing ref from note
        if (myTrailingIds.has(refUid)) return;

        if (!mentionsMap.has(refUid)) mentionsMap.set(refUid, []);
        mentionsMap.get(refUid)!.push(note);
      });
    });

    // Parent IDs
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

    // Neighborhood: parent, siblings, children for each note — O(N) via pre-built maps
    const neighborhoodMap = new Map<string, Neighborhood>();

    // Build children-by-parent-address map (single O(N) pass)
    const childrenByParent = new Map<string, FieldNoteMeta[]>();
    const rootNotes: FieldNoteMeta[] = [];

    allFieldNotes.forEach(note => {
      const parts = note.addressParts || [note.title];
      if (parts.length === 1) {
        rootNotes.push(note);
      } else {
        const parentAddr = parts.slice(0, -1).join('//');
        if (!childrenByParent.has(parentAddr)) childrenByParent.set(parentAddr, []);
        childrenByParent.get(parentAddr)!.push(note);
      }
    });

    // O(1) lookups per note
    allFieldNotes.forEach(note => {
      const parts = note.addressParts || [note.title];
      const addr = note.address || '';

      // Parent
      let parent: FieldNoteMeta | null = null;
      if (parts.length > 1) {
        const parentAddr = parts.slice(0, -1).join('//');
        const parentId = addressToNoteId.get(parentAddr);
        if (parentId) parent = noteById.get(parentId) || null;
      }

      // Siblings: other children of the same parent
      let siblings: FieldNoteMeta[];
      if (parts.length > 1) {
        const parentAddr = parts.slice(0, -1).join('//');
        siblings = (childrenByParent.get(parentAddr) || []).filter(n => n.id !== note.id);
      } else {
        siblings = rootNotes.filter(n => n.id !== note.id);
      }

      // Children: notes one level deeper
      const children = childrenByParent.get(addr) || [];

      siblings.sort((a, b) => (a.address || a.title).localeCompare(b.address || b.title));
      const sortedChildren = [...children].sort((a, b) => (a.address || a.title).localeCompare(b.address || b.title));

      neighborhoodMap.set(note.id, { parent, siblings, children: sortedChildren });
    });

    // Homonyms: group notes that share the same leaf segment name
    const homonymsMap = new Map<string, FieldNoteMeta[]>();
    const _leafBuckets = new Map<string, FieldNoteMeta[]>();
    allFieldNotes.forEach(note => {
      const parts = note.addressParts || [note.title];
      const leaf = parts[parts.length - 1].toLowerCase();
      if (!_leafBuckets.has(leaf)) _leafBuckets.set(leaf, []);
      _leafBuckets.get(leaf)!.push(note);
    });
    _leafBuckets.forEach((notes, leaf) => {
      if (notes.length >= 2) {
        notes.sort((a, b) => (a.address || a.title).localeCompare(b.address || b.title));
        homonymsMap.set(leaf, notes);
      }
    });

    // Stats
    const totalConcepts = allFieldNotes.length;
    const totalLinks = allFieldNotes.reduce((sum, n) => sum + (n.references?.length || 0), 0);
    const linkedToSet = new Set<string>();
    allFieldNotes.forEach(n => {
      (n.references || []).forEach(refUid => linkedToSet.add(refUid));
    });
    const isolatedCount = allFieldNotes.filter(n => {
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
      addressToNoteId,
      backlinksMap,
      connectionsMap,
      mentionsMap,
      neighborhoodMap,
      homonymsMap,
      parentIds,
      globalStats: { totalConcepts, totalLinks, isolatedCount, avgRefs, maxDepth, density, mostConnectedHub },
    };

    return _index;
  })().catch(err => {
    _initPromise = null;
    throw err;
  });

  return _initPromise;
}

/** Sync accessor — throws if init hasn't completed */
export function getBrainIndex(): BrainIndex {
  if (!_index) throw new Error('brainIndex not initialized — call initBrainIndex() first');
  return _index;
}

/** Sync cache check — returns null if not cached */
export function getCachedNoteContent(id: string): string | null {
  return _contentCache.get(id) ?? null;
}

/** Fetch + resolve wiki-links for a single note's content. Cached in memory. */
export async function fetchNoteContent(id: string, bustCache = false): Promise<string> {
  if (!bustCache) {
    const cached = _contentCache.get(id);
    if (cached) return cached;
  }

  const index = getBrainIndex();
  const url = bustCache ? `/fieldnotes/${id}.json?t=${Date.now()}` : `/fieldnotes/${id}.json`;
  const resp = await fetch(url);
  if (!resp.ok) return '<p>Content unavailable.</p>';

  const { content } = await resp.json();
  const { html } = resolveWikiLinks(content, index.allFieldNotes, index.noteById);
  _cacheSet(id, html);
  return html;
}

/** Fire-and-forget prefetch — fills cache for future navigations */
export function prefetchNoteContent(ids: string[]): void {
  const index = _index;
  if (!index) return;
  for (const id of ids) {
    if (_contentCache.has(id)) continue;
    fetch(`/fieldnotes/${id}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.content && !_contentCache.has(id)) {
          const { html } = resolveWikiLinks(data.content, index.allFieldNotes, index.noteById);
          _cacheSet(id, html);
        }
      })
      .catch(() => {}); // Silent fail — prefetch is best-effort
  }
}

/**
 * Force-refresh the brain index by re-importing the generated JSON.
 * Clears the content cache for the specified UID (or all if not specified).
 * Dispatches a 'fieldnote-hmr' custom event so views can react.
 */
export async function refreshBrainIndex(uid?: string, action?: string): Promise<BrainIndex> {
  // Invalidate content cache — on delete/stub, clear ALL cached HTML
  // because any note referencing the target has stale rendered links.
  if (action === 'delete' || action === 'stub') {
    _contentCache.clear();
  } else if (uid) {
    _contentCache.delete(uid);
  } else {
    _contentCache.clear();
  }

  // Force re-init by clearing the cached index
  _index = null;
  _initPromise = null;

  // In dev, fetch fresh data from the API (import() cache is stale)
  let freshData: FieldNoteMeta[] | undefined;
  try {
    const resp = await fetch('/api/fieldnotes/index');
    if (resp.ok) {
      const { notes } = await resp.json();
      freshData = notes;
    }
  } catch { /* fall back to import */ }

  const newIndex = await initBrainIndex(freshData);

  // Notify React views
  window.dispatchEvent(new CustomEvent('fieldnote-hmr', { detail: { uid, action } }));

  return newIndex;
}

// HMR listener — auto-refresh when the Vite plugin notifies of changes.
// refreshBrainIndex fetches fresh data via the dev API, bypassing the
// static JSON file entirely.
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.on('fieldnote-update', (data: { uid: string; action: string }) => {
    refreshBrainIndex(data.uid, data.action);
  });
}
