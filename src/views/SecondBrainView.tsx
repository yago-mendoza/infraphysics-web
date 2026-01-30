// Second Brain / Concept Wiki view component

import React from 'react';
import { Link } from 'react-router-dom';
import { useSecondBrain } from '../hooks/useSecondBrain';
import { WikiContent } from '../components/WikiContent';
import {
  SearchIcon,
  DiamondIcon,
} from '../components/icons';

export const SecondBrainView: React.FC = () => {
  const {
    query,
    setQuery,
    allFieldNotes,
    totalLinks,
    orphanCount,
    filteredNotes,
    activePost,
    backlinks,
    relatedConcepts,
    breadcrumbs,
    outgoingRefCount,
  } = useSecondBrain();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gray-100 rounded-sm">
            <DiamondIcon />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight lowercase text-black">
            second brain
          </h1>
        </div>
        <p className="text-xs text-gray-500 font-light leading-relaxed mt-2 mb-3 max-w-lg">
          A living network of interconnected concepts. Nodes link to each other
          through <span className="text-gray-400">[[references]]</span>, forming
          a knowledge graph that grows organically.
        </p>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs text-gray-400">
            {allFieldNotes.length} concepts &middot; {totalLinks} links &middot; {orphanCount} orphans
          </span>
        </div>

        {/* Search */}
        <div className="w-full">
          <div className="flex items-center border border-gray-200 px-3 py-2 bg-white focus-within:border-blue-400 transition-colors">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search concepts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs ml-2 focus:outline-none placeholder-gray-400 bg-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600 text-xs ml-2"
              >
                clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activePost ? (
        /* --- Concept Detail View --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Content */}
          <div className="lg:col-span-8">
            {/* Back to list */}
            <Link
              to="/second-brain"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-4 inline-block"
            >
              &larr; all concepts
            </Link>

            {/* Breadcrumb */}
            {breadcrumbs.length > 1 && (
              <nav className="text-xs text-gray-400 mb-3 flex items-center gap-1 flex-wrap">
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-gray-300">&rsaquo;</span>}
                    {crumb.concept ? (
                      <Link
                        to={`/second-brain/${crumb.concept.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-500">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Concept Title */}
            <h2 className="text-2xl font-bold lowercase mb-2">
              {activePost.displayTitle || activePost.title}
            </h2>

            {/* Metadata line */}
            <div className="text-xs text-gray-400 mb-6">
              links to {outgoingRefCount} &middot; linked from {backlinks.length}
            </div>

            {/* Content */}
            <WikiContent
              html={activePost.content}
              allFieldNotes={allFieldNotes}
              className="text-sm leading-relaxed text-gray-700 font-light content-html"
            />
          </div>

          {/* Right: Connections panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Related section */}
            {relatedConcepts.length > 0 && (
              <div>
                <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">
                  Related
                </h3>
                <div className="space-y-2">
                  {relatedConcepts.map(concept => (
                    <Link
                      key={concept.id}
                      to={`/second-brain/${concept.id}`}
                      className="block p-3 bg-white border border-gray-200 rounded-sm hover:border-blue-400 transition-all group"
                    >
                      <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        {concept.displayTitle || concept.title}
                      </div>
                      {concept.addressParts && concept.addressParts.length > 1 && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
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
                <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">
                  Linked from
                </h3>
                <div className="space-y-2">
                  {backlinks.map(bl => (
                    <Link
                      key={bl.id}
                      to={`/second-brain/${bl.id}`}
                      className="block p-3 bg-white border border-gray-200 rounded-sm hover:border-blue-400 transition-all group"
                    >
                      <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        {bl.displayTitle || bl.title}
                      </div>
                      {bl.addressParts && bl.addressParts.length > 1 && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
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
            <div className="text-xs text-gray-400 mb-4">
              {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </div>
          )}

          <div className="space-y-2">
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <Link
                  key={note.id}
                  to={`/second-brain/${note.id}`}
                  className="block p-4 bg-white border border-gray-200 rounded-sm hover:border-gray-400 transition-all group"
                >
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                      {note.displayTitle || note.title}
                    </span>
                    {note.addressParts && note.addressParts.length > 1 && (
                      <span className="text-[10px] text-gray-400">
                        {note.address}
                      </span>
                    )}
                  </div>
                  {note.description && (
                    <div className="text-xs text-gray-500 truncate font-sans">
                      {note.description}
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-8 text-center">
                No concepts match your search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
