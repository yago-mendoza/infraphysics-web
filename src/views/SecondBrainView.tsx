// Second Brain / Knowledge base view component

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSecondBrain } from '../hooks/useSecondBrain';
import { formatDate, formatDateCompact } from '../lib';
import { NoteGraph } from '../components/NoteGraph';
import {
  SearchIcon,
  DiamondIcon,
  LinkIcon,
  ClockIcon,
  ArrowRightIcon,
  GraphIcon,
  BacklinkIcon
} from '../components/icons';

export const SecondBrainView: React.FC = () => {
  const {
    id,
    query,
    setQuery,
    viewMode,
    setViewMode,
    allFieldNotes,
    filteredNotes,
    activePost,
    relatedNotes,
    backlinks,
    activeKeywords,
    allKeywords,
    dateRange,
    minTime,
    maxTime,
    handleStartChange,
    handleEndChange,
    connectionGraph,
    getConnectionsWithMeta,
    navigateToNote,
    extractKeywords,
  } = useSecondBrain();

  // Get shared concepts for display
  const activeConnections = useMemo(() => {
    if (!activePost) return [];
    return getConnectionsWithMeta(activePost.id);
  }, [activePost, getConnectionsWithMeta]);

  // Process content to render wiki-links as clickable
  const processedContent = useMemo(() => {
    if (!activePost) return '';
    let content = activePost.content;

    // Replace [[wiki-links]] with clickable links
    content = content.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
      const targetId = linkText.toLowerCase().replace(/\s+/g, '-');
      const targetNote = allFieldNotes.find(
        n => n.id === targetId ||
        (n.displayTitle || n.title).toLowerCase() === linkText.toLowerCase()
      );

      if (targetNote) {
        return `<a href="/second-brain/${targetNote.id}" class="wiki-link text-blue-600 hover:text-blue-800 bg-blue-50 px-1 rounded font-medium">${linkText}</a>`;
      }
      // Return as unresolved link (gray styling)
      return `<span class="wiki-link-unresolved text-gray-400 bg-gray-50 px-1 rounded">${linkText}</span>`;
    });

    return content;
  }, [activePost, allFieldNotes]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header - Knowledge System */}
      <header className="mb-6 pb-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-sm">
                <DiamondIcon />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight lowercase text-black">
                second brain
              </h1>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              A personal knowledge base. Notes interconnect through shared concepts and [[wiki-links]], forming a web of ideas.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-200 bg-white">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${viewMode === 'timeline' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors flex items-center gap-1.5 ${viewMode === 'graph' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <GraphIcon />
              Graph
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-xs font-mono text-gray-400 mb-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            {allFieldNotes.length} notes
          </span>
          <span className="flex items-center gap-1.5">
            <LinkIcon />
            {allKeywords.length} concepts
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon />
            {filteredNotes.length} in range
          </span>
          {activePost && activeConnections.length > 0 && (
            <span className="flex items-center gap-1.5">
              <GraphIcon />
              {activeConnections.length} connections
            </span>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end justify-between">
          {/* Search */}
          <div className="w-full md:w-1/3">
            <div className="flex items-center border border-gray-200 px-3 py-2 bg-white focus-within:border-blue-400 transition-colors">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs font-mono ml-2 focus:outline-none placeholder-gray-400 bg-transparent"
              />
            </div>
          </div>

          {/* Date Range Slider */}
          <div className="w-full md:w-1/3 flex flex-col gap-2">
            <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase">
              <span>{formatDateCompact(new Date(dateRange[0]).toISOString())}</span>
              <span>{formatDateCompact(new Date(dateRange[1]).toISOString())}</span>
            </div>
            <div className="relative h-4 flex items-center">
              <div className="absolute w-full h-0.5 bg-gray-200 rounded-full"></div>
              <input
                type="range"
                min={minTime} max={maxTime}
                value={dateRange[0]}
                onChange={handleStartChange}
                className="dual-range-input absolute w-full h-full opacity-0 cursor-pointer"
                style={{ zIndex: dateRange[0] > (minTime + maxTime) / 2 ? 20 : 10 }}
              />
              <input
                type="range"
                min={minTime} max={maxTime}
                value={dateRange[1]}
                onChange={handleEndChange}
                className="dual-range-input absolute w-full h-full opacity-0 cursor-pointer"
                style={{ zIndex: dateRange[1] <= (minTime + maxTime) / 2 ? 20 : 10 }}
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 rounded-full pointer-events-none border-2 border-white shadow-sm"
                style={{ left: `${((dateRange[0] - minTime) / (maxTime - minTime || 1)) * 100}%`, transform: 'translateX(-50%)' }}
              ></div>
              <div
                className="absolute w-3 h-3 bg-gray-900 rounded-full pointer-events-none border-2 border-white shadow-sm"
                style={{ left: `${((dateRange[1] - minTime) / (maxTime - minTime || 1)) * 100}%`, transform: 'translateX(-50%)' }}
              ></div>
              <div
                className="absolute h-0.5 bg-blue-500"
                style={{
                  left: `${((dateRange[0] - minTime) / (maxTime - minTime || 1)) * 100}%`,
                  right: `${100 - ((dateRange[1] - minTime) / (maxTime - minTime || 1)) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Concept Tags - Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {allKeywords.slice(0, 10).map(([keyword, count]) => (
            <button
              key={keyword}
              onClick={() => setQuery(query === keyword ? '' : keyword)}
              className={`px-2 py-1 text-[10px] font-mono border rounded-sm transition-all ${
                query === keyword
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {keyword}
              <span className="ml-1 text-[8px] opacity-60">({count})</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-gray-50 border border-gray-200 rounded-sm">
        {viewMode === 'graph' ? (
          /* Graph View */
          <div className="h-full grid grid-cols-1 lg:grid-cols-12">
            {/* Graph Visualization */}
            <div className="h-full lg:col-span-8 xl:col-span-9 p-2">
              <NoteGraph
                notes={allFieldNotes}
                activeNoteId={id}
                connections={connectionGraph}
                onNodeClick={navigateToNote}
                extractKeywords={extractKeywords}
              />
            </div>

            {/* Selected Note Panel */}
            <div className="h-full overflow-y-auto lg:col-span-4 xl:col-span-3 bg-white border-l border-gray-200 p-4">
              {activePost ? (
                <div>
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
                    Selected Note
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 lowercase">
                    {activePost.displayTitle || activePost.title}
                  </h3>
                  <div className="text-[10px] font-mono text-gray-400 mb-3">
                    {formatDate(activePost.date)}
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {activeKeywords.map(kw => (
                      <span
                        key={kw}
                        className="px-1.5 py-0.5 text-[9px] font-mono bg-blue-50 text-blue-600 rounded"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* Connections */}
                  {activeConnections.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <LinkIcon />
                        Connections ({activeConnections.length})
                      </div>
                      <div className="space-y-2">
                        {activeConnections.slice(0, 5).map(conn => {
                          const target = allFieldNotes.find(n => n.id === conn.targetId);
                          if (!target) return null;
                          return (
                            <Link
                              key={conn.targetId}
                              to={`/second-brain/${conn.targetId}`}
                              className="block p-2 bg-gray-50 rounded hover:bg-blue-50 transition-colors group"
                            >
                              <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600 truncate">
                                {target.displayTitle || target.title}
                              </div>
                              <div className="text-[9px] font-mono text-gray-400 mt-1">
                                {conn.sharedConcepts.slice(0, 3).join(', ')}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Backlinks */}
                  {backlinks.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <BacklinkIcon />
                        Backlinks ({backlinks.length})
                      </div>
                      <div className="space-y-1">
                        {backlinks.map(bl => (
                          <Link
                            key={bl.id}
                            to={`/second-brain/${bl.id}`}
                            className="block p-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors truncate"
                          >
                            {bl.displayTitle || bl.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Full Note Link */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setViewMode('timeline')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-mono flex items-center gap-1"
                    >
                      <ArrowRightIcon />
                      View full note
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs font-mono">
                  Click a node to select
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Timeline View */
          <div className="h-full grid grid-cols-1 md:grid-cols-12">
            {/* LEFT COLUMN: Note List */}
            <div className="h-full overflow-y-auto p-4 md:col-span-4 lg:col-span-3 md:border-r border-gray-200">
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-3 px-2">
                {filteredNotes.length} notes
              </div>
              <ul className="space-y-1">
                {filteredNotes.length > 0 ? filteredNotes.map(p => {
                  const isSelected = id === p.id;
                  const noteConns = connectionGraph.get(p.id) || [];

                  return (
                    <li key={p.id} className="w-full">
                      <Link
                        to={`/second-brain/${p.id}`}
                        className={`
                          block py-2.5 px-3 text-xs font-mono transition-all rounded-sm
                          ${isSelected ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}
                        `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`${isSelected ? 'text-gray-400' : 'text-gray-400'} text-[10px]`}>
                            {formatDateCompact(p.date)}
                          </span>
                          <div className="flex items-center gap-1">
                            {noteConns.length > 0 && (
                              <span className={`text-[9px] ${isSelected ? 'text-gray-400' : 'text-gray-300'}`}>
                                {noteConns.length} links
                              </span>
                            )}
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-gray-300'}`}></span>
                          </div>
                        </div>
                        <span className="block truncate font-medium">
                          {p.displayTitle || p.title}
                        </span>
                      </Link>
                    </li>
                  );
                }) : (
                  <li className="text-xs font-mono text-gray-300 py-4 italic px-2">No notes match your filters</li>
                )}
              </ul>
            </div>

            {/* CENTER COLUMN: Note Content */}
            <div className="h-full overflow-y-auto p-6 md:col-span-5 lg:col-span-6 bg-white border-r border-gray-200">
              {activePost ? (
                <div>
                  {/* Note Header */}
                  <header className="mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        {formatDate(activePost.date)}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        ID: {activePost.id}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold lowercase mb-2">
                      {activePost.displayTitle || activePost.title}
                    </h2>
                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {activeKeywords.map(kw => (
                        <span
                          key={kw}
                          onClick={() => setQuery(kw)}
                          className="px-2 py-0.5 text-[10px] font-mono bg-blue-50 text-blue-600 rounded-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </header>

                  {/* Note Content with wiki-links */}
                  <div
                    className="text-sm leading-relaxed text-gray-700 font-light content-html"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                  <DiamondIcon />
                  <p className="text-xs font-mono mt-4">Select a note to view</p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Connections & Related */}
            <div className="hidden lg:block h-full overflow-y-auto p-4 md:col-span-3 bg-gray-50">
              {/* Connections with shared concepts */}
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <LinkIcon />
                Connections
              </div>

              {activePost && relatedNotes.length > 0 ? (
                <div className="space-y-3">
                  {relatedNotes.map(related => {
                    const conn = activeConnections.find(c => c.targetId === related.id);
                    return (
                      <Link
                        key={related.id}
                        to={`/second-brain/${related.id}`}
                        className="block p-3 bg-white border border-gray-200 rounded-sm hover:border-blue-400 transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <LinkIcon />
                          <span className="text-[10px] font-mono text-gray-400">
                            {formatDateCompact(related.date)}
                          </span>
                          {conn && (
                            <span className="text-[9px] font-mono text-blue-400 ml-auto">
                              +{conn.strength}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors block truncate">
                          {related.displayTitle || related.title}
                        </span>
                        {/* Shared concepts */}
                        {conn && conn.sharedConcepts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {conn.sharedConcepts.slice(0, 3).map(concept => (
                              <span key={concept} className="text-[9px] font-mono text-gray-400 bg-gray-100 px-1 rounded">
                                {concept}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-gray-400 font-mono italic">
                  No direct connections found
                </div>
              )}

              {/* Backlinks Section */}
              {backlinks.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <BacklinkIcon />
                    Backlinks ({backlinks.length})
                  </div>
                  <div className="space-y-2">
                    {backlinks.map(bl => (
                      <Link
                        key={bl.id}
                        to={`/second-brain/${bl.id}`}
                        className="block p-2 text-xs font-medium text-gray-600 hover:text-violet-600 bg-white border border-gray-200 rounded-sm hover:border-violet-400 transition-all"
                      >
                        {bl.displayTitle || bl.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Nav */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-3">
                  Quick Nav
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setViewMode('graph')}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors w-full"
                  >
                    <GraphIcon />
                    View Graph
                  </button>
                  <Link
                    to="/projects"
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    <ArrowRightIcon />
                    Projects
                  </Link>
                  <Link
                    to="/threads"
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-amber-600 transition-colors"
                  >
                    <ArrowRightIcon />
                    Threads
                  </Link>
                  <Link
                    to="/bits2bricks"
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <ArrowRightIcon />
                    Bits2Bricks
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
