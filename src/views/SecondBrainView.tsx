// Second Brain / Concept Wiki view component — theme-aware

import React, { useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '../contexts/SecondBrainHubContext';
import { useNavigationTrail } from '../hooks/useNavigationTrail';
import { WikiContent } from '../components/WikiContent';
import { NavigationTrail } from '../components/NavigationTrail';
import { addressToId } from '../lib/addressToId';
import { noteById } from '../lib/brainIndex';
import type { SortMode } from '../hooks/useSecondBrainHub';
import type { Post } from '../types';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'a-z', label: 'A\u2013Z' },
  { value: 'most-links', label: 'most links' },
  { value: 'fewest-links', label: 'fewest links' },
  { value: 'depth', label: 'depth' },
  { value: 'shuffle', label: 'shuffle' },
];

const MAX_TRAIL = 25;

const toTrailItem = (post: Post) => ({
  id: post.id,
  label: post.displayTitle || post.title,
});

type TrailAction =
  | { type: 'reset'; post: Post }
  | { type: 'extend'; post: Post };

export const SecondBrainView: React.FC = () => {
  // Hub context is always available — SecondBrainHubProvider wraps all app content.
  // The hub supersedes the old useSecondBrain hook (which was a strict subset).
  const hub = useHub()!;
  const { trail, resetTrail, extendTrail, truncateTrail, clearTrail, initTrail } = useNavigationTrail();

  const {
    sortedResults,
    activePost,
    backlinks,
    relatedConcepts,
    outgoingRefCount,
    resolvedHtml,
    query,
    setQuery,
    searchActive,
    clearSearch,
    directoryScope,
    setDirectoryScope,
    sortMode,
    setSortMode,
    directoryNavRef,
  } = hub;

  // Pending trail action — set synchronously in click handlers, consumed by
  // the useEffect below so the breadcrumb updates in the same render as content.
  const pendingTrailAction = useRef<TrailAction | null>(null);

  // Trail sync: when activePost changes, apply any pending trail action.
  // Falls back to initTrail for page-refresh / direct-URL landing.
  useEffect(() => {
    if (!activePost) return;
    const action = pendingTrailAction.current;
    pendingTrailAction.current = null;

    // Check sidebar directory signal
    const fromDirectory = directoryNavRef.current;
    directoryNavRef.current = false;

    if (action) {
      if (action.type === 'reset') {
        resetTrail(toTrailItem(action.post));
      } else {
        extendTrail(toTrailItem(action.post));
      }
    } else if (fromDirectory) {
      // Sidebar directory click — reset trail (new context)
      resetTrail(toTrailItem(activePost));
    } else {
      // No pending action — page refresh or browser back/forward
      initTrail(toTrailItem(activePost));
    }
  }, [activePost, resetTrail, extendTrail, initTrail, directoryNavRef]);

  // Wiki-link click handler — extend trail with the clicked concept
  const handleWikiLinkClick = useCallback((conceptId: string) => {
    const concept = noteById.get(conceptId);
    if (concept) {
      pendingTrailAction.current = { type: 'extend', post: concept };
    }
  }, []);

  // Grid card click — reset trail to single item & clear search so detail view shows
  const handleGridCardClick = useCallback((post: Post) => {
    pendingTrailAction.current = { type: 'reset', post };
    clearSearch();
  }, [clearSearch]);

  // Related / backlink click — extend trail
  const handleConnectionClick = useCallback((post: Post) => {
    pendingTrailAction.current = { type: 'extend', post };
  }, []);

  // When search is active, force list view even if we're on a detail URL
  const showDetail = activePost && !searchActive;

  const isOverflowing = trail.length >= MAX_TRAIL;

  return (
    <div className="animate-fade-in">
      {/* Main Content */}
      {showDetail ? (
        /* --- Concept Detail View --- */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left: Content */}
          <div className="lg:col-span-3">
            {/* Navigation Trail */}
            <NavigationTrail
              trail={trail}
              onItemClick={(index) => truncateTrail(index)}
              onAllConceptsClick={clearTrail}
              isOverflowing={isOverflowing}
            />

            {/* Concept Title */}
            <h2 className="text-2xl font-bold mb-1 text-th-heading">
              {activePost!.displayTitle || activePost!.title}
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
                              if (target) pendingTrailAction.current = { type: 'reset', post: target };
                            }}>{part}</Link>
                        }
                      </React.Fragment>
                    );
                  })
                : <span>Root node</span>}
            </div>

            {/* Metadata line */}
            <div className="text-xs text-th-tertiary mb-6">
              links to {outgoingRefCount} &middot; linked from {backlinks.length}
            </div>

            {/* Content — pre-resolved HTML, no allFieldNotes needed */}
            <WikiContent
              html={resolvedHtml}
              className="text-sm leading-relaxed text-th-secondary font-light content-html"
              onWikiLinkClick={handleWikiLinkClick}
            />
          </div>

          {/* Right: Connections panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Related section */}
            {relatedConcepts.length > 0 && (
              <div>
                <h3 className="text-[10px] text-th-tertiary uppercase tracking-wider mb-3">
                  Related
                </h3>
                <div className="space-y-2">
                  {relatedConcepts.map(concept => (
                    <Link
                      key={concept.id}
                      to={`/lab/second-brain/${concept.id}`}
                      onClick={() => handleConnectionClick(concept)}
                      className="block p-3 border border-th-border rounded-sm bg-th-surface hover:border-violet-400/30 transition-all group"
                    >
                      <div className="text-xs font-medium text-th-secondary group-hover:text-violet-400 transition-colors">
                        {concept.displayTitle || concept.title}
                      </div>
                      {concept.addressParts && concept.addressParts.length > 1 && (
                        <div className="text-[10px] text-th-tertiary mt-0.5">
                          {concept.address}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Backlinks section */}
            {backlinks.length > 0 && (
              <div>
                <h3 className="text-[10px] text-th-tertiary uppercase tracking-wider mb-3">
                  Linked from
                </h3>
                <div className="space-y-2">
                  {backlinks.map(bl => (
                    <Link
                      key={bl.id}
                      to={`/lab/second-brain/${bl.id}`}
                      onClick={() => handleConnectionClick(bl)}
                      className="block p-3 border border-th-border rounded-sm bg-th-surface hover:border-violet-400/30 transition-all group"
                    >
                      <div className="text-xs font-medium text-th-secondary group-hover:text-violet-400 transition-colors">
                        {bl.displayTitle || bl.title}
                      </div>
                      {bl.addressParts && bl.addressParts.length > 1 && (
                        <div className="text-[10px] text-th-tertiary mt-0.5">
                          {bl.address}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
            <div className="flex items-center gap-1.5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedResults.length > 0 ? (
              sortedResults.map(note => (
                <Link
                  key={note.id}
                  to={`/lab/second-brain/${note.id}`}
                  onClick={() => handleGridCardClick(note)}
                  className="block p-4 border border-th-border rounded-sm bg-th-surface hover:border-th-border-hover transition-all group"
                >
                  <div className="mb-0.5">
                    <span className="text-sm font-medium text-violet-400 group-hover:text-th-primary transition-colors">
                      {note.displayTitle || note.title}
                    </span>
                  </div>
                  {note.addressParts && note.addressParts.length > 1 && (
                    <div className="text-[10px] text-th-tertiary mb-1">
                      {note.address}
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
        </div>
      )}
    </div>
  );
};
