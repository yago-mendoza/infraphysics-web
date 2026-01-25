// Category listing view component (projects, threads, bits2bricks)

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Category } from '../types';
import { formatDate, calculateReadingTime } from '../lib';
import { CATEGORY_CONFIG } from '../config/categories';
import { Highlight } from '../components/ui';
import {
  SearchIcon,
  FilterIcon,
  ListIcon,
  GridIcon,
  ClockIcon,
  ArrowRightIcon
} from '../components/icons';

interface SectionViewProps {
  category: Category;
  colorClass: string;
}

export const SectionView: React.FC<SectionViewProps> = ({ category, colorClass }) => {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = useMemo(() => {
    let sectionPosts = posts.filter(p => p.category === category);

    // Apply search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      sectionPosts = sectionPosts.filter(p =>
        (p.displayTitle || p.title).toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply sorting
    sectionPosts.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'title') return (a.displayTitle || a.title).localeCompare(b.displayTitle || b.title);
      return 0;
    });

    return sectionPosts;
  }, [category, query, sortBy]);

  const getExcerpt = (content: string, query: string) => {
    if (!query) return null;
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return null;
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + 100);
    return "..." + content.substring(start, end) + "...";
  };

  const categoryInfo = CATEGORY_CONFIG[category] || { title: category, description: '', icon: null };

  return (
    <div className="animate-fade-in">
      {/* Header Section - Industrial Style */}
      <header className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-sm bg-gray-100 ${colorClass}`}>
            {categoryInfo.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight lowercase text-black mb-2">
              {categoryInfo.title}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
              {categoryInfo.description}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mt-4 text-xs font-mono text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            {filteredPosts.length} {filteredPosts.length === 1 ? 'entry' : 'entries'}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon />
            {filteredPosts.reduce((acc, p) => acc + calculateReadingTime(p.content), 0)} min total read
          </span>
        </div>
      </header>

      {/* Toolbar - Search & Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Row */}
        <div className="flex gap-3">
          <div className="flex-1 group flex items-center border border-gray-200 px-3 py-2.5 focus-within:border-blue-400 transition-colors bg-white">
            <SearchIcon />
            <input
              type="text"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${category}...`}
              className="w-full bg-transparent border-none ml-2.5 font-mono text-sm focus:outline-none placeholder-gray-400 text-black"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border border-gray-200 flex items-center gap-2 text-xs font-mono transition-all ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 hover:border-gray-400'}`}
          >
            <FilterIcon />
            Filters
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-200 bg-white">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListIcon />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <GridIcon />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border border-gray-200 rounded-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500 uppercase">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                className="text-xs font-mono border border-gray-300 rounded-sm px-2 py-1.5 bg-white focus:outline-none focus:border-blue-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content - List or Grid View */}
      {viewMode === 'list' ? (
        <div className="space-y-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => {
              const contentExcerpt = getExcerpt(post.content, query);

              return (
                <Link
                  key={post.id}
                  to={`/${post.category}/${post.id}`}
                  className="group block transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:gap-6 md:items-start p-4 md:p-0 border border-gray-100 md:border-0 rounded-sm bg-white md:bg-transparent hover:bg-gray-50 md:hover:bg-transparent">

                    {/* Index Number - Industrial Style */}
                    <div className="hidden md:flex flex-shrink-0 w-8 h-8 items-center justify-center text-xs font-mono text-gray-300 border border-gray-200 rounded-sm">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-full md:w-48 md:h-32 flex-shrink-0 bg-gray-100 border border-gray-200 overflow-hidden rounded-sm">
                      <img
                        src={post.thumbnail || 'https://via.placeholder.com/150'}
                        alt=""
                        className="w-full h-auto aspect-video md:aspect-auto md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-grow py-3 md:py-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                        <h2 className="text-lg font-semibold lowercase leading-tight group-hover:text-blue-600 transition-colors">
                          <Highlight text={post.displayTitle || post.title} query={query} />
                        </h2>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                            {formatDate(post.date)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
                        <Highlight text={post.description} query={query} />
                      </p>

                      {/* Meta Row */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                        <span className="flex items-center gap-1">
                          <ClockIcon />
                          {calculateReadingTime(post.content)} min
                        </span>
                        <span className="flex items-center gap-1">
                          <ArrowRightIcon />
                          Read case study
                        </span>
                      </div>

                      {/* Search Excerpt */}
                      {contentExcerpt && (
                        <div className="mt-3 text-xs text-gray-500 font-mono bg-yellow-50 p-2 border-l-2 border-yellow-400">
                          <Highlight text={contentExcerpt} query={query} />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-16 text-center">
              <div className="text-gray-300 text-4xl mb-4">&empty;</div>
              <p className="text-gray-400 font-mono text-sm">No entries found matching "{query}"</p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <Link
                key={post.id}
                to={`/${post.category}/${post.id}`}
                className="group block bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={post.thumbnail || 'https://via.placeholder.com/150'}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{formatDate(post.date)}</span>
                    <span className="text-[10px] font-mono text-gray-400">{calculateReadingTime(post.content)} min</span>
                  </div>
                  <h3 className="font-semibold text-sm lowercase mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.displayTitle || post.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{post.description}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="text-gray-300 text-4xl mb-4">&empty;</div>
              <p className="text-gray-400 font-mono text-sm">No entries found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
