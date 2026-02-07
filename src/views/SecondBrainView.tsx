// Second Brain / Concept Wiki view component — theme-aware

import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHub } from '../contexts/SecondBrainHubContext';
import { useNavigationTrail } from '../hooks/useNavigationTrail';
import { WikiContent } from '../components/WikiContent';
import { NavigationTrail } from '../components/NavigationTrail';
import { NeighborhoodGraph, type Zone } from '../components/NeighborhoodGraph';
import { addressToId } from '../lib/addressToId';
import type { SortMode } from '../hooks/useSecondBrainHub';
import { noteLabel, type FieldNoteMeta } from '../types';
import type { Connection } from '../lib/brainIndex';
import { ICON_REF_IN, ICON_REF_OUT } from '../lib/icons';
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
    directoryScope,
    setDirectoryScope,
    sortMode,
    setSortMode,
    directoryNavRef,
    isVisited,
  } = hub;

  const { trail, scheduleReset, scheduleExtend, truncateTrail, clearTrail, isOverflowing } =
    useNavigationTrail({ activePost, directoryNavRef });

  // Wiki-link click handler — extend trail with the clicked concept
  const handleWikiLinkClick = useCallback((conceptId: string) => {
    const concept = noteById.get(conceptId);
    if (concept) scheduleExtend(concept);
  }, [scheduleExtend]);

  // Grid card click — reset trail to single item, clear search synchronously
  // (clearing in handler prevents 1-frame flash where searchActive is still true)
  const handleGridCardClick = useCallback((post: FieldNoteMeta) => {
    if (searchActive) clearSearch();
    scheduleReset(post);
  }, [scheduleReset, searchActive, clearSearch]);

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

  // Right-column zone + detail navigation
  const [activeZone, setActiveZone] = useState<Zone>(null);
  const [focusedDetailIdx, setFocusedDetailIdx] = useState(0);
  const [showDetailFocus, setShowDetailFocus] = useState(false);

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

  // --- Grid arrow-key navigation ---
  const navigate = useNavigate();

  // --- Homonyms: other parents that share the same leaf name ---
  const homonymParents = useMemo(() => {
    if (!activePost || homonyms.length < 2) return [];
    return homonyms
      .filter(h => h.id !== activePost.id)
      .map(h => {
        const parts = h.addressParts || [h.title];
        if (parts.length < 2) return null;
        const parentAddr = parts.slice(0, -1).join('//');
        const parentId = addressToId(parentAddr);
        const parentNote = noteById.get(parentId);
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
      {/* Main Content */}
      {showDetail ? (
        /* --- Concept Detail View --- */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
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
            </h2>
            <div className="text-[11px] text-th-tertiary mb-2">
              {activePost!.addressParts && activePost!.addressParts.length > 1
                ? activePost!.addressParts.map((part, i) => {
                    const pathUpTo = activePost!.addressParts!.slice(0, i + 1).join('//');
                    const id = addressToId(pathUpTo);
                    const isLast = i === activePost!.addressParts!.length - 1;
                    return (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="mx-0.5 text-th-muted">/</span>}
                        {isLast
                          ? <span>{part}</span>
                          : <Link to={`/lab/second-brain/${id}`} className="hover:text-violet-400 transition-colors" onClick={() => {
                              const target = noteById.get(id);
                              if (target) scheduleReset(target);
                            }}>{part}</Link>
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
                    className={`text-sm font-medium transition-colors no-underline ${isVisited(m.id) ? 'text-blue-400/70 hover:text-blue-400' : 'text-violet-400/70 hover:text-violet-400'}`}
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

            {/* ─── Interactions (bilateral, annotated) ─── */}
            {connections.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[11px] text-th-tertiary uppercase tracking-wider mb-4">
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
                          <div className="text-xs text-th-tertiary mt-0.5 italic font-sans">
                            {conn.annotation || conn.reverseAnnotation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Context panel (parent/siblings/children) — sticky in viewport */}
          <div className="lg:col-span-2 lg:sticky lg:top-12 lg:self-start">
            <NeighborhoodGraph
              neighborhood={neighborhood}
              currentNote={activePost!}
              onNoteClick={handleConnectionClick}
              isVisited={isVisited}
              activeZone={activeZone}
              onActiveZoneChange={setActiveZone}
              focusedDetailIdx={showDetailFocus ? focusedDetailIdx : -1}
              homonymParents={homonymParents}
              homonymLeaf={homonymLeaf}
              onHomonymNavigate={(homonym) => {
                scheduleExtend(homonym);
                navigate(`/lab/second-brain/${homonym.id}`);
              }}
            />
          </div>
        </div>
      ) : (
        /* --- Concept List View --- */
        <div>
          {/* Sort control + scope/search indicators */}
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              {directoryScope && (
                <div className="flex items-center gap-1 text-xs text-th-tertiary">
                  <span className="text-th-muted">scope:</span>
                  <span className="text-violet-400">{directoryScope.replace(/\/\//g, ' / ')}</span>
                  <button
                    onClick={() => setDirectoryScope(null)}
                    className="text-th-muted hover:text-th-secondary ml-0.5"
                  >
                    &times;
                  </button>
                </div>
              )}
              {query && (
                <div className="text-xs text-th-tertiary">
                  {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                </div>
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
              visibleResults.map((note, idx) => (
                <Link
                  key={note.id}
                  ref={(el) => { if (el) cardRefs.current.set(idx, el); else cardRefs.current.delete(idx); }}
                  to={`/lab/second-brain/${note.id}`}
                  onClick={() => handleGridCardClick(note)}
                  className={`card-link group p-4${focusedIdx === idx ? ' border-violet-400/50 bg-violet-400/5' : ''}`}
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
                </Link>
              ))
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
