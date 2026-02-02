// Second Brain Hub hook — tree building, multi-mode search, filters, sorts, stats

import { useState, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Post } from '../types';
import {
  allFieldNotes,
  noteById,
  backlinksMap,
  relatedConceptsMap,
  resolvedHtmlMap,
} from '../lib/brainIndex';
import { addressToId } from '../lib/addressToId';

export type SearchMode = 'name' | 'content' | 'backlinks';
export type SortMode = 'a-z' | 'most-links' | 'fewest-links' | 'depth' | 'shuffle';

export interface FilterState {
  orphans: boolean;
  leaf: boolean;
  hubThreshold: number;  // 0 = off
  depthMin: number;      // 1-based
  depthMax: number;      // Infinity = no upper bound
}

const DEFAULT_FILTER_STATE: FilterState = {
  orphans: false,
  leaf: false,
  hubThreshold: 0,
  depthMin: 1,
  depthMax: Infinity,
};

export interface TreeNode {
  label: string;
  path: string;           // full path e.g. "LAPTOP//UI//SCROLLING"
  concept: Post | null;
  children: TreeNode[];
  childCount: number;     // total descendants (concepts only)
}

export interface HubStats {
  totalConcepts: number;
  totalLinks: number;
  orphanCount: number;
  avgRefs: number;
  maxDepth: number;
  density: number;        // links as % of possible connections
  mostConnectedHub: Post | null;
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
  const [query, setQuery] = useState('');

  // Parse ID from pathname since this hook runs outside <Routes>
  const id = useMemo(() => {
    const match = location.pathname.match(/^\/second-brain\/(.+)$/);
    return match ? match[1] : undefined;
  }, [location.pathname]);
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [sortMode, setSortMode] = useState<SortMode>('a-z');
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [directoryScope, setDirectoryScope] = useState<string | null>(null); // tree path
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.floor(Math.random() * 0xffffffff));

  // Active post from URL — O(1) lookup
  const activePost = useMemo(() => {
    if (id) return noteById.get(id) || null;
    return null;
  }, [id]);

  // Track which concept we were viewing before searching, so we can return to it
  const savedIdRef = useRef<string | undefined>(undefined);

  const handleSetQuery = useCallback((q: string) => {
    if (q && !query && id) {
      savedIdRef.current = id;
    }
    if (!q && query && savedIdRef.current) {
      const restoreId = savedIdRef.current;
      savedIdRef.current = undefined;
      navigate(`/second-brain/${restoreId}`);
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
  }, [activePost]);

  // Related concepts — O(1) lookup
  const relatedConcepts = useMemo(() => {
    if (!activePost) return [];
    return relatedConceptsMap.get(activePost.id) || [];
  }, [activePost]);

  // Outgoing ref count
  const outgoingRefCount = useMemo(() => activePost?.references?.length || 0, [activePost]);

  // Pre-resolved HTML — O(1) lookup
  const resolvedHtml = useMemo(() => {
    if (!activePost) return '';
    return resolvedHtmlMap.get(activePost.id) || activePost.content;
  }, [activePost]);

  // --- Stats ---
  const stats: HubStats = useMemo(() => {
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

    const avgRefs = allFieldNotes.length > 0
      ? Math.round((totalLinks / allFieldNotes.length) * 10) / 10
      : 0;

    // Max depth
    const maxDepth = allFieldNotes.reduce((max, n) => {
      const d = (n.addressParts || [n.title]).length;
      return d > max ? d : max;
    }, 0);

    // Density: links / possible connections (n*(n-1))
    const n = allFieldNotes.length;
    const possibleConnections = n * (n - 1);
    const density = possibleConnections > 0
      ? Math.round((totalLinks / possibleConnections) * 1000) / 10 // percentage with 1 decimal
      : 0;

    // Most connected = most total connections (outgoing + incoming)
    let mostConnected: Post | null = null;
    let maxConnections = 0;
    allFieldNotes.forEach(n => {
      const outgoing = n.references?.length || 0;
      const incoming = (backlinksMap.get(n.id) || []).length;
      const total = outgoing + incoming;
      if (total > maxConnections) {
        maxConnections = total;
        mostConnected = n;
      }
    });

    return { totalConcepts: allFieldNotes.length, totalLinks, orphanCount, avgRefs, maxDepth, density, mostConnectedHub: mostConnected };
  }, []);

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
  }, []);

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
        return address.includes(q) || displayTitle.includes(q);
      });
    }

    if (searchMode === 'content') {
      return allFieldNotes.filter(note =>
        note.content.toLowerCase().includes(q) ||
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
  }, [query, searchMode]);

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
    const { orphans, leaf, hubThreshold, depthMin, depthMax } = filterState;
    const hasAnyFilter = orphans || leaf || hubThreshold > 0 || depthMin > 1 || depthMax < Infinity;
    if (!hasAnyFilter) return scopedResults;

    return scopedResults.filter(note => {
      const depth = (note.addressParts || [note.title]).length;
      const outgoing = note.references?.length || 0;
      const incoming = (backlinksMap.get(note.id) || []).length;
      const totalConnections = outgoing + incoming;

      if (orphans && (outgoing > 0 || incoming > 0)) return false;

      if (leaf) {
        // leaf = no children in the tree (no concepts with this address as prefix)
        const hasChild = allFieldNotes.some(other =>
          other.id !== note.id &&
          other.addressParts &&
          note.addressParts &&
          other.addressParts.length > note.addressParts.length &&
          (other.address || '').startsWith(note.address || '\0')
        );
        if (hasChild) return false;
      }

      if (hubThreshold > 0 && totalConnections < hubThreshold) return false;
      if (depth < depthMin) return false;
      if (depthMax < Infinity && depth > depthMax) return false;

      return true;
    });
  }, [scopedResults, filterState]);

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
    }
    return sorted;
  }, [filteredNotes, sortMode, shuffleSeed]);

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
    const { orphans, leaf, hubThreshold, depthMin, depthMax } = filterState;
    return orphans || leaf || hubThreshold > 0 || depthMin > 1 || depthMax < Infinity;
  }, [filterState]);

  // Navigation
  const navigateToNote = useCallback((noteId: string) => {
    navigate(`/second-brain/${noteId}`);
  }, [navigate]);

  // Signal from sidebar directory: "this click should reset the trail"
  const directoryNavRef = useRef(false);
  const signalDirectoryNav = useCallback(() => {
    directoryNavRef.current = true;
  }, []);

  // Search is active = has query text (used to force list view in the main view)
  const searchActive = query.length > 0;

  return {
    // URL state
    id,
    activePost,

    // Search
    query,
    setQuery: handleSetQuery,
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
    sortedResults,
    tree,
    stats,

    // Detail view data
    backlinks,
    relatedConcepts,
    outgoingRefCount,
    resolvedHtml,
    backlinksMap,

    // Navigation
    navigateToNote,

    // Directory nav signal (sidebar → view trail reset)
    directoryNavRef,
    signalDirectoryNav,
  };
};
