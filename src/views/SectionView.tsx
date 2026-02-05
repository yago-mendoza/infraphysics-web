// Category listing view component (projects, threads, bits2bricks) — theme-aware

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Category } from '../types';
import { calculateReadingTime, stripHtml, accentChipStyle } from '../lib';
import { getSearchExcerpt, countMatches } from '../lib/search';
import { CATEGORY_CONFIG, STATUS_CONFIG, catAccentVar, type CategoryDisplayConfig } from '../config/categories';
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

const PAGE_SIZE = 3;


export const SectionView: React.FC<SectionViewProps> = ({ category }) => {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const toggleTopic = (t: string) => setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleTech = (t: string) => setSelectedTechs(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleStatus = (s: string) => setSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const { theme } = useTheme();

  const sectionPosts = useMemo(() => posts.filter(p => p.category === category), [category]);

  const allTopics = useMemo(() => [...new Set(sectionPosts.flatMap(p => p.tags || []))].sort(), [sectionPosts]);
  const allTechs = useMemo(() => [...new Set(sectionPosts.flatMap(p => p.technologies || []))].sort(), [sectionPosts]);
  const allStatuses = useMemo(() => {
    const statuses = [...new Set(sectionPosts.map(p => p.status).filter(Boolean))] as string[];
    const order = ['ongoing', 'implemented'];
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

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'title') return (a.displayTitle || a.title).localeCompare(b.displayTitle || b.title);
      return 0;
    });

    return result;
  }, [sectionPosts, query, sortBy, selectedTopics, selectedTechs, selectedStatuses]);

  // Infinite scroll
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

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
          setVisibleCount(prev => prev + PAGE_SIZE);
          setLoading(false);
        }, 800);
      }
    }, { rootMargin: '200px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, visibleCount]);

  const getExcerpt = getSearchExcerpt;
  const getMatchCount = countMatches;

  const categoryInfo = CATEGORY_CONFIG[category] ?? {
    title: category, description: '', icon: null,
    color: 'gray-400', colorClass: 'text-th-secondary', bgClass: 'bg-th-surface',
    borderClass: 'border-th-border', accent: '#9ca3af', accentVar: '#9ca3af',
    darkBadge: 'text-th-secondary border-th-border bg-th-surface',
    backLabel: 'RETURN', relatedLabel: 'Related', relatedCategory: '',
  } satisfies CategoryDisplayConfig;
  const accent = catAccentVar(category);
  const Renderer = SECTION_RENDERERS[category] || ProjectsList;

  return (
    <div className={`animate-fade-in section-${category}`}>
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
              onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); (e.target as HTMLInputElement).blur(); } }}
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
                    const cfg = STATUS_CONFIG[s] || { label: s, accent: '#9ca3af', dotColor: '#9ca3af' };
                    const active = selectedStatuses.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className="text-xs px-2.5 py-0.5 border rounded-sm transition-colors accent-chip"
                        style={accentChipStyle(cfg.accent, active)}
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
                          : 'border-slate-400/40 text-slate-400/80 hover:border-slate-400/60'
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
                  {allTechs.map(t => {
                    const isActive = selectedTechs.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => toggleTech(t)}
                        className="text-xs px-2.5 py-0.5 border rounded-sm transition-colors accent-chip"
                        style={accentChipStyle(accent, isActive)}
                      >
                        {t} ({techCounts[t] || 0})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delegated renderer */}
      <Renderer posts={visiblePosts} query={query} getExcerpt={getExcerpt} getMatchCount={getMatchCount} accent={accent} />

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
