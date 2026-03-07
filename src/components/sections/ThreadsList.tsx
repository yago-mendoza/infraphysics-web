// Threads section — editorial card layout with diamond rail and rose-tinted photos

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/date';
import { EyeIcon, HeartIcon } from '../icons';
import { postPath } from '../../config/categories';
import { EmptyState } from './SearchResultsList';
import type { SectionRendererProps } from './index';

export const ThreadsList: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, getMatchCount, accent, stats }) => {
  if (posts.length === 0) return <EmptyState query={query} />;

  /* ── Default: editorial card layout ── */
  return (
    <div className="max-w-xl mx-auto">
      {posts.map((post, index) => {
        return (
          <div key={post.id} className={`listing-card thread-card ${index < posts.length - 1 ? 'border-b border-th-border pb-8 mb-8' : ''}`}>
            <div className="flex flex-col">
              <div className="flex-grow min-w-0">
                {/* Date + stats */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-xs text-th-tertiary" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>{formatDate(post.date)}</span>
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

                {/* Thumbnail (if available) */}
                {post.thumbnail && (
                  <Link to={postPath(post.category, post.id)} className="block mb-4 overflow-hidden rounded-lg">
                    <img src={post.thumbnail} alt="" className="w-full h-auto object-cover transition-opacity hover:opacity-90" loading="lazy" />
                  </Link>
                )}

                {/* Title + Description — both clickable */}
                <Link to={postPath(post.category, post.id)} className="listing-title-link thread-title-link group block mb-3">
                  <h3 className="listing-card-title thread-card-title text-lg transition-colors leading-tight mb-2" style={{ fontFamily: "'Roboto Slab', Georgia, serif", fontWeight: 400, color: 'var(--cat-threads-accent)' }}>
                    {post.displayTitle || post.title}
                  </h3>
                  <p className="text-sm text-th-secondary leading-relaxed" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>
                    {post.description}
                  </p>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
