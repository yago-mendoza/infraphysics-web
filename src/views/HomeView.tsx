// Home page view — minimalist cosmic landing

import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Post } from '../types';
import { ArrowRightIcon, SearchIcon } from '../components/icons';
import { CATEGORY_CONFIG, getThemedColor, postPath, sectionPath } from '../config/categories';
import { useTheme } from '../contexts/ThemeContext';
import { stripHtml, hexAlpha } from '../lib';

const categoryKeys = ['projects', 'threads', 'bits2bricks'] as const;

export const HomeView: React.FC = () => {
  const { theme } = useTheme();
  const featuredPosts = useMemo(() =>
    posts
      .filter(p => p.featured && p.category !== 'fieldnotes')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  []);

  // Post counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of categoryKeys) {
      counts[key] = posts.filter(p => p.category === key).length;
    }
    return counts;
  }, []);

  // Second Brain stats
  const brainStats = useMemo(() => {
    const fieldnotes = posts.filter(p => p.category === 'fieldnotes');
    const totalRefs = fieldnotes.reduce((sum, fn) => sum + (fn.references?.length || 0), 0);
    return { notes: fieldnotes.length, connections: totalRefs };
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
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const getMatchCount = (text: string): number => {
      const plain = stripHtml(text).toLowerCase();
      let count = 0;
      let pos = 0;
      while ((pos = plain.indexOf(q, pos)) !== -1) {
        count++;
        pos += q.length;
      }
      return count;
    };

    const getExcerpt = (content: string): string | null => {
      const plain = stripHtml(content);
      const index = plain.toLowerCase().indexOf(q);
      if (index === -1) return null;
      const start = Math.max(0, index - 50);
      const end = Math.min(plain.length, index + 100);
      return '\u2026' + plain.substring(start, end) + '\u2026';
    };

    const allPosts = posts.filter(p => p.category !== 'fieldnotes');
    const matches: { post: Post; matchCount: number; excerpt: string | null }[] = [];
    const counts: Record<string, number> = { projects: 0, threads: 0, bits2bricks: 0 };

    for (const post of allPosts) {
      const title = (post.displayTitle || post.title || '').toLowerCase();
      const desc = (post.description || '').toLowerCase();
      const content = stripHtml(post.content || '').toLowerCase();

      if (title.includes(q) || desc.includes(q) || content.includes(q)) {
        const mc = getMatchCount(post.displayTitle || post.title || '')
          + getMatchCount(post.description || '')
          + getMatchCount(post.content || '');
        const excerpt = getExcerpt(post.content || '') || getExcerpt(post.description || '');
        matches.push({ post, matchCount: mc, excerpt });
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    }

    matches.sort((a, b) => b.matchCount - a.matchCount);
    return { matches, counts };
  }, [searchQuery]);

  return (
    <div className="flex flex-col animate-fade-in font-sans">

      {/* Hero */}
      <section className="pt-8 md:pt-20 pb-20">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-3">
            <span className="text-th-heading">From systems to atoms</span>
            <br />
            <span className="text-th-secondary">and back.</span>
          </h1>

          <p className="text-sm text-th-tertiary italic tracking-wide mb-8">
            Engineering is engineering. The substrate doesn't matter.
          </p>

          <p className="text-th-secondary leading-relaxed text-base max-w-lg">
            Industrial engineer by training. I picked up code because every engineer
            should &mdash; not to become a developer, but to move faster. Now I build at the boundary.
          </p>

          <p className="text-th-secondary leading-relaxed text-base max-w-lg mt-3">
            This is my <span className="text-th-heading font-semibold">lab</span>, my <span className="text-th-heading font-semibold">notebook</span>, and my <span className="text-th-heading font-semibold">proof of work</span>.
          </p>

          <p className="mt-4 text-sm text-th-tertiary">
            by{' '}
            <Link to="/about" className="text-th-secondary hover:text-th-heading transition-colors underline underline-offset-4 decoration-th-border">
              Yago Mendoza
            </Link>
            {' '}&mdash; industrial engineer, systems builder
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-16 border-t border-th-border pt-12">
        <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-8">Explore</h2>

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
                const tc = getThemedColor(key, theme as 'dark' | 'light');
                const count = searchResults.counts[key] || 0;
                return (
                  <span key={key} className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: tc.accent }} />
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
                  const tc = getThemedColor(post.category, theme as 'dark' | 'light');
                  return (
                    <Link
                      key={`${post.category}-${post.id}`}
                      to={postPath(post.category, post.id)}
                      className="group flex items-start gap-3 p-3 border border-th-border rounded-sm bg-th-surface hover:border-th-border-active hover:bg-th-surface-alt transition-all"
                    >
                      <span className="mt-1.5 inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tc.accent }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-th-heading font-medium group-hover:text-blue-400 transition-colors truncate">
                            {post.displayTitle || post.title}
                          </span>
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded" style={{ color: tc.accent, backgroundColor: hexAlpha(tc.accent, 0.1) }}>
                            &times;{matchCount}
                          </span>
                        </div>
                        {excerpt && (
                          <p className="text-xs text-th-tertiary mt-1 line-clamp-1 font-sans">{excerpt}</p>
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
            {/* Recent articles from history */}
            {recentPosts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[10px] text-th-tertiary uppercase tracking-wider mb-3">Previous</h3>
                <div className="space-y-1">
                  {recentPosts.map(post => {
                    const tc = getThemedColor(post.category, theme as 'dark' | 'light');
                    return (
                      <Link
                        key={`${post.category}-${post.id}`}
                        to={postPath(post.category, post.id)}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-sm hover:bg-th-surface-alt transition-all"
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tc.accent }} />
                        <span className="text-sm text-th-secondary group-hover:text-th-heading transition-colors truncate">
                          {post.displayTitle || post.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {categoryKeys.map(key => {
                const config = CATEGORY_CONFIG[key];
                return (
                  <Link
                    key={key}
                    to={sectionPath(key)}
                    className="group p-5 border border-th-border rounded-sm bg-th-surface hover:border-th-border-active hover:bg-th-surface-alt transition-all"
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

      {/* Latest Work */}
      <section className="pb-16 border-t border-th-border pt-12">
        <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-8">Latest Work</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredPosts.map(post => (
            <Link
              key={`${post.category}-${post.id}`}
              to={postPath(post.category, post.id)}
              className="group p-5 border border-th-border rounded-sm bg-th-surface hover:border-th-border-active hover:bg-th-surface-alt transition-all flex flex-col"
            >
              {post.thumbnail && (
                <div className="mb-4">
                  <img
                    src={post.thumbnail}
                    alt=""
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block px-2 py-0.5 text-[10px] uppercase border rounded-sm"
                  style={(() => {
                    const tc = getThemedColor(post.category, theme as 'dark' | 'light');
                    return { color: tc.accent, borderColor: hexAlpha(tc.accent, 0.3), backgroundColor: hexAlpha(tc.accent, 0.1) };
                  })()}>
                  {post.category}
                </span>
              </div>

              <h3 className="text-th-heading font-semibold leading-snug mb-2 group-hover:text-blue-400 transition-colors lowercase">
                {post.displayTitle || post.title}
              </h3>

              <p className="text-th-secondary text-sm leading-relaxed line-clamp-2 font-sans">
                {post.description}
              </p>

              <span className="inline-flex items-center gap-1 mt-auto pt-4 text-xs text-th-tertiary group-hover:text-blue-400 transition-colors">
                Read <ArrowRightIcon />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Second Brain */}
      <section className="pb-16 border-t border-th-border pt-12">
        <div className="max-w-xl">
          <h2 className="text-xs text-violet-400 uppercase tracking-wider mb-4">Second Brain</h2>
          <p className="text-th-secondary leading-relaxed mb-4 font-sans">
            Everything I know, linked together. A growing knowledge graph.
          </p>
          <div className="flex gap-6 mb-6">
            <span className="text-sm text-th-tertiary">
              <span className="text-th-heading font-semibold">{brainStats.notes}</span> notes
            </span>
            <span className="text-sm text-th-tertiary">
              <span className="text-th-heading font-semibold">{brainStats.connections}</span> connections
            </span>
          </div>
          <Link
            to="/lab/second-brain"
            className="inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Open Second Brain <ArrowRightIcon />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 border-t border-th-border pt-12">
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
  );
};
