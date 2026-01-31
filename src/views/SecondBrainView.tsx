// Second Brain / Concept Wiki view component — theme-aware

import React from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '../contexts/SecondBrainHubContext';
import { useSecondBrain } from '../hooks/useSecondBrain';
import { WikiContent } from '../components/WikiContent';
import { SearchIcon } from '../components/icons';

export const SecondBrainView: React.FC = () => {
  const hub = useHub();
  // Always call useSecondBrain (hooks must be unconditional).
  // Used as fallback on mobile where hub sidebar context is absent.
  const brain = useSecondBrain();

  const hasHub = hub !== null;

  const allFieldNotes = hasHub ? hub.allFieldNotes : brain.allFieldNotes;
  const sortedResults = hasHub ? hub.sortedResults : brain.filteredNotes;
  const activePost = hasHub ? hub.activePost : brain.activePost;
  const backlinks = hasHub ? hub.backlinks : brain.backlinks;
  const relatedConcepts = hasHub ? hub.relatedConcepts : brain.relatedConcepts;
  const breadcrumbs = hasHub ? hub.breadcrumbs : brain.breadcrumbs;
  const outgoingRefCount = hasHub ? hub.outgoingRefCount : brain.outgoingRefCount;
  const query = hasHub ? hub.query : brain.query;
  const setQuery = hasHub ? hub.setQuery : brain.setQuery;
  const previousConcept = hasHub ? hub.previousConcept : null;
  const searchActive = hasHub ? hub.searchActive : (brain.query.length > 0);

  // When search is active, force list view even if we're on a detail URL
  const showDetail = activePost && !searchActive;

  return (
    <div className="animate-fade-in">
      {/* Header — only shown when hub sidebar is NOT available (mobile) */}
      {!hasHub && (
        <header className="mb-8 pb-6 border-b border-th-border">
          <h1 className="text-3xl font-bold tracking-tight lowercase text-violet-400 mb-2">
            second brain
          </h1>
          <p className="text-xs text-th-secondary font-light leading-relaxed mt-2 mb-3 max-w-lg">
            Everything I know, linked together. A growing knowledge graph.
          </p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs text-th-tertiary">
              {brain.allFieldNotes.length} concepts &middot; {brain.totalLinks} links &middot; {brain.orphanCount} orphans
            </span>
          </div>

          {/* Search */}
          <div className="w-full">
            <div className="flex items-center border border-th-border px-3 py-2 bg-th-surface-alt focus-within:border-th-border-active transition-colors">
              <span className="text-th-tertiary"><SearchIcon /></span>
              <input
                type="text"
                placeholder="Search concepts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs ml-2 focus:outline-none placeholder-th-tertiary bg-transparent text-th-primary"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-th-tertiary hover:text-th-secondary text-xs ml-2"
                >
                  clear
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      {showDetail ? (
        /* --- Concept Detail View --- */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left: Content */}
          <div className="lg:col-span-3">
            {/* Back to list */}
            <Link
              to="/second-brain"
              className="text-xs text-th-tertiary hover:text-th-secondary transition-colors inline-block"
            >
              &larr; all concepts
            </Link>

            {/* Previous concept link */}
            {previousConcept && previousConcept.id !== activePost!.id && (
              <Link
                to={`/second-brain/${previousConcept.id}`}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors ml-4 inline-block"
              >
                &larr; {previousConcept.displayTitle || previousConcept.title}
              </Link>
            )}

            <div className="mb-4" />

            {/* Breadcrumb */}
            {breadcrumbs.length > 1 && (
              <nav className="text-xs text-th-tertiary mb-3 flex items-center gap-1 flex-wrap">
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-th-muted">&rsaquo;</span>}
                    {crumb.concept ? (
                      <Link
                        to={`/second-brain/${crumb.concept.id}`}
                        className="hover:text-violet-400 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-th-secondary">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Concept Title */}
            <h2 className="text-2xl font-bold lowercase mb-2 text-th-heading">
              {activePost!.displayTitle || activePost!.title}
            </h2>

            {/* Metadata line */}
            <div className="text-xs text-th-tertiary mb-6">
              links to {outgoingRefCount} &middot; linked from {backlinks.length}
            </div>

            {/* Content */}
            <WikiContent
              html={activePost!.content}
              allFieldNotes={allFieldNotes}
              className="text-sm leading-relaxed text-th-secondary font-light content-html"
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
                      to={`/second-brain/${concept.id}`}
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
                      to={`/second-brain/${bl.id}`}
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
          {query && (
            <div className="text-xs text-th-tertiary mb-4">
              {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedResults.length > 0 ? (
              sortedResults.map(note => (
                <Link
                  key={note.id}
                  to={`/second-brain/${note.id}`}
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
