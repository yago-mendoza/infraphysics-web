// Serialize/deserialize Second Brain filter state to/from URL search params.
// Used to propagate filters from the list view to the graph view.

import type { FilterState, SearchMode } from '../hooks/useSecondBrainHub';
import type { FieldNoteMeta } from '../types';
import type { BrainIndex } from './brainIndex';

// ─── Serialization ──────────────────────────────────────────────────

export function serializeFilters(
  filters: FilterState,
  query: string,
  searchMode: SearchMode,
  directoryScope: string | null,
): string {
  const p = new URLSearchParams();
  if (query) p.set('q', query);
  if (searchMode !== 'name') p.set('sm', searchMode);
  if (directoryScope) p.set('scope', directoryScope);
  if (filters.isolated) p.set('iso', '1');
  if (filters.leaf) p.set('leaf', '1');
  if (filters.hubThreshold > 0) p.set('hub', String(filters.hubThreshold));
  if (filters.depthMin > 1) p.set('dmin', String(filters.depthMin));
  if (filters.depthMax < Infinity) p.set('dmax', String(filters.depthMax));
  if (filters.islandId != null) p.set('island', String(filters.islandId));
  if (filters.bridgesOnly) p.set('bridges', '1');
  if (filters.dateFilter) p.set('date', filters.dateFilter);
  if (filters.wordCountMin > 0) p.set('wcmin', String(filters.wordCountMin));
  if (filters.wordCountMax < Infinity) p.set('wcmax', String(filters.wordCountMax));
  const s = p.toString();
  return s ? `?${s}` : '';
}

// ─── Deserialization ────────────────────────────────────────────────

export interface ParsedHubFilters {
  query: string;
  searchMode: SearchMode;
  directoryScope: string | null;
  filters: FilterState;
  hasAny: boolean;
}

export function parseHubFilters(params: URLSearchParams): ParsedHubFilters {
  const query = params.get('q') || '';
  const searchMode = (params.get('sm') || 'name') as SearchMode;
  const directoryScope = params.get('scope') || null;
  const filters: FilterState = {
    isolated: params.get('iso') === '1',
    leaf: params.get('leaf') === '1',
    hubThreshold: parseInt(params.get('hub') || '0', 10) || 0,
    depthMin: parseInt(params.get('dmin') || '1', 10) || 1,
    depthMax: params.has('dmax') ? parseInt(params.get('dmax')!, 10) : Infinity,
    islandId: params.has('island') ? parseInt(params.get('island')!, 10) : null,
    bridgesOnly: params.get('bridges') === '1',
    dateFilter: params.get('date') || null,
    wordCountMin: parseInt(params.get('wcmin') || '0', 10) || 0,
    wordCountMax: params.has('wcmax') ? parseInt(params.get('wcmax')!, 10) : Infinity,
  };
  const hasAny = !!(
    query || directoryScope ||
    filters.isolated || filters.leaf || filters.hubThreshold > 0 ||
    filters.depthMin > 1 || filters.depthMax < Infinity ||
    filters.islandId != null || filters.bridgesOnly ||
    filters.dateFilter || filters.wordCountMin > 0 || filters.wordCountMax < Infinity
  );
  return { query, searchMode, directoryScope, filters, hasAny };
}

// ─── Filter application ─────────────────────────────────────────────

/** Apply the hub filter pipeline to a set of notes (replicates useSecondBrainHub logic). */
export function applyHubFilters(
  allNotes: FieldNoteMeta[],
  parsed: ParsedHubFilters,
  index: BrainIndex,
  getIslands?: () => { nodeToComponent: Record<string, number>; cuts: { uid: string }[] } | null,
): Set<string> {
  let notes = allNotes;

  // 1. Search
  const q = parsed.query.toLowerCase();
  if (q) {
    const matchesName = (n: FieldNoteMeta) => {
      const addr = (n.address || n.title).toLowerCase();
      const dt = (n.displayTitle || n.title).toLowerCase();
      return addr.includes(q) || dt.includes(q) || (n.aliases?.some(a => a.toLowerCase().includes(q)) ?? false);
    };
    const matchesContent = (n: FieldNoteMeta) => (n.searchText || '').includes(q) || n.description.toLowerCase().includes(q);
    const matchesBacklinks = (n: FieldNoteMeta) => (index.backlinksMap.get(n.id) || []).some(linker => {
      const addr = (linker.address || linker.title).toLowerCase();
      const dt = (linker.displayTitle || linker.title).toLowerCase();
      return addr.includes(q) || dt.includes(q) || (linker.searchText || '').includes(q) || linker.description.toLowerCase().includes(q);
    });
    if (parsed.searchMode === 'name') {
      notes = notes.filter(matchesName);
    } else if (parsed.searchMode === 'content') {
      notes = notes.filter(matchesContent);
    } else if (parsed.searchMode === 'backlinks') {
      notes = notes.filter(matchesBacklinks);
    } else if (parsed.searchMode === 'all') {
      notes = notes.filter(n => matchesName(n) || matchesContent(n) || matchesBacklinks(n));
    }
  }

  // 2. Directory scope
  if (parsed.directoryScope) {
    const scope = parsed.directoryScope;
    notes = notes.filter(n => {
      const path = (n.addressParts || [n.title]).join('//');
      return path === scope || path.startsWith(scope + '//');
    });
  }

  // 3. Core filters
  const f = parsed.filters;
  const hasCore = f.isolated || f.leaf || f.hubThreshold > 0 ||
    f.depthMin > 1 || f.depthMax < Infinity ||
    f.islandId != null || f.bridgesOnly || f.dateFilter != null;

  if (hasCore) {
    const islands = (f.islandId != null || f.bridgesOnly) && getIslands ? getIslands() : null;
    const bridgeUids = f.bridgesOnly && islands ? new Set(islands.cuts.map(c => c.uid)) : null;

    notes = notes.filter(n => {
      const depth = (n.addressParts || [n.title]).length;
      const outgoing = n.references?.length || 0;
      const incoming = (index.backlinksMap.get(n.id) || []).length;
      const total = outgoing + incoming;

      if (f.isolated && (outgoing > 0 || incoming > 0)) return false;
      if (f.leaf && index.parentIds.has(n.id)) return false;
      if (f.hubThreshold > 0 && total < f.hubThreshold) return false;
      if (depth < f.depthMin) return false;
      if (f.depthMax < Infinity && depth > f.depthMax) return false;
      if (f.islandId != null && islands) {
        if (islands.nodeToComponent[n.id] !== f.islandId) return false;
      }
      if (bridgeUids && !bridgeUids.has(n.id)) return false;
      if (f.dateFilter) {
        const nd = (n.date || '').slice(0, 10);
        if (f.dateFilter.includes('..')) {
          const [start, end] = f.dateFilter.split('..');
          if (nd < start || nd > end) return false;
        } else {
          if (nd !== f.dateFilter) return false;
        }
      }
      return true;
    });
  }

  // 4. Word count
  if (f.wordCountMin > 0 || f.wordCountMax < Infinity) {
    notes = notes.filter(n => {
      const wc = (n.searchText || '').split(/\s+/).filter(Boolean).length;
      return wc >= f.wordCountMin && wc <= f.wordCountMax;
    });
  }

  return new Set(notes.map(n => n.id));
}

// ─── Human-readable filter summary ─────────────────────────────────

export function describeFilters(parsed: ParsedHubFilters): string[] {
  const parts: string[] = [];
  if (parsed.query) parts.push(`search: "${parsed.query}"${parsed.searchMode !== 'name' ? ` (${parsed.searchMode})` : ''}`);
  if (parsed.directoryScope) parts.push(`scope: ${parsed.directoryScope.replace(/\/\//g, ' / ')}`);
  const f = parsed.filters;
  if (f.isolated) parts.push('isolated only');
  if (f.leaf) parts.push('leaf only');
  if (f.hubThreshold > 0) parts.push(`≥${f.hubThreshold} links`);
  if (f.depthMin > 1 || f.depthMax < Infinity) {
    parts.push(`depth ${f.depthMin}${f.depthMax < Infinity ? `–${f.depthMax}` : '+'}`);
  }
  if (f.islandId != null) parts.push(`island #${f.islandId}`);
  if (f.bridgesOnly) parts.push('bridges only');
  if (f.dateFilter) parts.push(`date: ${f.dateFilter}`);
  if (f.wordCountMin > 0 || f.wordCountMax < Infinity) {
    parts.push(`words ${f.wordCountMin}${f.wordCountMax < Infinity ? `–${f.wordCountMax}` : '+'}`);
  }
  return parts;
}
