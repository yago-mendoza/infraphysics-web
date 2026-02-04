// Shared compact search-results rows + empty state — used by all section renderers

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/date';
import { Highlight } from '../ui';
import { postPath } from '../../config/categories';
import type { Post } from '../../types';

/* ── Empty state (shared across all sections) ── */

export const EmptyState: React.FC<{ query?: string }> = ({ query }) => (
  <div className="py-16 text-center">
    <div className="text-th-muted text-4xl mb-4">&empty;</div>
    <p className="text-th-tertiary text-sm">No entries found{query ? ` matching "${query}"` : ''}</p>
  </div>
);

/* ── Search results list ── */

export interface SearchResultsListProps {
  posts: Post[];
  query: string;
  getMatchCount: (content: string, query: string) => number;
  accent: string;       // hex color for title hover
  tagAccent: string;    // hex color for tag chip text + border
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({ posts, query, getMatchCount, accent, tagAccent }) => {
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
            <span className="text-[11px] text-th-tertiary font-mono w-14 flex-shrink-0">{formatDate(post.date)}</span>

            <div className="flex-grow min-w-0">
              <span className="text-sm text-th-primary group-hover-accent transition-colors truncate block" style={{ '--ac-color': accent } as React.CSSProperties}>
                <Highlight text={post.displayTitle || post.title} query={query} />
              </span>
              <span className="text-[11px] text-th-tertiary truncate block">
                <Highlight text={post.description} query={query} />
              </span>
            </div>

            {tags.length > 0 && (
              <div className="hidden sm:flex gap-1.5 flex-shrink-0">
                {tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="pill pill-sm"
                    style={{ borderColor: `${tagAccent}4d`, color: tagAccent }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {count > 0 && (
              <span className="text-[11px] flex-shrink-0 font-mono" style={{ color: 'var(--highlight-text)', opacity: 0.7 }}>
                {visibleMatch ? '+' : ''}{count} {count === 1 ? 'match' : 'matches'}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
};
