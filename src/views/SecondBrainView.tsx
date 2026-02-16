// Second Brain / Concept Wiki view component — theme-aware

import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHub } from '../contexts/SecondBrainHubContext';
import { useNavigationTrail } from '../hooks/useNavigationTrail';
import { WikiContent } from '../components/WikiContent';
import { NavigationTrail } from '../components/NavigationTrail';
import { NeighborhoodGraph, type Zone } from '../components/NeighborhoodGraph';
import { RelevanceLeaderboard, type FamilyItem } from '../components/RelevanceLeaderboard';
import { BridgeScoreBadge } from '../components/BridgeScoreBadge';

import { DriftDetector } from '../components/DriftDetector';
import { useGraphRelevance } from '../hooks/useGraphRelevance';
import type { SortMode, SearchMode, FilterState } from '../hooks/useSecondBrainHub';
import { SearchIcon } from '../components/icons';
import { noteLabel, type FieldNoteMeta } from '../types';
import type { Connection } from '../lib/brainIndex';
import { ICON_REF_IN, ICON_REF_OUT } from '../lib/icons';
import { resolveWikiLinks } from '../lib/wikilinks';
import { WikiLinkPreview } from '../components/WikiLinkPreview';
import '../styles/article.css';
import '../styles/wiki-content.css';

/** Display-friendly address: `//` → `/` */
const displayAddress = (addr: string) => addr.replace(/\/\//g, ' / ');

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'a-z', label: 'A\u2013Z' },
  { value: 'newest', label: 'newest' },
  { value: 'oldest', label: 'oldest' },
  { value: 'most-links', label: 'most links' },
  { value: 'fewest-links', label: 'fewest links' },
  { value: 'depth', label: 'depth' },
  { value: 'shuffle', label: 'shuffle' },
];

// --- Search Mode Chips ---
const SEARCH_MODES: { value: SearchMode; label: string }[] = [
  { value: 'name', label: 'name' },
  { value: 'content', label: 'content' },
  { value: 'backlinks', label: 'backlinks' },
];

// --- Floating Search Overlay ---
const SearchOverlay: React.FC<{
  open: boolean;
  onClose: (keepQuery: boolean) => void;
  query: string;
  setQuery: (q: string) => void;
  searchMode: SearchMode;
  setSearchMode: (m: SearchMode) => void;
  resultCount: number;
  scopeHint: string | null;
}> = ({ open, onClose, query, setQuery, searchMode, setSearchMode, resultCount, scopeHint }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(false); }
      if (e.key === 'Enter') { e.preventDefault(); onClose(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center" style={{ pointerEvents: 'none' }}>
      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }} onClick={() => onClose(true)} />
      <div
        className="relative mt-16 h-fit w-full max-w-md mx-4 border border-th-hub-border rounded-sm p-3"
        style={{ backgroundColor: 'var(--hub-sidebar-bg)', pointerEvents: 'auto' }}
      >
        <div className="flex items-center border border-th-hub-border px-2 py-1.5 bg-th-surface focus-within:border-th-border-active transition-colors mb-2">
          <span className="text-th-muted mr-1.5 flex-shrink-0"><SearchIcon /></span>
          <input
            ref={inputRef}
            type="text"
            placeholder={scopeHint || 'Search...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-[11px] focus:outline-none placeholder-th-muted bg-transparent text-th-primary"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-th-muted hover:text-th-secondary text-[10px] ml-1 flex-shrink-0"
            >
              &times;
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-th-muted opacity-50">mode</span>
            {SEARCH_MODES.map(mode => (
              <button
                key={mode.value}
                onClick={() => setSearchMode(mode.value)}
                className={`text-[9px] px-1 py-0 transition-colors ${
                  searchMode === mode.value
                    ? 'text-violet-400'
                    : 'text-th-muted hover:text-th-secondary'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <span className="text-[9px] text-th-muted tabular-nums">{resultCount} results</span>
        </div>
      </div>
    </div>
  );
};

export const SecondBrainView: React.FC = () => {
  const hub = useHub();

  const {
    sortedResults,
    activePost,
    backlinks,
    connections,
    mentions,
    neighborhood,
    outgoingRefCount,
    homonyms,
    resolvedHtml,
    contentReadyId,
    indexLoading,
    noteById,
    query,
    setQuery,
    searchActive,
    clearSearch,
    searchMode,
    setSearchMode,
    directoryScope,
    setDirectoryScope,
    filterState,
    setFilterState,
    hasActiveFilters,
    resetFilters,
    sortMode,
    setSortMode,
    directoryNavRef,
    isVisited,
    backlinksMap,
  } = hub;

  const navigate = useNavigate();
  const { getRelevance, getDrift, getPercentile, getNoteTopology } = useGraphRelevance();
  const { trail, scheduleReset, scheduleExtend, truncateTrail, clearTrail, isOverflowing } =
    useNavigationTrail({ activePost, directoryNavRef });

  // --- Floating search overlay ---
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchClose = useCallback((keepQuery: boolean) => {
    setSearchOpen(false);
    if (!keepQuery) setQuery('');
  }, [setQuery]);

  // Type-to-search: any printable key or Backspace opens the overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key.length === 1 || e.key === 'Backspace') {
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  }, [setFilterState]);

  const searchScopeHint = directoryScope
    ? `Search in ${directoryScope.replace(/\/\//g, ' / ')}...`
    : filterState.islandId != null
      ? `Search in island #${filterState.islandId}...`
      : null;

  // Wiki-link click handler — extend trail with the clicked concept
  const handleWikiLinkClick = useCallback((conceptId: string) => {
    const concept = noteById.get(conceptId);
    if (concept) scheduleExtend(concept);
  }, [scheduleExtend]);

  // Grid card click — reset trail to single item.
  // Do NOT clearSearch() here — that would set searchActive=false while activePost
  // still points to the OLD note, causing a 1-frame flash of the previous note.
  // Instead, the effect below (line ~77) clears search after activePost updates.
  const handleGridCardClick = useCallback((post: FieldNoteMeta) => {
    scheduleReset(post);
  }, [scheduleReset]);

  // Clear search AFTER activePost changes (avoids 1-frame flicker of old note)
  const prevActiveIdRef = useRef(activePost?.id);
  useEffect(() => {
    if (activePost && activePost.id !== prevActiveIdRef.current && searchActive) {
      clearSearch();
    }
    prevActiveIdRef.current = activePost?.id;
  }, [activePost, searchActive, clearSearch]);

  // Connection / mention click — extend trail
  const handleConnectionClick = useCallback((post: FieldNoteMeta) => {
    scheduleExtend(post);
  }, [scheduleExtend]);

  // Delegated click handler for wiki-ref links inside dangerouslySetInnerHTML regions
  const handleInlineWikiClick = useCallback((e: React.MouseEvent) => {
    const link = (e.target as HTMLElement).closest('a.wiki-ref-resolved') as HTMLAnchorElement | null;
    if (!link) return;
    e.preventDefault();
    const href = link.getAttribute('href');
    if (!href) return;
    const match = href.match(/^\/lab\/second-brain\/(.+)$/);
    if (match) handleWikiLinkClick(match[1]);
    navigate(href);
  }, [handleWikiLinkClick, navigate]);

  // When search is active, force list view even if we're on a detail URL
  const showDetail = activePost && !searchActive;

  // Content ready = content loaded for the currently displayed note
  const contentReady = activePost?.id === contentReadyId;

  // Mention hover preview
  const [mentionPreview, setMentionPreview] = useState<{
    visible: boolean; title: string; address: string; description: string; x: number; y: number;
  }>({ visible: false, title: '', address: '', description: '', x: 0, y: 0 });
  const mentionHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMentionPreview = useCallback((m: FieldNoteMeta, e: React.MouseEvent) => {
    if (mentionHideTimer.current) { clearTimeout(mentionHideTimer.current); mentionHideTimer.current = null; }
    setMentionPreview({
      visible: true,
      title: noteLabel(m),
      address: m.address || '',
      description: m.description || '',
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const hideMentionPreview = useCallback(() => {
    mentionHideTimer.current = setTimeout(() => {
      setMentionPreview(p => ({ ...p, visible: false }));
      mentionHideTimer.current = null;
    }, 80);
  }, []);

  // "Unvisited only" filter for grid view
  const [unvisitedOnly, setUnvisitedOnly] = useState(false);

  // Right column: zone filtering toggle (graph always visible)
  const [zoneFilter, setZoneFilter] = useState(true);

  // Right-column zone + detail navigation
  const [activeZone, setActiveZone] = useState<Zone>(null);
  const [focusedDetailIdx, setFocusedDetailIdx] = useState(0);
  const [showDetailFocus, setShowDetailFocus] = useState(false);

  // Build family items for the unified list, filtered by active zone when graph is visible
  const familyItems = useMemo<FamilyItem[]>(() => {
    const items: FamilyItem[] = [];
    if (neighborhood.parent) items.push({ note: neighborhood.parent, zone: 'parent' });
    neighborhood.siblings.forEach(s => items.push({ note: s, zone: 'siblings' }));
    neighborhood.children.forEach(c => items.push({ note: c, zone: 'children' }));
    if (zoneFilter && activeZone) {
      return items.filter(i => i.zone === activeZone);
    }
    return items;
  }, [neighborhood, zoneFilter, activeZone]);

  // Set default zone when note changes — persist previous zone if still valid
  useEffect(() => {
    setActiveZone(prev => {
      // Keep current zone if the new note still has it
      if (prev === 'parent' && neighborhood.parent) return 'parent';
      if (prev === 'siblings' && neighborhood.siblings.length > 0) return 'siblings';
      if (prev === 'children' && neighborhood.children.length > 0) return 'children';
      // Fall back to default priority
      if (neighborhood.siblings.length > 0) return 'siblings';
      if (neighborhood.children.length > 0) return 'children';
      if (neighborhood.parent) return 'parent';
      return null;
    });
    setFocusedDetailIdx(0);
  }, [activePost?.id, neighborhood.siblings.length, neighborhood.children.length, neighborhood.parent]);

  // Reset focused index when zone changes
  useEffect(() => {
    setFocusedDetailIdx(0);
  }, [activeZone]);

  // --- Infinite scroll ---
  const BATCH_SIZE = 50;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible count when results change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [sortedResults]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + BATCH_SIZE, sortedResults.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sortedResults.length]);

  // Exclude the currently-open note from search results + optional unvisited filter
  const visibleResults = useMemo(() => {
    let results = searchActive && activePost
      ? sortedResults.slice(0, visibleCount).filter(n => n.id !== activePost.id)
      : sortedResults.slice(0, visibleCount);
    if (unvisitedOnly) results = results.filter(n => !isVisited(n.id));
    return results;
  }, [sortedResults, visibleCount, searchActive, activePost, unvisitedOnly, isVisited]);

  // --- Homonyms: other parents that share the same leaf name ---
  const homonymParents = useMemo(() => {
    if (!activePost || homonyms.length < 2) return [];
    return homonyms
      .filter(h => h.id !== activePost.id)
      .map(h => {
        const parts = h.addressParts || [h.title];
        if (parts.length < 2) return null;
        const parentAddr = parts.slice(0, -1).join('//');
        const parentNote = [...noteById.values()].find(n => n.address === parentAddr) || null;
        return parentNote ? { parent: parentNote, homonym: h } : null;
      })
      .filter((x): x is { parent: FieldNoteMeta; homonym: FieldNoteMeta } => x !== null);
  }, [activePost, homonyms, noteById]);

  const homonymLeaf = useMemo(() => {
    if (!activePost || homonyms.length < 2) return '';
    const parts = activePost.addressParts || [activePost.title];
    return parts[parts.length - 1];
  }, [activePost, homonyms]);

  const [homonymIdx, setHomonymIdx] = useState(0);

  // Reset homonym index when note changes
  useEffect(() => { setHomonymIdx(0); }, [activePost?.id]);

  const cycleHomonym = useCallback((direction: 'prev' | 'next') => {
    if (homonymParents.length === 0) return;
    const next = direction === 'prev'
      ? (homonymIdx - 1 + homonymParents.length) % homonymParents.length
      : (homonymIdx + 1) % homonymParents.length;
    const target = homonymParents[next].homonym;
    setHomonymIdx(next);
    scheduleExtend(target);
    navigate(`/lab/second-brain/${target.id}`);
  }, [homonymParents, homonymIdx, scheduleExtend, navigate]);

  // Available zones in left→right order (matches SVG layout)
  const availableZones = useMemo<Zone[]>(() => {
    const z: Zone[] = [];
    if (neighborhood.parent) z.push('parent');
    if (neighborhood.siblings.length > 0) z.push('siblings');
    if (neighborhood.children.length > 0) z.push('children');
    return z;
  }, [neighborhood.parent, neighborhood.siblings.length, neighborhood.children.length]);

  // --- Detail-view items for keyboard nav ---
  const detailItems = useMemo(() => {
    if (!showDetail || !activeZone) return [];
    if (activeZone === 'parent') {
      const items: FieldNoteMeta[] = [];
      if (neighborhood.parent) items.push(neighborhood.parent);
      homonymParents.forEach(gp => {
        if (!items.some(i => i.id === gp.parent.id)) items.push(gp.parent);
      });
      return items;
    }
    if (activeZone === 'siblings') return neighborhood.siblings;
    if (activeZone === 'children') return neighborhood.children;
    return [];
  }, [showDetail, activeZone, neighborhood, homonymParents]);

  const [focusedIdx, setFocusedIdx] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLAnchorElement>>(new Map());

  // Auto-select first result when results change
  useEffect(() => {
    setFocusedIdx(0);
  }, [sortedResults]);

  // Detect column count from CSS grid
  const getColCount = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || grid.children.length === 0) return 1;
    const firstTop = (grid.children[0] as HTMLElement).offsetTop;
    let cols = 1;
    for (let i = 1; i < grid.children.length; i++) {
      if ((grid.children[i] as HTMLElement).offsetTop === firstTop) cols++;
      else break;
    }
    return cols;
  }, []);

  // Throttle ref for arrow key repeat
  const lastArrowTime = useRef(0);
  const ARROW_THROTTLE = 80; // ms between arrow key repeats

  useEffect(() => {
    if (showDetail) return; // Only active in list view

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

      // Any arrow key or Enter from input → transfer focus to grid
      const isArrow = e.key.startsWith('Arrow');
      if (isInput && (isArrow || e.key === 'Enter')) {
        e.preventDefault();
        (e.target as HTMLElement).blur();
        if (e.key === 'Enter') {
          // Navigate to focused result
          const total = visibleResults.length;
          const idx = focusedIdx >= 0 ? focusedIdx : 0;
          if (idx < total) {
            const note = visibleResults[idx];
            handleGridCardClick(note);
            navigate(`/lab/second-brain/${note.id}`);
          }
          return;
        }
        // Fall through for arrow keys
      } else if (isInput) {
        return;
      }

      const total = visibleResults.length;
      if (total === 0) return;

      // Throttle arrow key repeats
      if (isArrow && e.repeat) {
        const now = Date.now();
        if (now - lastArrowTime.current < ARROW_THROTTLE) return;
        lastArrowTime.current = now;
      }

      const cols = getColCount();
      let next = focusedIdx;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          next = Math.min(focusedIdx + 1, total - 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          next = Math.max(focusedIdx - 1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIdx + cols < total) next = focusedIdx + cols;
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIdx - cols >= 0) next = focusedIdx - cols;
          break;
        case 'Enter':
          if (focusedIdx >= 0 && focusedIdx < total) {
            e.preventDefault();
            const note = visibleResults[focusedIdx];
            handleGridCardClick(note);
            navigate(`/lab/second-brain/${note.id}`);
          }
          return;
        case 'Escape':
          if (searchActive && activePost) {
            // Return to the note the user was reading before typing to search
            clearSearch();
          }
          setFocusedIdx(-1);
          return;
        default:
          return;
      }

      setFocusedIdx(next);
      // Scroll into view
      const card = cardRefs.current.get(next);
      if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDetail, focusedIdx, visibleResults, getColCount, handleGridCardClick, navigate, searchActive, activePost, clearSearch]);

  // --- Detail-view arrow-key navigation (right column boxes) ---
  useEffect(() => {
    if (!showDetail) return;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      // Zone cycling — ArrowLeft/Right cycles between parent/siblings/children
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && availableZones.length > 1) {
        e.preventDefault();
        const curIdx = activeZone ? availableZones.indexOf(activeZone) : -1;
        const nextIdx = e.key === 'ArrowLeft'
          ? (curIdx <= 0 ? availableZones.length - 1 : curIdx - 1)
          : (curIdx >= availableZones.length - 1 ? 0 : curIdx + 1);
        setActiveZone(availableZones[nextIdx]);
        return;
      }

      const total = detailItems.length;
      if (total === 0) return;

      const isArrow = e.key === 'ArrowUp' || e.key === 'ArrowDown';
      if (isArrow && e.repeat) {
        const now = Date.now();
        if (now - lastArrowTime.current < ARROW_THROTTLE) return;
        lastArrowTime.current = now;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setShowDetailFocus(true);
          setFocusedDetailIdx(prev => Math.min(prev + 1, total - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setShowDetailFocus(true);
          setFocusedDetailIdx(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (focusedDetailIdx >= 0 && focusedDetailIdx < total) {
            e.preventDefault();
            const item = detailItems[focusedDetailIdx];
            handleConnectionClick(item);
            navigate(`/lab/second-brain/${item.id}`);
          }
          break;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDetail, detailItems, focusedDetailIdx, handleConnectionClick, navigate, availableZones, activeZone]);

  // Hide detail focus highlight on mouse click (re-shown on next arrow key)
  useEffect(() => {
    if (!showDetail) return;
    const hide = () => setShowDetailFocus(false);
    window.addEventListener('mousedown', hide);
    return () => window.removeEventListener('mousedown', hide);
  }, [showDetail]);

  if (indexLoading) {
    return <div className="animate-fade-in py-12 text-center text-xs text-th-tertiary">Loading index...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Floating Search Overlay */}
      <SearchOverlay
        open={searchOpen}
        onClose={handleSearchClose}
        query={query}
        setQuery={setQuery}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        resultCount={sortedResults.length}
        scopeHint={searchScopeHint}
      />

      {/* Main Content */}
      {showDetail ? (
        /* --- Concept Detail View --- */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-12">
          {/* Left: Content + Connections + Mentions — fades during note transitions */}
          <div
            className="lg:col-span-3"
            style={{
              opacity: contentReady ? 1 : 0,
              transition: contentReady ? 'opacity 200ms ease-in' : 'none',
            }}
          >
            {/* Navigation Trail */}
            <NavigationTrail
              trail={trail}
              onItemClick={(index) => truncateTrail(index)}
              onAllConceptsClick={clearTrail}
              isOverflowing={isOverflowing}
            />

            {/* Concept Title */}
            <h2 className="text-2xl font-bold mb-1 text-th-heading">
              {noteLabel(activePost!)}
              <BridgeScoreBadge percentile={getPercentile(activePost!.id)} />
              {(() => {
                const topo = getNoteTopology(activePost!.id);
                return (
                  <>
                    {topo.componentId != null && !topo.isOrphan && (
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('topology-focus', { detail: { componentId: topo.componentId } }));
                        }}
                        className="ml-2 inline-flex items-center text-[10px] font-normal px-1.5 py-0.5 border border-violet-400/30 text-violet-400/80 hover:text-violet-400 hover:border-violet-400/50 transition-colors rounded-sm align-middle"
                        title={`Component #${topo.componentId} (${topo.componentSize} notes)`}
                      >
                        island #{topo.componentId}
                      </button>
                    )}
                    {topo.isBridge && (
                      <span className="ml-1.5 inline-flex items-center text-[10px] font-normal px-1.5 py-0.5 border border-amber-400/30 text-amber-400/80 rounded-sm align-middle">
                        ⚡ bridge {Math.round((topo.bridgeCriticality ?? 0) * 100)}%
                      </span>
                    )}
                    {topo.isOrphan && (
                      <span className="ml-1.5 text-[10px] font-normal text-th-muted align-middle">(orphan)</span>
                    )}
                  </>
                );
              })()}
            </h2>
            <div className="text-[11px] text-th-tertiary mb-2">
              {activePost!.addressParts && activePost!.addressParts.length > 1
                ? activePost!.addressParts.map((part, i) => {
                    const pathUpTo = activePost!.addressParts!.slice(0, i + 1).join('//');
                    const ancestor = [...noteById.values()].find(n => n.address === pathUpTo);
                    const isLast = i === activePost!.addressParts!.length - 1;
                    return (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="mx-0.5 text-th-muted">/</span>}
                        {isLast
                          ? <span>{part}</span>
                          : ancestor
                            ? <Link to={`/lab/second-brain/${ancestor.id}`} className="hover:text-violet-400 transition-colors" onClick={() => {
                                scheduleReset(ancestor);
                              }}>{part}</Link>
                            : <span>{part}</span>
                        }
                      </React.Fragment>
                    );
                  })
                : <span>Root node</span>}
            </div>

            {/* ─── Mentioned in (below address) ─── */}
            {mentions.length > 0 && (
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-sans">
                {mentions.map((m) => (
                  <Link
                    key={m.id}
                    to={`/lab/second-brain/${m.id}`}
                    onClick={() => handleConnectionClick(m)}
                    onMouseEnter={(e) => showMentionPreview(m, e)}
                    onMouseLeave={hideMentionPreview}
                    className={`text-sm font-medium transition-colors no-underline ${isVisited(m.id) ? 'text-blue-400 hover:text-blue-300' : 'text-violet-400 hover:text-violet-300'}`}
                  >
                    {noteLabel(m)}<svg className="inline w-[0.85em] h-[0.85em] ml-0.5 opacity-50" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ verticalAlign: '-0.1em' }}><path fillRule="evenodd" clipRule="evenodd" d={ICON_REF_IN}/></svg>
                  </Link>
                ))}
                <WikiLinkPreview {...mentionPreview} variant="blue" />
              </div>
            )}

            {/* Metadata line */}
            <div className="text-xs text-th-tertiary mb-2 flex items-center gap-2">
              <span>links {'\u2193'} {outgoingRefCount}</span>
              <span>&middot;</span>
              <span>mentioned {'\u2191'} {mentions.length}</span>
            </div>

            {/* Content — fetched on demand, styled via article.css base + wiki-content.css overrides.
                Always render WikiContent (no "Loading..." conditional) — the column opacity
                hides everything during transitions, avoiding layout shifts from height changes. */}
            <div className="article-page-wrapper article-wiki">
              <WikiContent
                html={resolvedHtml}
                className="article-content"
                onWikiLinkClick={handleWikiLinkClick}
                isVisited={isVisited}
              />
            </div>

            {/* ─── Interactions + Drift Detector ─── */}
            {(() => {
              const driftEntries = getDrift(activePost!.id);
              const hasDrift = driftEntries.length > 0;
              if (connections.length === 0 && !hasDrift) return null;
              return (
                <div>
                  <hr className="border-t border-th-border my-6" />
                  {connections.length > 0 && (
                    <div>
                      <h3 className="text-[11px] text-th-tertiary uppercase tracking-wider mb-3">
                        Interactions
                      </h3>
                      <div className="space-y-3">
                        {connections.map((conn: Connection) => {
                          const v = isVisited(conn.note.id);
                          return (
                            <div key={conn.note.id}>
                              <Link
                                to={`/lab/second-brain/${conn.note.id}`}
                                onClick={() => handleConnectionClick(conn.note)}
                                className={`inline transition-colors no-underline border-b border-solid cursor-pointer ${v ? 'text-blue-400/70 hover:text-blue-400 border-blue-400/40 hover:border-blue-400' : 'text-violet-400/70 hover:text-violet-400 border-violet-400/40 hover:border-violet-400'}`}
                              >
                                <span className="text-sm">{noteLabel(conn.note)}</span><svg className="inline w-[0.85em] h-[0.85em] ml-0.5 opacity-80" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ verticalAlign: '-0.1em' }}><path fillRule="evenodd" clipRule="evenodd" d={ICON_REF_OUT}/></svg>
                              </Link>
                              {conn.note.address && (
                                <span className="text-xs text-th-muted ml-2">{displayAddress(conn.note.address)}</span>
                              )}
                              {(conn.annotation || conn.reverseAnnotation) && (
                                <div className="text-xs text-th-tertiary mt-0.5 italic font-sans" onClick={handleInlineWikiClick}>
                                  <span dangerouslySetInnerHTML={{ __html: resolveWikiLinks(conn.annotation || conn.reverseAnnotation || '', [], noteById).html }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {connections.length > 0 && hasDrift && (
                    <hr className="border-t border-th-border my-6" />
                  )}
                  <DriftDetector
                    entries={driftEntries}
                    noteById={noteById}
                    onNoteClick={handleConnectionClick}
                    isVisited={isVisited}
                  />
                </div>
              );
            })()}
          </div>

          {/* Right: Context panel (parent/siblings/children) — sticky in viewport.
              On mobile (single-column), fade in with content to prevent layout-shift blink
              where the graph briefly flashes at top before body pushes it down. */}
          <div
            className="lg:col-span-2 lg:sticky lg:top-12 lg:self-start"
            style={{
              opacity: contentReady ? 1 : 0,
              transition: contentReady ? 'opacity 200ms ease-in' : 'none',
            }}
          >
            <hr className="lg:hidden border-t border-th-border my-6" />
            {/* Graph — always visible */}
            <NeighborhoodGraph
              neighborhood={neighborhood}
              currentNote={activePost!}
              onNoteClick={handleConnectionClick}
              isVisited={isVisited}
              activeZone={zoneFilter ? activeZone : null}
              onActiveZoneChange={(zone) => { setZoneFilter(true); setActiveZone(zone); }}
              homonymParents={homonymParents}
              onHomonymNavigate={(homonym) => {
                scheduleExtend(homonym);
                navigate(`/lab/second-brain/${homonym.id}`);
              }}
            />
            {/* Zone filter toggle — below the graph */}
            <label className="flex items-center gap-1.5 mt-3 mb-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={zoneFilter}
                onChange={() => setZoneFilter(v => !v)}
                className="accent-violet-400 w-3 h-3"
              />
              <span className="text-[10px] text-th-muted">filter by zone</span>
            </label>
            {/* Family list — filtered by zone when toggle on, all when off */}
            <div className="mt-2">
            <RelevanceLeaderboard
              mode="family"
              familyItems={familyItems}
              noteById={noteById}
              onNoteClick={handleConnectionClick}
              isVisited={isVisited}
              getPercentile={getPercentile}
            />
            </div>
          </div>
          {/* Back to top — mobile only (stacked layout) */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="lg:hidden w-full mt-8 mb-4 py-2 text-[10px] uppercase tracking-wider text-th-muted hover:text-violet-400 border border-th-hub-border hover:border-violet-400/30 transition-colors"
          >
            Back to top
          </button>
        </div>
      ) : (
        /* --- Concept List View --- */
        <div>
          {/* Sort control + scope/search/filter indicators */}
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {directoryScope && (
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-400/10 text-violet-400 border border-violet-400/20 flex items-center gap-1">
                  scope: {directoryScope.replace(/\/\//g, ' / ')}
                  <button onClick={() => setDirectoryScope(null)} className="hover:text-white">&times;</button>
                </span>
              )}
              {filterState.islandId != null && (
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-400/10 text-violet-400 border border-violet-400/20 flex items-center gap-1">
                  island #{filterState.islandId}
                  <button onClick={() => updateFilter('islandId', null)} className="hover:text-white">&times;</button>
                </span>
              )}
              {!searchOpen && query && (
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-400/10 text-violet-400 border border-violet-400/20 flex items-center gap-1 cursor-pointer" onClick={() => setSearchOpen(true)}>
                  &ldquo;{query}&rdquo;
                  <button onClick={(e) => { e.stopPropagation(); setQuery(''); }} className="hover:text-white">&times;</button>
                </span>
              )}
              {filterState.orphans && (
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-400/20 text-violet-400 border border-violet-400/30 flex items-center gap-1">
                  orphans
                  <button onClick={() => updateFilter('orphans', false)} className="hover:text-white">&times;</button>
                </span>
              )}
              {filterState.leaf && (
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-400/20 text-violet-400 border border-violet-400/30 flex items-center gap-1">
                  leaf
                  <button onClick={() => updateFilter('leaf', false)} className="hover:text-white">&times;</button>
                </span>
              )}
              {filterState.bridgesOnly && (
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center gap-1">
                  bridges
                  <button onClick={() => updateFilter('bridgesOnly', false)} className="hover:text-white">&times;</button>
                </span>
              )}
              {filterState.depthMin > 1 && (
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-400/20 text-violet-400 border border-violet-400/30 flex items-center gap-1">
                  depth &ge; {filterState.depthMin}
                  <button onClick={() => updateFilter('depthMin', 1)} className="hover:text-white">&times;</button>
                </span>
              )}
              {filterState.depthMax !== Infinity && (
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-400/20 text-violet-400 border border-violet-400/30 flex items-center gap-1">
                  depth &le; {filterState.depthMax}
                  <button onClick={() => updateFilter('depthMax', Infinity)} className="hover:text-white">&times;</button>
                </span>
              )}
              {filterState.hubThreshold > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 bg-violet-400/20 text-violet-400 border border-violet-400/30 flex items-center gap-1">
                  hubs &ge; {filterState.hubThreshold}
                  <button onClick={() => updateFilter('hubThreshold', 0)} className="hover:text-white">&times;</button>
                </span>
              )}
              {!query && !hasActiveFilters && !directoryScope && (
                <span className="text-[9px] text-th-muted">{sortedResults.length} concepts</span>
              )}
              {(query || hasActiveFilters) && (
                <span className="text-[9px] text-th-muted tabular-nums">{sortedResults.length} results</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {sortedResults.some(n => isVisited(n.id)) && (
                <button
                  onClick={() => setUnvisitedOnly(v => !v)}
                  className={`text-[10px] px-2 py-0.5 rounded-sm transition-colors ${
                    unvisitedOnly ? 'text-blue-400' : 'text-th-muted hover:text-blue-400'
                  }`}
                >
                  unvisited
                </button>
              )}
              <span className="text-th-hub-border">|</span>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortMode(opt.value)}
                  className={`text-[10px] px-2 py-0.5 rounded-sm transition-colors ${
                    sortMode === opt.value
                      ? 'text-violet-400 bg-violet-400/10'
                      : 'text-th-muted hover:text-th-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleResults.length > 0 ? (
              visibleResults.map((note, idx) => {
                const outgoing = note.references?.length || 0;
                const incoming = (backlinksMap.get(note.id) || []).length;
                const topo = getNoteTopology(note.id);
                return (
                <Link
                  key={note.id}
                  ref={(el) => { if (el) cardRefs.current.set(idx, el); else cardRefs.current.delete(idx); }}
                  to={`/lab/second-brain/${note.id}`}
                  onClick={() => handleGridCardClick(note)}
                  className={`card-link group p-4 flex flex-col${focusedIdx === idx ? ' border-violet-400/50 bg-violet-400/5' : ''}`}
                >
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className={`text-sm font-medium transition-colors group-hover:text-th-primary ${isVisited(note.id) ? 'text-blue-400/70' : 'text-violet-400'}`}>
                      {noteLabel(note)}
                    </span>
                  </div>
                  {note.addressParts && note.addressParts.length > 1 && (
                    <div className="text-[10px] text-th-tertiary mb-1">
                      {displayAddress(note.address!)}
                    </div>
                  )}
                  {note.description && (
                    <div className="text-xs text-th-secondary line-clamp-2 font-sans">
                      {note.description}
                    </div>
                  )}
                  {/* Card metadata — pinned to bottom */}
                  <div className="flex items-center gap-2 mt-auto pt-2.5 text-[10px] text-th-tertiary tabular-nums">
                    <span>{outgoing}↗ {incoming}↙</span>
                    {topo.componentId != null && !topo.isOrphan && (
                      <span className="text-violet-400/60">#{topo.componentId}</span>
                    )}
                    {topo.isBridge && (
                      <span className="text-amber-400/80">⚡</span>
                    )}
                    {topo.isOrphan && (
                      <span>orphan</span>
                    )}
                    {note.date && (
                      <span className="ml-auto opacity-60">{note.date}</span>
                    )}
                  </div>
                </Link>
                );
              })
            ) : (
              <div className="text-xs text-th-tertiary py-8 text-center col-span-3">
                No concepts match your search
              </div>
            )}
          </div>
          {/* Infinite scroll sentinel */}
          {visibleCount < sortedResults.length && (
            <div ref={sentinelRef} className="h-1" />
          )}
        </div>
      )}
    </div>
  );
};
