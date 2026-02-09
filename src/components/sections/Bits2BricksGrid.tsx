// Bits2Bricks section — grid cards (default) / compact search rows (when query active)

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/date';
import { postPath } from '../../config/categories';
import { EmptyState, SearchResultsList } from './SearchResultsList';
import type { SectionRendererProps } from './index';

export const Bits2BricksGrid: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, getMatchCount, accent }) => {
  if (posts.length === 0) return <EmptyState query={query} />;
  if (query) return <SearchResultsList posts={posts} query={query} getMatchCount={getMatchCount} accent={accent} tagAccent="#60a5fa" />;

  /* ── Default: image card grid ── */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => {
        const tags = post.tags || [];

        return (
          <Link
            key={post.id}
            to={postPath(post.category, post.id)}
            className="card-link group overflow-hidden"
          >
            {/* Square thumbnail */}
            <div className="aspect-square bg-th-surface-alt overflow-hidden">
              <img
                src={post.thumbnail || 'https://via.placeholder.com/400'}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-2.5">
              <span className="text-[11px] text-th-tertiary font-mono">{formatDate(post.date)}</span>

              <h3 className="font-bold text-base text-th-primary group-hover-accent transition-colors leading-tight line-clamp-2" style={{ '--ac-color': accent } as React.CSSProperties}>
                {post.displayTitle || post.title}
              </h3>

              <p className="text-sm text-th-secondary font-sans leading-relaxed line-clamp-2">
                {post.description}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 4).map(tag => (
                    <span key={tag} className="pill pill-sm border-blue-400/30 text-blue-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
