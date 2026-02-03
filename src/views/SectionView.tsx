// Category listing view component (projects, threads, bits2bricks) — theme-aware

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Category } from '../types';
import { calculateReadingTime } from '../lib';
import { CATEGORY_CONFIG } from '../config/categories';
import {
  SearchIcon,
  FilterIcon,
} from '../components/icons';
import {
  Bits2BricksGrid,
  ProjectsList,
  ThreadsList,
} from '../components/sections';
import type { SectionRendererProps } from '../components/sections';

interface SectionViewProps {
  category: Category;
}

const SECTION_RENDERERS: Record<string, React.FC<SectionRendererProps>> = {
  projects: ProjectsList,
  threads: ThreadsList,
  bits2bricks: Bits2BricksGrid,
};

export const SectionView: React.FC<SectionViewProps> = ({ category }) => {
  const [query, setQuery] = useState('');
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

  const categoryInfo = CATEGORY_CONFIG[category] || { title: category, description: '', icon: null, color: 'gray-400', colorClass: 'text-gray-400' };
  const Renderer = SECTION_RENDERERS[category] || ProjectsList;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-th-tertiary flex items-center gap-2">
        <Link to="/home" className="hover:text-th-secondary transition-colors">home</Link>
        <span className="text-th-muted">/</span>
        <span className="text-th-muted">{category === 'threads' || category === 'bits2bricks' ? 'blog' : 'lab'}</span>
        <span className="text-th-muted">/</span>
        <span className="text-th-secondary">{category}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-th-border">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h1 className={`text-4xl font-bold tracking-tight title-l-frame uppercase ${categoryInfo.colorClass}`}>
            <span className="text-th-heading">{categoryInfo.title}</span>
          </h1>
          <div className="flex items-center gap-4 text-xs text-th-tertiary">
            <span>{filteredPosts.length} {filteredPosts.length === 1 ? 'entry' : 'entries'}</span>
            <span className="text-th-muted">&middot;</span>
            <span>{filteredPosts.reduce((acc, p) => acc + calculateReadingTime(p.content), 0)} min total</span>
          </div>
        </div>
        <p className="text-sm text-th-secondary leading-relaxed max-w-2xl font-sans">
          {categoryInfo.description}
        </p>
      </header>

      {/* Toolbar — Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 group flex items-center border border-th-border px-3 py-2.5 focus-within:border-th-border-active transition-colors bg-th-surface-alt">
            <span className="text-th-tertiary"><SearchIcon /></span>
            <input
              type="text"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${category}...`}
              className="w-full bg-transparent border-none ml-2.5 text-sm focus:outline-none placeholder-th-tertiary text-th-primary"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border flex items-center gap-2 text-xs transition-all ${showFilters ? 'bg-th-active text-th-heading border-th-border-hover' : 'border-th-border text-th-secondary hover:border-th-border-hover bg-th-surface-alt'}`}
          >
            <FilterIcon />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-th-surface-alt border border-th-border rounded-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs text-th-tertiary uppercase">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                className="text-xs border border-th-border rounded-sm px-2 py-1.5 bg-th-elevated text-th-secondary focus:outline-none focus:border-th-border-active"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Delegated renderer */}
      <Renderer posts={filteredPosts} query={query} getExcerpt={getExcerpt} color={categoryInfo.color || 'gray-400'} />
    </div>
  );
};
