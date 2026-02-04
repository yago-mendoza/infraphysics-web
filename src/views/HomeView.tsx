// Home page view — minimalist cosmic landing

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/data';
import { Post } from '../types';
import { ArrowRightIcon } from '../components/icons';
import { CATEGORY_CONFIG, getThemedColor, postPath, sectionPath } from '../config/categories';
import { useTheme } from '../contexts/ThemeContext';
import homeFeaturedData from '../data/home-featured.generated.json';

// Resolve featured post refs ("category/id") to actual Post objects
type DisplayPost = Post & { highlight?: string };

function resolveFeatured(refs: { ref: string; highlight?: string }[]): DisplayPost[] {
  const resolved: DisplayPost[] = [];
  for (const entry of refs) {
    const [category, id] = entry.ref.split('/');
    const post = posts.find(p => p.category === category && p.id === id);
    if (post) {
      resolved.push({ ...post, highlight: entry.highlight });
    }
  }
  return resolved;
}

const categoryKeys = ['projects', 'threads', 'bits2bricks'] as const;

export const HomeView: React.FC = () => {
  const { theme } = useTheme();
  const featuredPosts = useMemo(() => resolveFeatured(homeFeaturedData.featured), []);

  // Post counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of categoryKeys) {
      counts[key] = posts.filter(p => p.category === key).length;
    }
    return counts;
  }, []);

  // Inject latest non-fieldnotes post if not already featured
  const { displayPosts, latestNewId } = useMemo(() => {
    const nonFieldnotes = posts.filter(p => p.category !== 'fieldnotes');
    const sorted = [...nonFieldnotes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latest = sorted[0];
    if (latest && !featuredPosts.some(fp => fp.id === latest.id && fp.category === latest.category)) {
      return {
        displayPosts: [{ ...latest } as DisplayPost, ...featuredPosts],
        latestNewId: latest.id,
      };
    }
    return { displayPosts: featuredPosts, latestNewId: null as string | null };
  }, [featuredPosts]);

  // Second Brain stats
  const brainStats = useMemo(() => {
    const fieldnotes = posts.filter(p => p.category === 'fieldnotes');
    const totalRefs = fieldnotes.reduce((sum, fn) => sum + (fn.references?.length || 0), 0);
    return { notes: fieldnotes.length, connections: totalRefs };
  }, []);

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
      </section>

      {/* Latest Work */}
      <section className="pb-16 border-t border-th-border pt-12">
        <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-8">Latest Work</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayPosts.map(post => (
            <Link
              key={`${post.category}-${post.id}`}
              to={postPath(post.category, post.id)}
              className="group p-5 border border-th-border rounded-sm bg-th-surface hover:border-th-border-active hover:bg-th-surface-alt transition-all flex flex-col"
            >
              {post.thumbnail && (
                <div className="relative mb-4">
                  <img
                    src={post.thumbnail}
                    alt=""
                    className="w-full h-32 object-cover rounded"
                  />
                  {post.id === latestNewId && (
                    <span className="absolute -top-3 -left-3 z-10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-black bg-white rounded-sm shadow-lg">
                      New
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-block px-2 py-0.5 text-[10px] uppercase border rounded-sm ${(() => {
                  const tc = getThemedColor(post.category, theme as 'dark' | 'light');
                  return `text-${tc.color} border-${tc.color}/30 bg-${tc.color}/10`;
                })()}`}>
                  {post.category}
                </span>
              </div>

              <h3 className="text-th-heading font-semibold leading-snug mb-2 group-hover:text-blue-400 transition-colors lowercase">
                {post.displayTitle || post.title}
              </h3>

              <p className="text-th-secondary text-sm leading-relaxed line-clamp-2 font-sans">
                {post.highlight || post.description}
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
