// Bits2Bricks section — grid cards (default) / compact search rows (when query active)

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateCompact } from '../../lib/date';
import { Highlight } from '../ui';
import { postPath } from '../../config/categories';
import type { SectionRendererProps } from './index';

export const Bits2BricksGrid: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, getMatchCount, color }) => {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-th-muted text-4xl mb-4">&empty;</div>
        <p className="text-th-tertiary text-sm">No entries found{query ? ` matching "${query}"` : ''}</p>
      </div>
    );
  }

  /* ── Search mode: compact horizontal rows ── */
  if (query) {
    return (
      <div className="max-w-3xl mx-auto divide-y divide-th-border">
        {posts.map(post => {
          const count = getMatchCount(post.content, query);
          const tags = post.tags || [];
          const lq = query.toLowerCase();
          const visibleMatch = (post.displayTitle || post.title).toLowerCase().includes(lq) || post.description.toLowerCase().includes(lq);

          return (
            <Link
              key={post.id}
              to={postPath(post.category, post.id)}
              className={`group flex items-center gap-4 py-3 px-2 hover:bg-th-surface-alt transition-colors`}
            >
              {/* Date */}
              <span className="text-[11px] text-th-tertiary font-mono w-14 flex-shrink-0">{formatDateCompact(post.date)}</span>

              {/* Title + Description */}
              <div className="flex-grow min-w-0">
                <span className={`text-sm text-th-primary group-hover:text-${color} transition-colors truncate block`}>
                  <Highlight text={post.displayTitle || post.title} query={query} />
                </span>
                <span className="text-[11px] text-th-tertiary truncate block">
                  <Highlight text={post.description} query={query} />
                </span>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="hidden sm:flex gap-1.5 flex-shrink-0">
                  {tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 border border-blue-400/30 text-blue-400 rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Match count */}
              {count > 0 && (
                <span className="text-[11px] text-th-tertiary flex-shrink-0 font-mono" style={{ color: 'var(--highlight-text)', opacity: 0.7 }}>
                  {visibleMatch ? '+' : ''}{count} {count === 1 ? 'match' : 'matches'}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  /* ── Default: image card grid ── */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => {
        const tags = post.tags || [];

        return (
          <Link
            key={post.id}
            to={postPath(post.category, post.id)}
            className="group block border border-th-border rounded-sm bg-th-surface overflow-hidden hover:border-th-border-hover hover:bg-th-surface-alt transition-all"
          >
            {/* Square thumbnail */}
            <div className="aspect-square bg-th-surface-alt overflow-hidden">
              <img
                src={post.thumbnail || 'https://via.placeholder.com/400'}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-2.5">
              <span className="text-[11px] text-th-tertiary font-mono">{formatDateCompact(post.date)}</span>

              <h3 className={`font-bold text-base text-th-primary group-hover:text-${color} transition-colors leading-tight line-clamp-2`}>
                {post.displayTitle || post.title}
              </h3>

              <p className="text-sm text-th-secondary font-sans leading-relaxed line-clamp-2">
                {post.description}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 border border-blue-400/30 text-blue-400 rounded-sm">
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
