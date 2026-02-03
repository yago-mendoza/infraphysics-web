// Category listing view component (projects, threads, bits2bricks) — theme-aware

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Category } from '../types';
import { calculateReadingTime, stripHtml } from '../lib';
import { CATEGORY_CONFIG } from '../config/categories';
import { useSectionState } from '../contexts/SectionStateContext';
import { useTheme } from '../contexts/ThemeContext';
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

const PAGE_CONFIG: Record<string, { initial: number; page: number }> = {
  projects: { initial: 3, page: 3 },
  threads: { initial: 3, page: 3 },
  bits2bricks: { initial: 6, page: 3 },
};

const STATUS_FILTER_CONFIG: Record<string, { label: string; color: string }> = {
  'ongoing': { label: 'Ongoing', color: 'blue-400' },
  'implemented': { label: 'Implemented', color: 'amber-400' },
  'completed': { label: 'Completed', color: 'emerald-400' },
};

export const SectionView: React.FC<SectionViewProps> = ({ category }) => {
  const { getState, setState: setSectionState } = useSectionState();
  const { query, sortBy, showFilters, selectedTopics, selectedTechs, selectedStatuses, visibleCount } = getState(category);
  const setQuery = (q: string) => setSectionState(category, { query: q });
  const setSortBy = (s: 'newest' | 'oldest' | 'title') => setSectionState(category, { sortBy: s });
  const setShowFilters = (f: boolean) => setSectionState(category, { showFilters: f });
  const toggleTopic = (t: string) => setSectionState(category, { selectedTopics: selectedTopics.includes(t) ? selectedTopics.filter(x => x !== t) : [...selectedTopics, t] });
  const toggleTech = (t: string) => setSectionState(category, { selectedTechs: selectedTechs.includes(t) ? selectedTechs.filter(x => x !== t) : [...selectedTechs, t] });
  const toggleStatus = (s: string) => setSectionState(category, { selectedStatuses: selectedStatuses.includes(s) ? selectedStatuses.filter(x => x !== s) : [...selectedStatuses, s] });

  const { theme } = useTheme();

  const sectionPosts = useMemo(() => posts.filter(p => p.category === category), [category]);

  const allTopics = useMemo(() => [...new Set(sectionPosts.flatMap(p => p.tags || []))].sort(), [sectionPosts]);
  const allTechs = useMemo(() => [...new Set(sectionPosts.flatMap(p => p.technologies || []))].sort(), [sectionPosts]);
  const allStatuses = useMemo(() => {
    const statuses = [...new Set(sectionPosts.map(p => p.status).filter(Boolean))] as string[];
    const order = ['ongoing', 'implemented', 'completed'];
    return statuses.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [sectionPosts]);

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of sectionPosts) for (const t of p.tags || []) map[t] = (map[t] || 0) + 1;
    return map;
  }, [sectionPosts]);

  const techCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of sectionPosts) for (const t of p.technologies || []) map[t] = (map[t] || 0) + 1;
    return map;
  }, [sectionPosts]);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of sectionPosts) if (p.status) map[p.status] = (map[p.status] || 0) + 1;
    return map;
  }, [sectionPosts]);

  const filteredPosts = useMemo(() => {
    let result = sectionPosts;

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(p =>
        (p.displayTitle || p.title).toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        stripHtml(p.content).toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedTopics.length > 0) {
      result = result.filter(p => selectedTopics.some(t => (p.tags || []).includes(t)));
    }

    if (selectedTechs.length > 0) {
      result = result.filter(p => selectedTechs.some(t => (p.technologies || []).includes(t)));
    }

    if (selectedStatuses.length > 0) {
      result = result.filter(p => p.status && selectedStatuses.includes(p.status));
    }

    // Pinned posts first
    const pinned = result.filter(p => p.featured);
    const rest = result.filter(p => !p.featured);

    rest.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'title') return (a.displayTitle || a.title).localeCompare(b.displayTitle || b.title);
      return 0;
    });

    return [...pinned, ...rest];
  }, [sectionPosts, query, sortBy, selectedTopics, selectedTechs, selectedStatuses]);

  // Infinite scroll
  const config = PAGE_CONFIG[category] || { initial: 6, page: 3 };
  const effectiveVisible = visibleCount || config.initial;
  const visiblePosts = filteredPosts.slice(0, effectiveVisible);
  const hasMore = effectiveVisible < filteredPosts.length;

  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoading(true);
        setTimeout(() => {
          setSectionState(category, { visibleCount: effectiveVisible + config.page });
          setLoading(false);
        }, 800);
      }
    }, { rootMargin: '200px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, effectiveVisible, category, config.page, setSectionState]);

  const getExcerpt = (content: string, query: string) => {
    if (!query) return null;
    const plain = stripHtml(content);
    const index = plain.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return null;
    const start = Math.max(0, index - 50);
    const end = Math.min(plain.length, index + 100);
    return "..." + plain.substring(start, end) + "...";
  };

  const getMatchCount = (content: string, query: string): number => {
    if (!query) return 0;
    const q = query.toLowerCase();
    const plain = stripHtml(content).toLowerCase();
    let count = 0;
    let pos = 0;
    while ((pos = plain.indexOf(q, pos)) !== -1) {
      count++;
      pos += q.length;
    }
    return count;
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${category}...`}
              spellCheck={false}
              autoComplete="off"
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
          <div className="p-4 bg-th-surface-alt border border-th-border rounded-sm animate-fade-in space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-th-tertiary uppercase">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                  className="text-xs border border-th-border rounded-sm px-2 py-1.5 bg-th-elevated text-th-secondary focus:outline-none focus:border-th-border-active"
                  style={{ colorScheme: theme }}
                >
                  <option value="newest" className="bg-th-base text-th-secondary">Newest First</option>
                  <option value="oldest" className="bg-th-base text-th-secondary">Oldest First</option>
                  <option value="title" className="bg-th-base text-th-secondary">Alphabetical</option>
                </select>
              </div>
              {allStatuses.length > 0 && (
                <>
                  <div className="w-px h-4 bg-th-border" />
                  <span className="text-xs text-th-tertiary uppercase">Status:</span>
                  {allStatuses.map(s => {
                    const cfg = STATUS_FILTER_CONFIG[s] || { label: s, color: 'gray-400' };
                    const active = selectedStatuses.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className={`text-xs px-2.5 py-0.5 border rounded-sm transition-colors ${
                          active
                            ? `bg-${cfg.color}/20 border-${cfg.color}/50 text-${cfg.color}`
                            : `border-${cfg.color}/20 text-${cfg.color}/60 hover:border-${cfg.color}/40`
                        }`}
                      >
                        {cfg.label} ({statusCounts[s] || 0})
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {allTopics.length > 0 && (
              <div>
                <span className="text-xs text-th-tertiary uppercase block mb-2">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {allTopics.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleTopic(t)}
                      className={`text-xs px-2.5 py-0.5 border rounded-sm transition-colors ${
                        selectedTopics.includes(t)
                          ? 'bg-slate-400/20 border-slate-400/50 text-slate-400'
                          : 'border-slate-400/20 text-slate-400/60 hover:border-slate-400/40'
                      }`}
                    >
                      {t} ({topicCounts[t] || 0})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {allTechs.length > 0 && (
              <div>
                <span className="text-xs text-th-tertiary uppercase block mb-2">Technologies</span>
                <div className="flex flex-wrap gap-2">
                  {allTechs.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleTech(t)}
                      className={`text-xs px-2.5 py-0.5 border rounded-sm transition-colors ${
                        selectedTechs.includes(t)
                          ? `bg-${categoryInfo.color}/20 border-${categoryInfo.color}/50 text-${categoryInfo.color}`
                          : `border-${categoryInfo.color}/20 text-${categoryInfo.color}/60 hover:border-${categoryInfo.color}/40`
                      }`}
                    >
                      {t} ({techCounts[t] || 0})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delegated renderer */}
      <Renderer posts={visiblePosts} query={query} getExcerpt={getExcerpt} getMatchCount={getMatchCount} color={categoryInfo.color || 'gray-400'} accent={categoryInfo.accent || '#9ca3af'} />

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-10">
          {loading && (
            <svg className="animate-spin h-5 w-5 text-th-tertiary" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
