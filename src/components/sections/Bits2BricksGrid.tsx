// Bits2Bricks section — square image card grid

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => {
        const contentExcerpt = getExcerpt(post.content, query);
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
              {/* Date */}
              <span className="text-[11px] text-th-tertiary font-mono">{formatDateCompact(post.date)}</span>

              <h3 className={`font-bold text-base text-th-primary group-hover:text-${color} transition-colors leading-tight line-clamp-2`}>
                <Highlight text={post.displayTitle || post.title} query={query} />
              </h3>

              <p className="text-sm text-th-secondary font-sans leading-relaxed line-clamp-2">
                <Highlight text={post.description} query={query} />
              </p>

              {/* Tag pills */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 border border-slate-400/30 text-slate-400 rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Search excerpt + match count */}
              {query && (() => {
                const count = getMatchCount(post.content, query);
                if (!contentExcerpt && count === 0) return null;
                return (
                  <div className="text-xs p-2 animate-fade-in" style={{ backgroundColor: 'var(--highlight-bg)' }}>
                    {contentExcerpt && (
                      <div className="text-th-secondary">
                        <Highlight text={contentExcerpt} query={query} />
                      </div>
                    )}
                    {count > 0 && (
                      <span className={`text-[11px] text-th-tertiary ${contentExcerpt ? 'mt-1' : ''} block`} style={{ color: 'var(--highlight-text)', opacity: 0.7 }}>
                        {count} {count === 1 ? 'match' : 'matches'} in document
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
