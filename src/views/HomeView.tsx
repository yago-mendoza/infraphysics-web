// Home page view — minimalist cosmic landing

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Post } from '../types';
import { initBrainIndex, type BrainIndex } from '../lib/brainIndex';
import { ArrowRightIcon, SearchIcon } from '../components/icons';
import { CATEGORY_CONFIG, catAccentVar, postPath, sectionPath, secondBrainPath } from '../config/categories';
import { getSearchExcerpt, countMatches } from '../lib';
import { Highlight } from '../components/ui';
import { HomeTour } from '../components/HomeTour';

const categoryKeys = ['projects', 'threads', 'bits2bricks'] as const;

export const HomeView: React.FC = () => {
  const featuredPosts = useMemo(() =>
    posts
      .filter(p => p.featured)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6),
  []);

  // Post counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of categoryKeys) {
      counts[key] = posts.filter(p => p.category === key).length;
    }
    return counts;
  }, []);

  // Second Brain stats — loaded from async brain index
  const [brainStats, setBrainStats] = useState({ notes: 0, connections: 0 });
  useEffect(() => {
    initBrainIndex().then(idx => {
      setBrainStats({
        notes: idx.globalStats.totalConcepts,
        connections: idx.globalStats.totalLinks,
      });
    }).catch(() => {});
  }, []);

  // Unified search
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Recent article history from localStorage
  const recentPosts = useMemo(() => {
    try {
      const raw = localStorage.getItem('infraphysics:article-history');
      if (!raw) return [];
      const history: { category: string; id: string }[] = JSON.parse(raw);
      const resolved: Post[] = [];
      for (const h of history) {
        const post = posts.find(p => p.category === h.category && p.id === h.id);
        if (post) resolved.push(post);
      }
      return resolved.slice(0, 7);
    } catch { return []; }
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;

    const allPosts = posts;
    const matches: { post: Post; matchCount: number; excerpt: string | null }[] = [];
    const counts: Record<string, number> = { projects: 0, threads: 0, bits2bricks: 0 };

    for (const post of allPosts) {
      const mc = countMatches(post.displayTitle || post.title || '', q)
        + countMatches(post.description || '', q)
        + countMatches(post.content || '', q);
      if (mc === 0) continue;
      const excerpt = getSearchExcerpt(post.content || '', q) || getSearchExcerpt(post.description || '', q);
      matches.push({ post, matchCount: mc, excerpt });
      counts[post.category] = (counts[post.category] || 0) + 1;
    }

    matches.sort((a, b) => b.matchCount - a.matchCount);
    return { matches, counts };
  }, [searchQuery]);

  return (
    <>
    <HomeTour />
    <div className="flex flex-col animate-fade-in font-sans">

      {/* Hero */}
      <section className="pt-12 md:pt-20 pb-12 md:pb-20">
        <div className="max-w-xl">
          {/* Identity anchor */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-[4.5rem] h-[4.5rem] shrink-0">
              <div className="absolute inset-0 rounded-full bg-violet-400/10 blur-2xl scale-125" />
              <img src="https://avatars.githubusercontent.com/yago-mendoza" alt="Yago Mendoza" className="relative w-full h-full rounded-full border border-th-border object-cover" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-th-heading">Yago Mendoza</p>
              <p className="text-sm text-th-tertiary font-sans">Industrial engineer &middot; Systems builder</p>
              <Link to="/about" className="inline-flex items-center gap-1 text-xs text-th-secondary hover:text-th-heading transition-colors mt-1">
                More about me <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <h1 className="text-[3.1rem] md:text-5xl font-bold tracking-tight leading-tight mb-2">
            <span className="text-th-heading">From systems to atoms</span>
            <br />
            <span className="text-th-secondary">and back.</span>
          </h1>

          <p className="text-sm text-th-tertiary italic tracking-wide mb-8">
            Engineering is engineering. The substrate doesn't matter.
          </p>

          <p className="text-th-secondary leading-relaxed text-base max-w-lg">
            I picked up code because every engineer should &mdash; not to become a developer, but to move faster. Now I build at the boundary. This is my <span className="text-th-heading font-semibold">lab</span>, my <span className="text-th-heading font-semibold">notebook</span>, and my <span className="text-th-heading font-semibold">proof of work</span>.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-10 md:pb-16 border-t border-th-border pt-8 md:pt-12">
        <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-5 md:mb-8">Explore</h2>

        {/* Search input */}
        <div className="flex-1 group flex items-center border border-th-border px-3 py-2.5 focus-within:border-th-border-active transition-colors bg-th-surface-alt mb-6">
          <span className="text-th-tertiary"><SearchIcon /></span>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setSearchQuery(''); searchRef.current?.blur(); } }}
            placeholder="Search across all categories..."
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent border-none ml-2.5 text-sm focus:outline-none placeholder-th-tertiary text-th-primary"
          />
        </div>

        {searchResults ? (
          <div>
            {/* Category count bar */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 mb-6 text-xs text-th-tertiary">
              {categoryKeys.map(key => {
                const config = CATEGORY_CONFIG[key];
                const accent = catAccentVar(key);
                const count = searchResults.counts[key] || 0;
                return (
                  <span key={key} className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                    <span className="text-th-secondary">{config.title}</span>
                    <span className="text-th-tertiary">&mdash; {count}</span>
                  </span>
                );
              })}
            </div>

            {/* Results list */}
            {searchResults.matches.length > 0 ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {searchResults.matches.map(({ post, matchCount, excerpt }) => {
                  const accent = catAccentVar(post.category);
                  return (
                    <Link
                      key={`${post.category}-${post.id}`}
                      to={postPath(post.category, post.id)}
                      className="card-link group flex items-start gap-3 p-3"
                    >
                      <span className="mt-1.5 inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-th-heading font-medium group-hover-accent transition-colors truncate"
                            style={{ '--ac-color': accent } as React.CSSProperties}>
                            <Highlight text={post.displayTitle || post.title} query={searchQuery} />
                          </span>
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded" style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
                            &times;{matchCount}
                          </span>
                        </div>
                        {excerpt && (
                          <p className="text-xs text-th-tertiary mt-1 line-clamp-1 font-sans">
                          <Highlight text={excerpt} query={searchQuery} />
                        </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-th-tertiary py-8 text-center">No results found.</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {categoryKeys.map(key => {
                const config = CATEGORY_CONFIG[key];
                return (
                  <Link
                    key={key}
                    to={sectionPath(key)}
                    className="card-link group p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-th-secondary group-hover:text-th-primary transition-colors">{config.icon}</span>
                      <h3 className="text-th-heading font-semibold">{config.title}</h3>
                    </div>
                    <p className="text-th-secondary text-sm leading-relaxed line-clamp-2 mb-3 font-sans">
                      {config.description}
                    </p>
                    <span className="text-xs text-th-tertiary">
                      {categoryCounts[key]} {categoryCounts[key] === 1 ? 'post' : 'posts'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Second Brain */}
      <section className="pb-10 md:pb-16 border-t border-th-border pt-8 md:pt-12">
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.03] p-6 md:p-8 overflow-hidden">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-base text-violet-400 tracking-wide mb-3">My public knowledge graph.</h2>
              <p className="text-th-secondary text-sm leading-relaxed font-sans mb-4">
                Atomic, cross-linked notes on everything I study &mdash; from infrastructure and physics to distributed systems. Browse how ideas connect across domains. Start anywhere, follow the links.
              </p>
              <div className="flex items-center gap-6 mb-5">
                <span className="text-sm text-th-tertiary">
                  <span className="text-violet-400 font-mono font-semibold">{brainStats.notes}</span> notes
                </span>
                <span className="text-sm text-th-tertiary">
                  <span className="text-violet-400 font-mono font-semibold">{brainStats.connections}</span> connections
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={secondBrainPath()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <rect x="1" y="1" width="4" height="4" rx="0.5" />
                    <rect x="7" y="1" width="4" height="4" rx="0.5" />
                    <rect x="1" y="7" width="4" height="4" rx="0.5" />
                    <rect x="7" y="7" width="4" height="4" rx="0.5" />
                  </svg>
                  Browse brain
                </Link>
                <Link
                  to="/lab/second-brain/graph"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-violet-500/30 text-violet-400/80 hover:bg-violet-500/10 hover:border-violet-500/50 hover:text-violet-400 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <circle cx="3" cy="3" r="1.5" />
                    <circle cx="9" cy="5" r="1.5" />
                    <circle cx="5" cy="9" r="1.5" />
                    <line x1="4.2" y1="3.7" x2="7.8" y2="4.5" />
                    <line x1="3.8" y1="4.3" x2="5" y2="7.5" />
                    <line x1="6.5" y1="8.5" x2="7.8" y2="6.2" />
                  </svg>
                  Graph 2D
                </Link>
                <Link
                  to="/lab/second-brain/graph"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-violet-500/30 text-violet-400/80 hover:bg-violet-500/10 hover:border-violet-500/50 hover:text-violet-400 transition-all"
                  onClick={() => sessionStorage.setItem('graph-dimension', '3d')}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M6 1L11 4V8L6 11L1 8V4L6 1Z" />
                    <line x1="6" y1="1" x2="6" y2="11" />
                    <line x1="1" y1="4" x2="11" y2="4" />
                  </svg>
                  Graph 3D
                </Link>
              </div>
            </div>
            <div className="hidden md:block shrink-0 w-32 h-32 opacity-30">
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <line x1="60" y1="30" x2="30" y2="70" stroke="#8b5cf6" strokeWidth="1" />
                <line x1="60" y1="30" x2="90" y2="55" stroke="#8b5cf6" strokeWidth="1" />
                <line x1="30" y1="70" x2="75" y2="90" stroke="#8b5cf6" strokeWidth="1" />
                <line x1="90" y1="55" x2="75" y2="90" stroke="#8b5cf6" strokeWidth="1" />
                <line x1="30" y1="70" x2="15" y2="40" stroke="#8b5cf6" strokeWidth="0.75" />
                <line x1="90" y1="55" x2="105" y2="30" stroke="#8b5cf6" strokeWidth="0.75" />
                <line x1="75" y1="90" x2="100" y2="100" stroke="#8b5cf6" strokeWidth="0.75" />
                <line x1="60" y1="30" x2="45" y2="10" stroke="#8b5cf6" strokeWidth="0.75" />
                <circle cx="60" cy="30" r="4" fill="#8b5cf6" />
                <circle cx="30" cy="70" r="3.5" fill="#8b5cf6" />
                <circle cx="90" cy="55" r="3.5" fill="#8b5cf6" />
                <circle cx="75" cy="90" r="3" fill="#8b5cf6" />
                <circle cx="15" cy="40" r="2" fill="#7c3aed" />
                <circle cx="105" cy="30" r="2" fill="#7c3aed" />
                <circle cx="100" cy="100" r="2" fill="#7c3aed" />
                <circle cx="45" cy="10" r="2" fill="#7c3aed" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Work */}
      <section className="pb-10 md:pb-16 border-t border-th-border pt-8 md:pt-12">
        <h2 className="text-lg md:text-xl text-th-heading font-semibold tracking-tight mb-1">What I Write About</h2>
        <p className="text-th-tertiary text-sm font-sans mb-5 md:mb-8">Infrastructure, physics, and building things that work.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredPosts.map(post => {
            const accent = catAccentVar(post.category);
            return (
            <Link
              key={`${post.category}-${post.id}`}
              to={postPath(post.category, post.id)}
              className="card-link group p-5 flex flex-col"
            >
              {post.thumbnail && (
                <div className="mb-4">
                  <img
                    src={post.thumbnail}
                    alt={post.displayTitle || post.title}
                    loading="lazy"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block px-2 py-0.5 text-[10px] uppercase border rounded-sm"
                  style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`, backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
                  {post.category}
                </span>
              </div>

              <h3 className="text-th-heading font-semibold leading-snug mb-2 group-hover-accent transition-colors"
                style={{ '--ac-color': accent } as React.CSSProperties}>
                {post.displayTitle || post.title}
              </h3>

              <p className="text-th-secondary text-sm leading-relaxed line-clamp-2 font-sans">
                {post.description}
              </p>

              <span className="inline-flex items-center gap-1 mt-auto pt-4 text-xs text-th-tertiary group-hover-accent transition-colors"
                style={{ '--ac-color': accent } as React.CSSProperties}>
                Read <ArrowRightIcon />
              </span>
            </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-10 md:pb-16 border-t border-th-border pt-8 md:pt-12">
        <p className="text-th-secondary text-sm font-sans">
          Interested in collaborating?{' '}
          <Link
            to="/contact"
            className="text-th-heading hover:text-blue-400 transition-colors underline underline-offset-4 decoration-th-border"
          >
            Get in touch
          </Link>.
        </p>
      </section>
    </div>
    </>
  );
};
