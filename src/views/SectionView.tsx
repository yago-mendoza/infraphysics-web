// Category listing view component (projects, threads, bits2bricks) — dark theme

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Category } from '../types';
import { formatDate, calculateReadingTime } from '../lib';
import { CATEGORY_CONFIG } from '../config/categories';
import { Highlight } from '../components/ui';
import { StatusBadge } from '../components/ui';
import {
  SearchIcon,
  FilterIcon,
  ListIcon,
  GridIcon,
  ClockIcon,
  ArrowRightIcon,
  GitHubIcon,
  ExternalLinkIcon
} from '../components/icons';

interface SectionViewProps {
  category: Category;
  colorClass: string;
}

const CATEGORY_CTA: Record<string, string> = {
  projects: 'View project',
  threads: 'Read thread',
  bits2bricks: 'Explore build',
};

export const SectionView: React.FC<SectionViewProps> = ({ category, colorClass }) => {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = useMemo(() => {
    let sectionPosts = posts.filter(p => p.category === category);

    if (query) {
      const lowerQuery = query.toLowerCase();
      sectionPosts = sectionPosts.filter(p =>
        (p.displayTitle || p.title).toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery)
      );
    }

    // Pinned posts first
    const pinned = sectionPosts.filter(p => p.featured);
    const rest = sectionPosts.filter(p => !p.featured);

    rest.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'title') return (a.displayTitle || a.title).localeCompare(b.displayTitle || b.title);
      return 0;
    });

    return [...pinned, ...rest];
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
  const ctaLabel = CATEGORY_CTA[category] || 'Read more';
  const isProjects = category === 'projects';
  const isThreads = category === 'threads';
  const isBits2bricks = category === 'bits2bricks';

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-gray-500 flex items-center gap-2">
        <Link to="/home" className="hover:text-gray-300 transition-colors">home</Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-600">lab</span>
        <span className="text-gray-600">/</span>
        <span className="text-gray-400">{category}</span>
      </nav>

      {/* Header — clean, no icon box */}
      <header className="mb-8 pb-6 border-b border-white/10">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h1 className={`text-3xl font-bold tracking-tight lowercase ${colorClass}`}>
            {categoryInfo.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{filteredPosts.length} {filteredPosts.length === 1 ? 'entry' : 'entries'}</span>
            <span className="text-gray-600">&middot;</span>
            <span>{filteredPosts.reduce((acc, p) => acc + calculateReadingTime(p.content), 0)} min total</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl font-sans">
          {categoryInfo.description}
        </p>
      </header>

      {/* Toolbar — Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 group flex items-center border border-white/10 px-3 py-2.5 focus-within:border-white/25 transition-colors bg-white/[0.03]">
            <span className="text-gray-500"><SearchIcon /></span>
            <input
              type="text"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${category}...`}
              className="w-full bg-transparent border-none ml-2.5 text-sm focus:outline-none placeholder-gray-500 text-gray-200"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border flex items-center gap-2 text-xs transition-all ${showFilters ? 'bg-white/10 text-white border-white/20' : 'border-white/10 text-gray-400 hover:border-white/20 bg-white/[0.03]'}`}
          >
            <FilterIcon />
            Filters
          </button>

          <div className="flex border border-white/10 bg-white/[0.03]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <ListIcon />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <GridIcon />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                className="text-xs border border-white/10 rounded-sm px-2 py-1.5 bg-white/[0.05] text-gray-300 focus:outline-none focus:border-white/25"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content — List or Grid View */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => {
              const contentExcerpt = getExcerpt(post.content, query);

              return (
                <div key={post.id} className="group relative">
                  <Link
                    to={`/${post.category}/${post.id}`}
                    className="block p-4 border border-white/8 rounded-sm bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:gap-5">
                      {/* Thumbnail */}
                      {post.thumbnail && (
                        <div className="w-full md:w-44 md:h-28 flex-shrink-0 bg-white/[0.03] border border-white/8 overflow-hidden rounded-sm mb-3 md:mb-0">
                          <img
                            src={post.thumbnail}
                            alt=""
                            className="w-full h-auto aspect-video md:aspect-auto md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Pinned badge */}
                            {post.featured && index === 0 && (
                              <span className="text-[10px] text-gray-500 border border-white/10 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                                pinned
                              </span>
                            )}
                            <h2 className="text-base font-semibold lowercase leading-tight text-gray-100 group-hover:text-blue-400 transition-colors truncate">
                              <Highlight text={post.displayTitle || post.title} query={query} />
                            </h2>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            <span>{formatDate(post.date)}</span>
                            <span className="text-gray-600">&middot;</span>
                            <span className="flex items-center gap-1">
                              <ClockIcon />
                              {calculateReadingTime(post.content)} min
                            </span>
                          </div>
                        </div>

                        <p className={`text-gray-400 text-sm leading-relaxed font-sans mb-3 ${isThreads ? 'line-clamp-3' : 'line-clamp-2'}`}>
                          <Highlight text={post.description} query={query} />
                        </p>

                        {/* Category-specific metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {/* Projects: status + tech stack + github */}
                          {isProjects && (
                            <>
                              {post.status && <StatusBadge status={post.status} />}
                              {post.technologies && post.technologies.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-600">stack:</span>
                                  {post.technologies.slice(0, 3).map(tech => (
                                    <span key={tech} className="px-1.5 py-0.5 text-[10px] bg-white/[0.06] text-gray-400 rounded-sm">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </>
                          )}

                          {/* Bits2Bricks: status + tech stack */}
                          {isBits2bricks && (
                            <>
                              {post.status && <StatusBadge status={post.status} />}
                              {post.technologies && post.technologies.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-600">components:</span>
                                  {post.technologies.slice(0, 3).map(tech => (
                                    <span key={tech} className="px-1.5 py-0.5 text-[10px] bg-white/[0.06] text-gray-400 rounded-sm">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </>
                          )}

                          {/* Threads: reading time highlighted */}
                          {isThreads && (
                            <span className="text-amber-400/60 flex items-center gap-1">
                              <ClockIcon />
                              {calculateReadingTime(post.content)} min read
                            </span>
                          )}

                          {/* CTA */}
                          <span className="text-gray-500 group-hover:text-blue-400 transition-colors flex items-center gap-1 ml-auto">
                            {ctaLabel} <ArrowRightIcon />
                          </span>
                        </div>

                        {/* Search Excerpt */}
                        {contentExcerpt && (
                          <div className="mt-3 text-xs text-gray-400 bg-yellow-400/5 p-2 border-l-2 border-yellow-400/40">
                            <Highlight text={contentExcerpt} query={query} />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* GitHub link (outside main link to avoid nested <a>) */}
                  {(isProjects || isBits2bricks) && post.github && (
                    <a
                      href={post.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white bg-white/[0.03] border border-white/8 rounded-sm hover:border-white/20 transition-all z-10"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="View on GitHub"
                    >
                      <GitHubIcon />
                    </a>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center">
              <div className="text-gray-600 text-4xl mb-4">&empty;</div>
              <p className="text-gray-500 text-sm">No entries found matching "{query}"</p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <Link
                key={post.id}
                to={`/${post.category}/${post.id}`}
                className="group block border border-white/8 rounded-sm overflow-hidden bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all"
              >
                <div className="aspect-video bg-white/[0.03] overflow-hidden">
                  <img
                    src={post.thumbnail || 'https://via.placeholder.com/150'}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-500 uppercase">{formatDate(post.date)}</span>
                    <span className="text-[10px] text-gray-500">{calculateReadingTime(post.content)} min</span>
                  </div>
                  <h3 className="font-semibold text-sm lowercase mb-2 text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.displayTitle || post.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 font-sans">{post.description}</p>
                  {isProjects && post.status && (
                    <div className="mt-2">
                      <StatusBadge status={post.status} />
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="text-gray-600 text-4xl mb-4">&empty;</div>
              <p className="text-gray-500 text-sm">No entries found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
