// Second Brain Hub hook — tree building, multi-mode search, filters, sorts, stats

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldNoteMeta } from '../types';
import { initBrainIndex, fetchNoteContent, type BrainIndex, type Connection, type Neighborhood } from '../lib/brainIndex';
import { useGraphRelevance } from './useGraphRelevance';

export type SearchMode = 'name' | 'content' | 'backlinks';
export type SortMode = 'a-z' | 'most-links' | 'fewest-links' | 'depth' | 'shuffle' | 'newest' | 'oldest';

export interface FilterState {
  orphans: boolean;
  leaf: boolean;
  hubThreshold: number;  // 0 = off
  depthMin: number;      // 1-based
  depthMax: number;      // Infinity = no upper bound
  islandId: number | null;  // null = off
  bridgesOnly: boolean;
}

const DEFAULT_FILTER_STATE: FilterState = {
  orphans: false,
  leaf: false,
  hubThreshold: 0,
  depthMin: 1,
  depthMax: Infinity,
  islandId: null,
  bridgesOnly: false,
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

  // Async index state
  const [index, setIndex] = useState<BrainIndex | null>(null);
  const [resolvedHtml, setResolvedHtml] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [contentReadyId, setContentReadyId] = useState<string | undefined>();

  // Load index on mount
  useEffect(() => {
    initBrainIndex().then(setIndex);
  }, []);

  const allFieldNotes = index?.allFieldNotes ?? [];
  const noteById = index?.noteById ?? new Map();
  const backlinksMap = index?.backlinksMap ?? new Map();
  const connectionsMap = index?.connectionsMap ?? new Map();
  const mentionsMap = index?.mentionsMap ?? new Map();
  const neighborhoodMap = index?.neighborhoodMap ?? new Map();
  const homonymsMap = index?.homonymsMap ?? new Map();
  const parentIds = index?.parentIds ?? new Set();
  const globalStats = index?.globalStats ?? { totalConcepts: 0, totalLinks: 0, orphanCount: 0, avgRefs: 0, maxDepth: 0, density: 0, mostConnectedHub: null };

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
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.floor(Math.random() * 0xffffffff));

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

  // Fetch content when activePost changes
  useEffect(() => {
    if (!activePost) { setResolvedHtml(''); setContentReadyId(undefined); return; }
    let cancelled = false;
    setContentLoading(true);
    fetchNoteContent(activePost.id).then(html => {
      if (!cancelled) {
        setResolvedHtml(html);
        setContentLoading(false);
        setContentReadyId(activePost.id);
      }
    });
    return () => { cancelled = true; };
  }, [activePost]);

  // Track which concept we were viewing before searching, so we can return to it
  const savedIdRef = useRef<string | undefined>(undefined);

  const handleSetQuery = useCallback((q: string) => {
    if (q && !query && id) {
      savedIdRef.current = id;
    }
    if (!q && query && savedIdRef.current) {
      const restoreId = savedIdRef.current;
      savedIdRef.current = undefined;
      navigate(`/lab/second-brain/${restoreId}`);
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
    roots.sort((a, b) => a.label.localeCompare(b.label));

    return roots;
  }, [allFieldNotes]);

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
    if (!query) return allFieldNotes;
    const q = query.toLowerCase();

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
  }, [query, searchMode, allFieldNotes, backlinksMap]);

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

  // --- Filters ---
  const filteredNotes = useMemo(() => {
    const { orphans, leaf, hubThreshold, depthMin, depthMax, islandId, bridgesOnly } = filterState;
    const hasAnyFilter = orphans || leaf || hubThreshold > 0 || depthMin > 1 || depthMax < Infinity || islandId != null || bridgesOnly;
    if (!hasAnyFilter) return scopedResults;

    const islands = getIslands();
    const bridgeUids = bridgesOnly && islands ? new Set(islands.cuts.map(c => c.uid)) : null;

    return scopedResults.filter(note => {
      const depth = (note.addressParts || [note.title]).length;
      const outgoing = note.references?.length || 0;
      const incoming = (backlinksMap.get(note.id) || []).length;
      const totalConnections = outgoing + incoming;

      if (orphans && (outgoing > 0 || incoming > 0)) return false;
      if (leaf && parentIds.has(note.id)) return false;
      if (hubThreshold > 0 && totalConnections < hubThreshold) return false;
      if (depth < depthMin) return false;
      if (depthMax < Infinity && depth > depthMax) return false;
      if (islandId != null && islands) {
        if (islands.nodeToComponent[note.id] !== islandId) return false;
      }
      if (bridgeUids && !bridgeUids.has(note.id)) return false;

      return true;
    });
  }, [scopedResults, filterState, backlinksMap, parentIds, getIslands]);

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
    const { orphans, leaf, hubThreshold, depthMin, depthMax, islandId, bridgesOnly } = filterState;
    return orphans || leaf || hubThreshold > 0 || depthMin > 1 || depthMax < Infinity || islandId != null || bridgesOnly;
  }, [filterState]);

  // Signal from sidebar directory: "this click should reset the trail"
  const directoryNavRef = useRef(false);
  const signalDirectoryNav = useCallback(() => {
    directoryNavRef.current = true;
  }, []);

  // Search is active = has query text (used to force list view in the main view)
  const searchActive = query.length > 0;

  // Lightweight clear — just wipe the query without the restore-navigate logic
  const clearSearch = useCallback(() => {
    setQuery('');
    savedIdRef.current = undefined;
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
    filteredTree,

    // Data
    allFieldNotes,
    noteById,
    backlinksMap,
    sortedResults,
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

    // Visited tracking (session-scoped)
    isVisited,

    // Directory nav signal (sidebar → view trail reset)
    directoryNavRef,
    signalDirectoryNav,
  };
};
