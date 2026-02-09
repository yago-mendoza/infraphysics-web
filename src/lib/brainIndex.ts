// Async Second Brain index — loads fieldnotes metadata from generated index,
// fetches individual note content on demand.

import { FieldNoteMeta, ConnectionRef } from '../types';
import { addressToId } from './addressToId';
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
  backlinksMap: Map<string, FieldNoteMeta[]>;
  connectionsMap: Map<string, Connection[]>;
  mentionsMap: Map<string, FieldNoteMeta[]>;
  neighborhoodMap: Map<string, Neighborhood>;
  homonymsMap: Map<string, FieldNoteMeta[]>;
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
    const indexData: FieldNoteMeta[] = await import('../data/fieldnotes-index.generated.json').then(m => m.default as unknown as FieldNoteMeta[]);

    const allFieldNotes = indexData;
    const noteById = new Map(allFieldNotes.map(n => [n.id, n]));

    // Address → note ID mapping (for neighborhood computation)
    const addressToNoteId = new Map<string, string>();
    allFieldNotes.forEach(note => {
      if (note.address) addressToNoteId.set(note.address, note.id);
    });

    // Collect trailing ref addresses per note (for excluding from mentions)
    const trailingRefIds = new Map<string, Set<string>>();
    allFieldNotes.forEach(note => {
      const refs = note.trailingRefs || [];
      const ids = new Set<string>();
      refs.forEach(ref => {
        const addr = typeof ref === 'object' ? ref.address : ref;
        ids.add(addressToId(addr));
      });
      trailingRefIds.set(note.id, ids);
    });

    // Backlinks (all references, including inline body + trailing)
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

    // Bilateral connections from trailing refs
    // For each note A with trailingRef B: A→B connection.
    // If B also has trailingRef A: merge into single bilateral connection.
    const connectionsMap = new Map<string, Connection[]>();

    // First pass: collect all declared trailing ref connections
    const declaredConnections = new Map<string, Map<string, string | null>>(); // noteId → Map<targetId, annotation>
    allFieldNotes.forEach(note => {
      const refs = note.trailingRefs || [];
      if (refs.length === 0) return;
      const map = new Map<string, string | null>();
      refs.forEach(ref => {
        const addr = typeof ref === 'object' ? ref.address : ref;
        const annotation = typeof ref === 'object' ? ref.annotation : null;
        const targetId = addressToId(addr);
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
    // If note A references B in body text (but not as a trailing ref), B gets A as a "mention"
    const mentionsMap = new Map<string, FieldNoteMeta[]>();
    allFieldNotes.forEach(note => {
      const seen = new Set<string>();
      const myTrailingIds = trailingRefIds.get(note.id) || new Set();

      (note.references || []).forEach(ref => {
        const refId = addressToId(ref);
        if (seen.has(refId) || refId === note.id) return;
        seen.add(refId);

        // Skip if this ref is also a trailing ref from note
        if (myTrailingIds.has(refId)) return;

        if (!mentionsMap.has(refId)) mentionsMap.set(refId, []);
        mentionsMap.get(refId)!.push(note);
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

    // Neighborhood: parent, siblings, children for each note
    const neighborhoodMap = new Map<string, Neighborhood>();
    allFieldNotes.forEach(note => {
      const parts = note.addressParts || [note.title];

      // Parent
      let parent: FieldNoteMeta | null = null;
      if (parts.length > 1) {
        const parentAddr = parts.slice(0, -1).join('//');
        const parentId = addressToNoteId.get(parentAddr);
        if (parentId) parent = noteById.get(parentId) || null;
      }

      // Siblings: same parent prefix, same depth
      const siblings: FieldNoteMeta[] = [];
      if (parts.length > 1) {
        const parentPrefix = parts.slice(0, -1).join('//') + '//';
        allFieldNotes.forEach(other => {
          if (other.id === note.id) return;
          const otherParts = other.addressParts || [other.title];
          if (otherParts.length !== parts.length) return;
          const otherAddr = other.address || '';
          if (otherAddr.startsWith(parentPrefix)) {
            // Must be direct child of same parent (no deeper nesting)
            const remainder = otherAddr.slice(parentPrefix.length);
            if (!remainder.includes('//')) {
              siblings.push(other);
            }
          }
        });
      } else {
        // Root-level: siblings are other root-level notes
        allFieldNotes.forEach(other => {
          if (other.id === note.id) return;
          const otherParts = other.addressParts || [other.title];
          if (otherParts.length === 1) siblings.push(other);
        });
      }

      // Children: notes one level deeper with this note's address as prefix
      const children: FieldNoteMeta[] = [];
      const childPrefix = note.address + '//';
      allFieldNotes.forEach(other => {
        if (other.id === note.id) return;
        const otherAddr = other.address || '';
        if (otherAddr.startsWith(childPrefix)) {
          const remainder = otherAddr.slice(childPrefix.length);
          if (!remainder.includes('//')) {
            children.push(other);
          }
        }
      });

      siblings.sort((a, b) => (a.address || a.title).localeCompare(b.address || b.title));
      children.sort((a, b) => (a.address || a.title).localeCompare(b.address || b.title));

      neighborhoodMap.set(note.id, { parent, siblings, children });
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
      connectionsMap,
      mentionsMap,
      neighborhoodMap,
      homonymsMap,
      parentIds,
      globalStats: { totalConcepts, totalLinks, orphanCount, avgRefs, maxDepth, density, mostConnectedHub },
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
