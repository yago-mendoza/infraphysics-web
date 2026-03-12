// Threads section — editorial card layout with diamond rail and rose-tinted photos

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/date';
import { EyeIcon, HeartIcon } from '../icons';
import { postPath } from '../../config/categories';
import { ComplexityBar } from '../ui';
import { EmptyState } from './SearchResultsList';
import type { SectionRendererProps } from './index';

export const ThreadsList: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, getMatchCount, accent, stats }) => {
  if (posts.length === 0) return <EmptyState query={query} />;

  /* ── Default: editorial card layout ── */
  return (
    <div className="max-w-3xl mx-auto">
      {posts.map((post, index) => {
        return (
          <div key={post.id} className={`listing-card thread-card ${index < posts.length - 1 ? 'border-b border-th-border pb-8 mb-8' : ''}`}>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Text — left */}
              <div className="flex-grow min-w-0">
                {/* Date + stats + complexity */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-sm text-th-tertiary" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>{formatDate(post.date)}</span>
                  <ComplexityBar value={post.complexity} category={post.category} />
                  {(() => {
                    const s = stats?.[postPath(post.category, post.id)];
                    if (!s) return null;
                    return (
                      <>
                        {s.views > 0 && <span className="inline-flex items-center gap-1 text-xs text-th-tertiary"><EyeIcon size={12} /> {s.views}</span>}
                        {s.hearts > 0 && <span className="inline-flex items-center gap-1 text-xs text-th-tertiary"><HeartIcon size={12} /> {s.hearts}</span>}
                      </>
                    );
                  })()}
                </div>

                {/* Title + Subtitle + Lead preview — all clickable */}
                <Link to={postPath(post.category, post.id)} className="listing-title-link thread-title-link group block mb-3">
                  <h3 className="listing-card-title thread-card-title text-xl transition-colors leading-tight mb-1" style={{ fontFamily: "'Roboto Slab', Georgia, serif", fontWeight: 400 }}>
                    {post.displayTitle || post.title}
                  </h3>
                  {post.subtitle && (
                    <p className="text-base text-th-secondary leading-relaxed mb-1" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>
                      {post.subtitle}
                    </p>
                  )}
                  {(() => {
                    const preview = post.lead || post.description;
                    if (!preview) return null;
                    return (
                      <p className="text-sm text-th-tertiary leading-relaxed" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>
                        {preview.length > 140 ? preview.slice(0, 140).trimEnd() + '...' : preview}
                      </p>
                    );
                  })()}
                </Link>
              </div>

              {/* Thumbnail — right */}
              {post.thumbnail && (
                <Link to={postPath(post.category, post.id)} className="listing-thumb thread-thumb relative hidden md:block w-56 h-36 overflow-hidden flex-shrink-0 self-start">
                  <img
                    src={post.thumbnail}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-opacity hover:opacity-90"
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
