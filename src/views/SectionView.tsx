// Category listing view component (projects, threads, bits2bricks) — theme-aware

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Category } from '../types';
import { stripHtml, accentChipStyle } from '../lib';
import { getSearchExcerpt, countMatches } from '../lib/search';
import { CATEGORY_CONFIG, STATUS_CONFIG, COMPLEXITY_LEVELS, getComplexityLevel, catAccentVar, type CategoryDisplayConfig } from '../config/categories';
import { useTheme } from '../contexts/ThemeContext';
import { useArticleStats } from '../hooks/useArticleStats';
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
  projectVariant?: 1 | 2 | 3 | 4 | 5;
}

const SECTION_RENDERERS: Record<string, React.FC<SectionRendererProps>> = {
  projects: ProjectsList,
  threads: ThreadsList,
  bits2bricks: Bits2BricksGrid,
};

const PAGE_SIZE = 12;


export const SectionView: React.FC<SectionViewProps> = ({ category, projectVariant }) => {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [selectedComplexity, setSelectedComplexity] = useState<string[]>([]);
  const toggleTopic = (t: string) => setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleTech = (t: string) => setSelectedTechs(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleStatus = (s: string) => setSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleComplexity = (label: string) => setSelectedComplexity(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]);

  const { theme } = useTheme();

  // Reset all filters when navigating between categories
  useEffect(() => {
    setQuery('');
    setSelectedTopics([]);
    setSelectedTechs([]);
    setSelectedStatuses([]);
    setSelectedComplexity([]);
    setSortBy('newest');
    setShowFilters(false);
    setVisibleCount(PAGE_SIZE);
    setSelectedLang(null);
  }, [category]);

  const sectionPosts = useMemo(() => posts.filter(p => p.category === category), [category]);
  const searchableText = useMemo(() => new Map(sectionPosts.map(post => [
    post.id,
    `${post.displayTitle || post.title}\u0000${post.description}\u0000${stripHtml(post.content)}`.toLowerCase(),
  ])), [sectionPosts]);
  const stats = useArticleStats(sectionPosts);

  const hasMultipleLangs = useMemo(() => {
    if (category !== 'threads') return false;
    const langs = new Set(sectionPosts.map(p => p.lang || 'en'));
    return langs.size > 1;
  }, [sectionPosts, category]);

  const allTopics = useMemo(() => [...new Set(sectionPosts.flatMap(p => p.tags || []))].sort(), [sectionPosts]);
  const allTechs = useMemo(() => [...new Set(sectionPosts.flatMap(p => p.technologies || []))].sort(), [sectionPosts]);
  const allStatuses = useMemo(() => {
    const statuses = [...new Set(sectionPosts.map(p => p.status).filter(Boolean))] as string[];
    const order = ['ongoing', 'implemented'];
    return statuses.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [sectionPosts]);

  const filteredPosts = useMemo(() => {
    // Filtering/sorting must never mutate the category's cached source array.
    let result = [...sectionPosts];

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(p => searchableText.get(p.id)?.includes(lowerQuery));
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

    if (selectedComplexity.length > 0) {
      result = result.filter(p => {
        const cl = getComplexityLevel(p.complexity);
        return cl && selectedComplexity.includes(cl.label);
      });
    }

    // Language filter — only when no other filters are active
    const hasFilters = query || selectedTopics.length > 0 || selectedTechs.length > 0 || selectedStatuses.length > 0 || selectedComplexity.length > 0;
    if (!hasFilters && selectedLang) {
      result = result.filter(p => (p.lang || 'en') === selectedLang);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'title') return (a.displayTitle || a.title).localeCompare(b.displayTitle || b.title);
      return 0;
    });

    return result;
  }, [sectionPosts, searchableText, query, sortBy, selectedTopics, selectedTechs, selectedStatuses, selectedComplexity, selectedLang]);

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of filteredPosts) for (const t of p.tags || []) map[t] = (map[t] || 0) + 1;
    return map;
  }, [filteredPosts]);

  const techCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of filteredPosts) for (const t of p.technologies || []) map[t] = (map[t] || 0) + 1;
    return map;
  }, [filteredPosts]);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of filteredPosts) if (p.status) map[p.status] = (map[p.status] || 0) + 1;
    return map;
  }, [filteredPosts]);

  const complexityCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of filteredPosts) {
      const cl = getComplexityLevel(p.complexity);
      if (cl) map[cl.label] = (map[cl.label] || 0) + 1;
    }
    return map;
  }, [filteredPosts]);

  const hasAnyComplexity = useMemo(() => sectionPosts.some(p => p.complexity != null), [sectionPosts]);

  // Infinite scroll
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleCount(prev => prev + PAGE_SIZE);
      }
    }, { rootMargin: '200px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  const getExcerpt = getSearchExcerpt;
  const getMatchCount = countMatches;

  const categoryInfo = CATEGORY_CONFIG[category] ?? {
    title: category, description: '', icon: null,
    accentVar: '#9ca3af',
    backLabel: 'RETURN', relatedLabel: 'Related', relatedCategory: '',
  } satisfies CategoryDisplayConfig;
  const accent = catAccentVar(category);
  const Renderer = SECTION_RENDERERS[category] || ProjectsList;

  return (
    <div className={`animate-fade-in section-${category}`}>
      {/* Breadcrumb */}
      <nav className="mb-8 text-[10px] text-th-muted flex items-center gap-2 uppercase tracking-[0.18em]">
        <Link to="/home" className="hover:text-th-secondary transition-colors">home</Link>
        <span className="text-th-muted">/</span>
        <span className="text-th-muted">{category === 'threads' || category === 'bits2bricks' ? 'blog' : 'lab'}</span>
        <span className="text-th-muted">/</span>
        <span className="text-th-secondary">{category}</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-8 border-b border-th-border">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-4 mb-3">
          <h1
            className="text-[2.65rem] md:text-[3.9rem] font-serif font-normal tracking-[-0.04em] leading-none"
          >
            <span className="text-th-heading">{categoryInfo.title}</span>
          </h1>
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-th-tertiary">
            <span>{filteredPosts.length} {filteredPosts.length === 1 ? 'entry' : 'entries'}</span>
          </div>
        </div>
        <p className="text-sm md:text-base text-th-secondary leading-relaxed max-w-2xl font-sans">
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

        <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${showFilters ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
          <div className="p-4 bg-th-surface-alt border border-th-border rounded-sm space-y-4">
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
                    const count = statusCounts[s] || 0;
                    if (!active && (count === 0 || count === filteredPosts.length)) return null;
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className="text-xs px-2.5 py-0.5 border rounded-sm transition-colors accent-chip"
                        style={accentChipStyle(cfg.accent, active)}
                      >
                        {cfg.label} ({count})
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
                  {allTopics.map(t => {
                    const active = selectedTopics.includes(t);
                    const count = topicCounts[t] || 0;
                    if (!active && (count === 0 || count === filteredPosts.length)) return null;
                    return (
                      <button
                        key={t}
                        onClick={() => toggleTopic(t)}
                        className={`text-xs px-2.5 py-0.5 border rounded-sm transition-colors ${
                          active
                            ? 'bg-slate-400/20 border-slate-400/50 text-slate-400'
                            : 'border-slate-400/40 text-slate-400/80 hover:border-slate-400/60'
                        }`}
                      >
                        {t} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasAnyComplexity && (
              <div>
                <span className="text-xs text-th-tertiary uppercase block mb-2">Complexity</span>
                <div className="flex flex-wrap gap-2">
                  {COMPLEXITY_LEVELS.map(level => {
                    const active = selectedComplexity.includes(level.label);
                    const count = complexityCounts[level.label] || 0;
                    if (!active && (count === 0 || count === filteredPosts.length)) return null;
                    return (
                      <button
                        key={level.label}
                        onClick={() => toggleComplexity(level.label)}
                        className="text-xs px-2.5 py-0.5 border rounded-sm transition-colors accent-chip"
                        style={accentChipStyle(accent, active)}
                      >
                        {level.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {allTechs.length > 0 && (
              <div>
                <span className="text-xs text-th-tertiary uppercase block mb-2">Technologies</span>
                <div className="flex flex-wrap gap-2">
                  {allTechs.map(t => {
                    const isActive = selectedTechs.includes(t);
                    const count = techCounts[t] || 0;
                    if (!isActive && (count === 0 || count === filteredPosts.length)) return null;
                    return (
                      <button
                        key={t}
                        onClick={() => toggleTech(t)}
                        className="text-xs px-2.5 py-0.5 border rounded-sm transition-colors accent-chip"
                        style={accentChipStyle(accent, isActive)}
                      >
                        {t} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Language toggle — threads only, hidden when filters active */}
      {hasMultipleLangs && !query && selectedTopics.length === 0 && selectedTechs.length === 0 && selectedStatuses.length === 0 && (
        <div className="flex justify-center gap-2 mb-6">
          {['en', 'es'].map(lang => {
            const active = selectedLang === lang;
            return (
              <button
                key={lang}
                onClick={() => setSelectedLang(active ? null : lang)}
                className="text-[11px] font-semibold tracking-widest uppercase px-3 py-1 border rounded-sm transition-colors"
                style={{
                  fontFamily: "'Roboto Slab', Georgia, serif",
                  borderColor: active ? `var(--cat-threads-accent)` : 'var(--border)',
                  color: active ? `var(--cat-threads-accent)` : 'var(--text-tertiary)',
                  backgroundColor: active ? 'color-mix(in srgb, var(--cat-threads-accent) 10%, transparent)' : 'transparent',
                }}
              >
                {lang}
              </button>
            );
          })}
        </div>
      )}

      {/* Delegated renderer */}
      <Renderer posts={visiblePosts} query={query} getExcerpt={getExcerpt} getMatchCount={getMatchCount} accent={accent} stats={stats} projectVariant={projectVariant} />

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="h-20" aria-hidden="true" />
      )}
    </div>
  );
};
