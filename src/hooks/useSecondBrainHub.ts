// Second Brain Hub hook — tree building, multi-mode search, filters, sorts, stats

import { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect, useDeferredValue } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldNoteMeta } from '../types';
import { secondBrainPath } from '../config/categories';
import { initBrainIndex, fetchNoteContent, getCachedNoteContent, prefetchNoteContent, type BrainIndex, type Connection, type Neighborhood } from '../lib/brainIndex';
import { useGraphRelevance } from './useGraphRelevance';

export type SearchMode = 'name' | 'content' | 'backlinks';
export type SortMode = 'a-z' | 'most-links' | 'fewest-links' | 'depth' | 'shuffle' | 'newest' | 'oldest';
export type DirectorySortMode = 'children' | 'alpha' | 'depth';
export type ViewMode = 'simplified' | 'technical';

export interface FilterState {
  isolated: boolean;
  leaf: boolean;
  hubThreshold: number;  // 0 = off
  depthMin: number;      // 1-based
  depthMax: number;      // Infinity = no upper bound
  islandId: number | null;  // null = off
  bridgesOnly: boolean;
  dateFilter: string | null;  // ISO date string e.g. '2026-02-05', null = off
  wordCountMin: number;   // 0 = no lower bound
  wordCountMax: number;   // Infinity = no upper bound
}

const DEFAULT_FILTER_STATE: FilterState = {
  isolated: false,
  leaf: false,
  hubThreshold: 0,
  depthMin: 1,
  depthMax: Infinity,
  islandId: null,
  bridgesOnly: false,
  dateFilter: null,
  wordCountMin: 0,
  wordCountMax: Infinity,
};

export interface TreeNode {
  label: string;
  path: string;           // full path e.g. "LAPTOP//UI//SCROLLING"
  concept: FieldNoteMeta | null;
  children: TreeNode[];
  childCount: number;     // total descendants (concepts only)
}

// Seeded Fisher-Yates shuffle for stable random ordering
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  const random = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const useSecondBrainHub = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getIslands } = useGraphRelevance();
  const [query, setQuery] = useState('');
  const [showNewNote, setShowNewNote] = useState(false);
  // Deferred query — React keeps the input responsive while the filter
  // pipeline uses the trailing value, allowing concurrent interruption.
  const deferredQuery = useDeferredValue(query);

  // Content search gets an extra 150ms debounce on top of useDeferredValue
  // because it scans searchText across all notes (heavier than name matching).
  const [debouncedContentQuery, setDebouncedContentQuery] = useState('');
  useEffect(() => {
    if (searchMode !== 'content') {
      setDebouncedContentQuery(query);
      return;
    }
    const timer = setTimeout(() => setDebouncedContentQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query, searchMode]);

  // Async index state
  const [index, setIndex] = useState<BrainIndex | null>(null);
  const [resolvedHtml, setResolvedHtml] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [contentReadyId, setContentReadyId] = useState<string | undefined>();

  // Load index on mount + reload on HMR/refresh events
  useEffect(() => {
    initBrainIndex().then(setIndex);
    const handler = () => initBrainIndex().then(setIndex);
    window.addEventListener('fieldnote-hmr', handler);
    return () => window.removeEventListener('fieldnote-hmr', handler);
  }, []);

  const allFieldNotes = index?.allFieldNotes ?? [];
  const noteById = index?.noteById ?? new Map();
  const addressToNoteId = index?.addressToNoteId ?? new Map();
  const backlinksMap = index?.backlinksMap ?? new Map();
  const connectionsMap = index?.connectionsMap ?? new Map();
  const mentionsMap = index?.mentionsMap ?? new Map();
  const neighborhoodMap = index?.neighborhoodMap ?? new Map();
  const homonymsMap = index?.homonymsMap ?? new Map();
  const parentIds = index?.parentIds ?? new Set();
  const globalStats = index?.globalStats ?? { totalConcepts: 0, totalLinks: 0, isolatedCount: 0, avgRefs: 0, maxDepth: 0, density: 0, mostConnectedHub: null };

  // Parse ID from pathname since this hook runs outside <Routes>
  const id = useMemo(() => {
    const match = location.pathname.match(/^\/lab\/second-brain\/(.+)$/);
    return match ? match[1] : undefined;
  }, [location.pathname]);
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [sortMode, setSortMode] = useState<SortMode>('a-z');
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [directoryScope, setDirectoryScope] = useState<string | null>(null); // tree path
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [directorySortMode, setDirectorySortMode] = useState<DirectorySortMode>('alpha');
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.floor(Math.random() * 0xffffffff));

  // View mode: simplified vs technical (persisted in localStorage)
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const stored = localStorage.getItem('sb-view-mode');
    if (stored === 'simplified' || stored === 'technical') return stored;
    return 'technical';
  });
  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('sb-view-mode', mode);
  }, []);

  // Session-scoped visited set (survives navigation, cleared on tab close)
  const visitedRef = useRef<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem('sb-visited');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });
  // Lazy-init: resolve the initializer on first access
  if (typeof visitedRef.current === 'function') {
    visitedRef.current = (visitedRef.current as unknown as () => Set<string>)();
  }
  const [, forceVisitedUpdate] = useState(0);
  // forceVisitedUpdate in deps forces a new function reference when the visited set
  // changes, triggering re-renders in consumers despite the ref-based closure.
  const isVisited = useCallback((noteId: string) => visitedRef.current.has(noteId), [forceVisitedUpdate]);

  // Active post from URL — O(1) lookup
  const activePost = useMemo(() => {
    if (id) return noteById.get(id) || null;
    return null;
  }, [id, noteById]);

  // Track visited notes
  useEffect(() => {
    if (activePost && !visitedRef.current.has(activePost.id)) {
      visitedRef.current.add(activePost.id);
      try { sessionStorage.setItem('sb-visited', JSON.stringify([...visitedRef.current])); } catch {}
      forceVisitedUpdate(n => n + 1);
    }
  }, [activePost]);

  // Sync content resolution — runs before paint so cached notes show with zero flash.
  useLayoutEffect(() => {
    if (!activePost) { setResolvedHtml(''); setContentLoading(false); setContentReadyId(undefined); return; }
    const cached = getCachedNoteContent(activePost.id);
    if (cached) {
      setResolvedHtml(cached);
      setContentLoading(false);
      setContentReadyId(activePost.id);
    }
  }, [activePost]);

  // Async content fetch — only fires when cache misses.
  useEffect(() => {
    if (!activePost || getCachedNoteContent(activePost.id)) return;
    let cancelled = false;
    setContentLoading(true);
    setContentReadyId(undefined);
    fetchNoteContent(activePost.id).then(html => {
      if (!cancelled) {
        setResolvedHtml(html);
        setContentLoading(false);
        setContentReadyId(activePost.id);
      }
    });
    return () => { cancelled = true; };
  }, [activePost]);

  // Re-fetch content when HMR fires for the active note (e.g. after editor save)
  useEffect(() => {
    const handler = (e: Event) => {
      const uid = (e as CustomEvent).detail?.uid;
      if (!uid || !activePost || uid !== activePost.id) return;
      fetchNoteContent(activePost.id, true).then(html => {
        setResolvedHtml(html);
        setContentReadyId(activePost.id);
      });
    };
    window.addEventListener('fieldnote-hmr', handler);
    return () => window.removeEventListener('fieldnote-hmr', handler);
  }, [activePost]);

  // Prefetch content for likely navigation targets
  useEffect(() => {
    if (!activePost || !index) return;
    const ids = new Set<string>();

    // Connections
    (connectionsMap.get(activePost.id) || []).forEach(c => ids.add(c.note.id));
    // Mentions (backlinks from body)
    (mentionsMap.get(activePost.id) || []).forEach(m => ids.add(m.id));
    // Neighborhood
    const hood = neighborhoodMap.get(activePost.id);
    if (hood) {
      if (hood.parent) ids.add(hood.parent.id);
      hood.siblings.forEach(s => ids.add(s.id));
      hood.children.forEach(c => ids.add(c.id));
    }
    // Wiki-link targets (from references)
    (activePost.references || []).forEach(uid => ids.add(uid));

    ids.delete(activePost.id);
    prefetchNoteContent([...ids]);
  }, [activePost, index, connectionsMap, mentionsMap, neighborhoodMap]);

  // Track which concept we were viewing before searching, so we can return to it
  const savedIdRef = useRef<string | undefined>(undefined);

  const handleSetQuery = useCallback((q: string) => {
    if (q && !query && id) {
      savedIdRef.current = id;
    }
    if (!q && query && savedIdRef.current) {
      const restoreId = savedIdRef.current;
      savedIdRef.current = undefined;
      navigate(secondBrainPath(restoreId));
    }
    if (!q) {
      savedIdRef.current = undefined;
    }
    setQuery(q);
  }, [query, id, navigate]);

  // Backlinks for active post — O(1) lookup
  const backlinks = useMemo(() => {
    if (!activePost) return [];
    return (backlinksMap.get(activePost.id) || []).filter(n => n.id !== activePost.id);
  }, [activePost, backlinksMap]);

  // Bilateral connections — O(1) lookup
  const connections = useMemo((): Connection[] => {
    if (!activePost) return [];
    return connectionsMap.get(activePost.id) || [];
  }, [activePost, connectionsMap]);

  // Mentions (body-text backlinks, excluding trailing refs) — O(1) lookup
  const mentions = useMemo(() => {
    if (!activePost) return [];
    return (mentionsMap.get(activePost.id) || []).filter(n => n.id !== activePost.id);
  }, [activePost, mentionsMap]);

  // Neighborhood (parent/siblings/children) — O(1) lookup
  const neighborhood = useMemo((): Neighborhood => {
    if (!activePost) return { parent: null, siblings: [], children: [] };
    return neighborhoodMap.get(activePost.id) || { parent: null, siblings: [], children: [] };
  }, [activePost, neighborhoodMap]);

  // Outgoing ref count
  const outgoingRefCount = useMemo(() => activePost?.references?.length || 0, [activePost]);

  // Homonyms: other notes that share the same leaf segment name
  const homonyms = useMemo((): FieldNoteMeta[] => {
    if (!activePost) return [];
    const parts = activePost.addressParts || [activePost.title];
    const leaf = parts[parts.length - 1].toLowerCase();
    return homonymsMap.get(leaf) || [];
  }, [activePost, homonymsMap]);

  // --- Directory Tree ---
  const tree = useMemo(() => {
    const roots: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    allFieldNotes.forEach(note => {
      const parts = note.addressParts || [note.title];
      let currentPath = '';

      parts.forEach((part, depth) => {
        const parentPath = currentPath;
        currentPath = depth === 0 ? part : `${currentPath}//${part}`;

        if (!nodeMap.has(currentPath)) {
          const isLastPart = depth === parts.length - 1;
          const node: TreeNode = {
            label: part,
            path: currentPath,
            concept: isLastPart ? note : null,
            children: [],
            childCount: 0,
          };
          nodeMap.set(currentPath, node);

          if (depth === 0) {
            roots.push(node);
          } else {
            const parent = nodeMap.get(parentPath);
            if (parent) {
              parent.children.push(node);
            }
          }
        } else if (depth === parts.length - 1) {
          const existing = nodeMap.get(currentPath)!;
          if (!existing.concept) existing.concept = note;
        }
      });
    });

    // Count descendants
    const countDescendants = (node: TreeNode): number => {
      let count = node.concept ? 1 : 0;
      node.children.forEach(child => {
        count += countDescendants(child);
      });
      node.childCount = count;
      return count;
    };

    roots.forEach(countDescendants);

    const sortTree = (nodes: TreeNode[], mode: DirectorySortMode): TreeNode[] => {
      const sorted = [...nodes];
      switch (mode) {
        case 'children':
          sorted.sort((a, b) => b.childCount - a.childCount || a.label.localeCompare(b.label));
          break;
        case 'depth': {
          const maxDepth = (n: TreeNode): number =>
            n.children.length === 0 ? 0 : 1 + Math.max(...n.children.map(maxDepth));
          sorted.sort((a, b) => maxDepth(b) - maxDepth(a) || a.label.localeCompare(b.label));
          break;
        }
        default: // 'alpha'
          sorted.sort((a, b) => a.label.localeCompare(b.label));
      }
      sorted.forEach(n => { if (n.children.length > 0) n.children = sortTree(n.children, mode); });
      return sorted;
    };

    return sortTree(roots, directorySortMode);
  }, [allFieldNotes, directorySortMode]);

  // --- Filtered tree (by directoryQuery) ---
  const filteredTree = useMemo(() => {
    if (!directoryQuery) return tree;
    const q = directoryQuery.toLowerCase();

    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce<TreeNode[]>((acc, node) => {
        const labelMatch = node.label.toLowerCase().includes(q);
        const filteredChildren = filterNodes(node.children);

        if (labelMatch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: labelMatch ? node.children : filteredChildren,
          });
        }
        return acc;
      }, []);
    };

    return filterNodes(tree);
  }, [tree, directoryQuery]);

  // --- Multi-mode search ---
  const searchResults = useMemo(() => {
    const effectiveQuery = searchMode === 'content' ? debouncedContentQuery : deferredQuery;
    if (!effectiveQuery) return allFieldNotes;
    const q = effectiveQuery.toLowerCase();

    if (searchMode === 'name') {
      return allFieldNotes.filter(note => {
        const address = (note.address || note.title).toLowerCase();
        const displayTitle = (note.displayTitle || note.title).toLowerCase();
        if (address.includes(q) || displayTitle.includes(q)) return true;
        // Also match against aliases
        if (note.aliases) {
          return note.aliases.some(alias => alias.toLowerCase().includes(q));
        }
        return false;
      });
    }

    if (searchMode === 'content') {
      // Use pre-built searchText for content search (no need to load full HTML)
      return allFieldNotes.filter(note =>
        (note.searchText || '').includes(q) ||
        note.description.toLowerCase().includes(q)
      );
    }

    if (searchMode === 'backlinks') {
      return allFieldNotes.filter(note => {
        const bl = backlinksMap.get(note.id) || [];
        return bl.some(linker => {
          const addr = (linker.address || linker.title).toLowerCase();
          const dt = (linker.displayTitle || linker.title).toLowerCase();
          return addr.includes(q) || dt.includes(q);
        });
      });
    }

    return allFieldNotes;
  }, [deferredQuery, debouncedContentQuery, searchMode, allFieldNotes, backlinksMap]);

  // --- Directory scope filter ---
  const scopedResults = useMemo(() => {
    if (!directoryScope) return searchResults;
    // Include concepts whose address path starts with the scope path
    return searchResults.filter(note => {
      const parts = note.addressParts || [note.title];
      const notePath = parts.join('//');
      return notePath === directoryScope || notePath.startsWith(directoryScope + '//');
    });
  }, [searchResults, directoryScope]);

  // --- Filters (split pipeline: core filters → word count) ---
  // coreFilteredNotes: all filters EXCEPT word count — used by histogram
  const coreFilteredNotes = useMemo(() => {
    const { isolated, leaf, hubThreshold, depthMin, depthMax, islandId, bridgesOnly, dateFilter } = filterState;
    const hasAnyFilter = isolated || leaf || hubThreshold > 0 || depthMin > 1 || depthMax < Infinity || islandId != null || bridgesOnly || dateFilter != null;
    if (!hasAnyFilter) return scopedResults;

    const islands = getIslands();
    const bridgeUids = bridgesOnly && islands ? new Set(islands.cuts.map(c => c.uid)) : null;

    return scopedResults.filter(note => {
      const depth = (note.addressParts || [note.title]).length;
      const outgoing = note.references?.length || 0;
      const incoming = (backlinksMap.get(note.id) || []).length;
      const totalConnections = outgoing + incoming;

      if (isolated && (outgoing > 0 || incoming > 0)) return false;
      if (leaf && parentIds.has(note.id)) return false;
      if (hubThreshold > 0 && totalConnections < hubThreshold) return false;
      if (depth < depthMin) return false;
      if (depthMax < Infinity && depth > depthMax) return false;
      if (islandId != null && islands) {
        if (islands.nodeToComponent[note.id] !== islandId) return false;
      }
      if (bridgeUids && !bridgeUids.has(note.id)) return false;
      if (dateFilter) {
        const nd = (note.date || '').slice(0, 10);
        if (dateFilter.includes('..')) {
          const [start, end] = dateFilter.split('..');
          if (nd < start || nd > end) return false;
        } else {
          if (nd !== dateFilter) return false;
        }
      }

      return true;
    });
  }, [scopedResults, filterState, backlinksMap, parentIds, getIslands]);

  // filteredNotes: apply word count filter on top of core filters
  const filteredNotes = useMemo(() => {
    const { wordCountMin, wordCountMax } = filterState;
    if (wordCountMin <= 0 && wordCountMax >= Infinity) return coreFilteredNotes;
    return coreFilteredNotes.filter(note => {
      const wc = (note.searchText || '').split(/\s+/).filter(Boolean).length;
      return wc >= wordCountMin && wc <= wordCountMax;
    });
  }, [coreFilteredNotes, filterState]);

  // --- Sort ---
  const sortedResults = useMemo(() => {
    if (sortMode === 'shuffle') {
      return seededShuffle(filteredNotes, shuffleSeed);
    }

    const sorted = [...filteredNotes];
    switch (sortMode) {
      case 'a-z':
        sorted.sort((a, b) => (a.address || a.title).localeCompare(b.address || b.title));
        break;
      case 'most-links':
        sorted.sort((a, b) => {
          const aLinks = (a.references?.length || 0) + (backlinksMap.get(a.id) || []).length;
          const bLinks = (b.references?.length || 0) + (backlinksMap.get(b.id) || []).length;
          return bLinks - aLinks;
        });
        break;
      case 'fewest-links':
        sorted.sort((a, b) => {
          const aLinks = (a.references?.length || 0) + (backlinksMap.get(a.id) || []).length;
          const bLinks = (b.references?.length || 0) + (backlinksMap.get(b.id) || []).length;
          return aLinks - bLinks;
        });
        break;
      case 'depth':
        sorted.sort((a, b) => {
          const aDepth = (a.addressParts || [a.title]).length;
          const bDepth = (b.addressParts || [b.title]).length;
          return aDepth - bDepth;
        });
        break;
      case 'newest':
        sorted.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        break;
      case 'oldest':
        sorted.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        break;
    }
    return sorted;
  }, [filteredNotes, sortMode, shuffleSeed, backlinksMap]);

  // --- Reshuffle ---
  const reshuffle = useCallback(() => {
    setShuffleSeed(Math.floor(Math.random() * 0xffffffff));
  }, []);

  // Handle sort mode changes — clicking shuffle when already shuffled re-randomizes
  const handleSetSortMode = useCallback((mode: SortMode) => {
    if (mode === 'shuffle' && sortMode === 'shuffle') {
      reshuffle();
    } else {
      setSortMode(mode);
    }
  }, [sortMode, reshuffle]);

  // --- Reset filters ---
  const resetFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE);
  }, []);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    const { isolated, leaf, hubThreshold, depthMin, depthMax, islandId, bridgesOnly, dateFilter, wordCountMin, wordCountMax } = filterState;
    return isolated || leaf || hubThreshold > 0 || depthMin > 1 || depthMax < Infinity || islandId != null || bridgesOnly || dateFilter != null || wordCountMin > 0 || wordCountMax < Infinity;
  }, [filterState]);

  // Signal from sidebar directory: "this click should reset the trail"
  const directoryNavRef = useRef(false);
  const signalDirectoryNav = useCallback(() => {
    directoryNavRef.current = true;
  }, []);

  // Immediate — drives the detail↔grid view switch with zero delay.
  // The filter pipeline uses deferredQuery separately, so the grid appears
  // instantly and card filtering catches up 1-2 frames later.
  const searchActive = query.length > 0;

  // Lightweight clear — just wipe the query without the restore-navigate logic
  const clearSearch = useCallback(() => {
    setQuery('');
    savedIdRef.current = undefined;
  }, []);

  // Invalidate content readiness — forces opacity: 0 until new content loads.
  // Used before navigation to prevent a 1-frame flash of old content when
  // clearSearch commits before React Router updates the URL.
  const invalidateContent = useCallback(() => {
    setContentReadyId(undefined);
  }, []);

  return {
    // Loading state
    indexLoading: !index,
    contentLoading,

    // URL state
    activePost,

    // Search
    query,
    setQuery: handleSetQuery,
    clearSearch,
    searchActive,
    searchMode,
    setSearchMode,

    // Sort
    sortMode,
    setSortMode: handleSetSortMode,

    // Filters
    filterState,
    setFilterState,
    hasActiveFilters,
    resetFilters,

    // Directory
    directoryScope,
    setDirectoryScope,
    directoryQuery,
    setDirectoryQuery,
    directorySortMode,
    setDirectorySortMode,
    filteredTree,

    // Data
    allFieldNotes,
    noteById,
    addressToNoteId,
    backlinksMap,
    connectionsMap,
    neighborhoodMap,
    sortedResults,
    histogramNotes: coreFilteredNotes,
    stats: globalStats,

    // Detail view data
    backlinks,
    connections,
    mentions,
    neighborhood,
    outgoingRefCount,
    homonyms,
    resolvedHtml,
    contentReadyId,
    invalidateContent,

    // Visited tracking (session-scoped)
    isVisited,

    // Directory nav signal (sidebar → view trail reset)
    directoryNavRef,
    signalDirectoryNav,

    // New note creation
    showNewNote,
    setShowNewNote,

    // View mode
    viewMode,
    setViewMode,
  };
};
