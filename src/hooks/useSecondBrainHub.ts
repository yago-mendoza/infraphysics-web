// Second Brain Hub hook — tree building, multi-mode search, filters, sorts, stats

import { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { posts } from '../data/data';
import { Post } from '../types';

export type SearchMode = 'name' | 'content' | 'backlinks';
export type SortMode = 'a-z' | 'most-links' | 'fewest-links' | 'depth';
export type FilterMode = 'orphans' | 'hubs' | 'leaf' | 'depth1' | 'depth2' | 'depth3+';

export interface TreeNode {
  label: string;
  concept: Post | null;
  children: TreeNode[];
  childCount: number; // total descendants (concepts only)
}

export interface HubStats {
  totalConcepts: number;
  totalLinks: number;
  orphanCount: number;
  avgRefs: number;
  mostConnectedHub: Post | null;
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
  const [activeFilters, setActiveFilters] = useState<Set<FilterMode>>(new Set());
  const [collapsed, setCollapsed] = useState(false);

  // All field notes
  const allFieldNotes = useMemo(() => posts.filter(p => p.category === 'fieldnotes'), []);

  // Active post from URL
  const activePost = useMemo(() => {
    if (id) return allFieldNotes.find(p => p.id === id) || null;
    return null;
  }, [id, allFieldNotes]);

  // Backlinks map: conceptId -> list of concepts that reference it
  const backlinksMap = useMemo(() => {
    const map = new Map<string, Post[]>();
    allFieldNotes.forEach(note => {
      (note.references || []).forEach(ref => {
        const refId = ref.toLowerCase().replace(/\/\//g, '--').replace(/\s+/g, '-');
        if (!map.has(refId)) map.set(refId, []);
        map.get(refId)!.push(note);
      });
    });
    return map;
  }, [allFieldNotes]);

  // Backlinks for active post
  const backlinks = useMemo(() => {
    if (!activePost) return [];
    return (backlinksMap.get(activePost.id) || []).filter(n => n.id !== activePost.id);
  }, [activePost, backlinksMap]);

  // Related concepts from trailingRefs
  const relatedConcepts = useMemo(() => {
    if (!activePost || !activePost.trailingRefs) return [];
    return activePost.trailingRefs
      .map(ref => {
        const refId = ref.toLowerCase().replace(/\/\//g, '--').replace(/\s+/g, '-');
        return allFieldNotes.find(n => n.id === refId);
      })
      .filter((n): n is Post => n !== undefined);
  }, [activePost, allFieldNotes]);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!activePost || !activePost.addressParts) return [];
    return activePost.addressParts.map(part => {
      const partId = part.toLowerCase().replace(/\s+/g, '-');
      const concept = allFieldNotes.find(n => n.id === partId);
      return { label: part, concept: concept || null };
    });
  }, [activePost, allFieldNotes]);

  // Outgoing ref count
  const outgoingRefCount = useMemo(() => activePost?.references?.length || 0, [activePost]);

  // --- Stats ---
  const stats: HubStats = useMemo(() => {
    const totalLinks = allFieldNotes.reduce((sum, n) => sum + (n.references?.length || 0), 0);

    const linkedToSet = new Set<string>();
    allFieldNotes.forEach(n => {
      (n.references || []).forEach(ref => {
        linkedToSet.add(ref.toLowerCase().replace(/\/\//g, '--').replace(/\s+/g, '-'));
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

    return { totalConcepts: allFieldNotes.length, totalLinks, orphanCount, avgRefs, mostConnectedHub: mostConnected };
  }, [allFieldNotes, backlinksMap]);

  // --- Directory Tree ---
  const tree = useMemo(() => {
    const roots: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // First pass: create nodes for all concepts
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
          // Node exists as intermediate, now assign concept
          const existing = nodeMap.get(currentPath)!;
          if (!existing.concept) existing.concept = note;
        }
      });
    });

    // Second pass: count descendants
    const countDescendants = (node: TreeNode): number => {
      let count = node.concept ? 1 : 0;
      node.children.forEach(child => {
        count += countDescendants(child);
      });
      node.childCount = count;
      return count;
    };

    roots.forEach(countDescendants);

    // Sort roots alphabetically
    roots.sort((a, b) => a.label.localeCompare(b.label));

    return roots;
  }, [allFieldNotes]);

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

    // backlinks mode — find concepts that are referenced by the query match
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

  // --- Filters ---
  const filteredNotes = useMemo(() => {
    if (activeFilters.size === 0) return searchResults;

    return searchResults.filter(note => {
      const depth = (note.addressParts || [note.title]).length;
      const outgoing = note.references?.length || 0;
      const incoming = (backlinksMap.get(note.id) || []).length;
      const totalConnections = outgoing + incoming;

      for (const f of activeFilters) {
        switch (f) {
          case 'orphans':
            if (outgoing > 0 || incoming > 0) return false;
            break;
          case 'hubs':
            if (totalConnections < 5) return false;
            break;
          case 'leaf':
            // leaf = no children in the tree (no concepts with this address as prefix)
            if (allFieldNotes.some(other =>
              other.id !== note.id &&
              other.addressParts &&
              note.addressParts &&
              other.addressParts.length > note.addressParts.length &&
              (other.address || '').startsWith(note.address || '\0')
            )) return false;
            break;
          case 'depth1':
            if (depth !== 1) return false;
            break;
          case 'depth2':
            if (depth !== 2) return false;
            break;
          case 'depth3+':
            if (depth < 3) return false;
            break;
        }
      }
      return true;
    });
  }, [searchResults, activeFilters, backlinksMap, allFieldNotes]);

  // --- Sort ---
  const sortedResults = useMemo(() => {
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
  }, [filteredNotes, sortMode, backlinksMap]);

  // --- Filter toggling ---
  const toggleFilter = useCallback((filter: FilterMode) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  }, []);

  // Navigation
  const navigateToNote = useCallback((noteId: string) => {
    navigate(`/second-brain/${noteId}`);
  }, [navigate]);

  return {
    // URL state
    id,
    activePost,

    // Search
    query,
    setQuery,
    searchMode,
    setSearchMode,

    // Sort
    sortMode,
    setSortMode,

    // Filters
    activeFilters,
    toggleFilter,

    // Data
    allFieldNotes,
    sortedResults,
    tree,
    stats,

    // Detail view data
    backlinks,
    relatedConcepts,
    breadcrumbs,
    outgoingRefCount,
    backlinksMap,

    // Sidebar collapse
    collapsed,
    setCollapsed,

    // Navigation
    navigateToNote,
  };
};
