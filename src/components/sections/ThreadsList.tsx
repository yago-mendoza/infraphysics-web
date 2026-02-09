// Threads section — editorial card layout with diamond rail and rose-tinted photos

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/date';
import { calculateReadingTime } from '../../lib/content';
import { ClockIcon } from '../icons';
import { postPath } from '../../config/categories';
import { EmptyState, SearchResultsList } from './SearchResultsList';
import type { SectionRendererProps } from './index';

export const ThreadsList: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, getMatchCount, accent }) => {
  if (posts.length === 0) return <EmptyState query={query} />;
  if (query) return <SearchResultsList posts={posts} query={query} getMatchCount={getMatchCount} accent={accent} tagAccent="#94a3b8" />;

  /* ── Default: editorial card layout ── */
  return (
    <div className="max-w-3xl mx-auto">
      {posts.map((post, index) => {
        const readTime = calculateReadingTime(post.content);
        const tags = post.tags || [];

        return (
          <div key={post.id} className={`listing-card thread-card ${index < posts.length - 1 ? 'border-b border-th-border pb-8 mb-8' : ''}`}>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Text — left */}
              <div className="flex-grow min-w-0">
                {/* Reading time + date */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 border rounded-sm" style={{ borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`, color: accent }}>
                    <ClockIcon /> {readTime} MIN READ
                  </span>
                  <span className="text-xs text-th-tertiary font-mono">{formatDate(post.date)}</span>
                </div>

                {/* Title + Description — both clickable */}
                <Link to={postPath(post.category, post.id)} className="listing-title-link thread-title-link group block mb-3">
                  <h3 className="listing-card-title thread-card-title text-xl font-bold font-serif text-th-primary transition-colors leading-tight mb-2">
                    {post.displayTitle || post.title}
                  </h3>
                  <p className="text-sm text-th-secondary font-serif leading-relaxed">
                    {post.description}
                  </p>
                </Link>

                {/* Tag pills */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="pill border-slate-400/30 text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo — right, rose-tinted */}
              {post.thumbnail && (
                <Link to={postPath(post.category, post.id)} className="listing-thumb thread-thumb relative w-full md:w-56 h-36 overflow-hidden flex-shrink-0 self-start block">
                  <img
                    src={post.thumbnail}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
