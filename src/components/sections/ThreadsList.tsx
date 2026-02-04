// Threads section — editorial card layout with diamond rail and rose-tinted photos

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/date';
import { calculateReadingTime } from '../../lib/content';
import { Highlight } from '../ui';
import { ClockIcon } from '../icons';
import { postPath } from '../../config/categories';
import type { SectionRendererProps } from './index';

export const ThreadsList: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, getMatchCount, color, accent }) => {
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
              <span className="text-[11px] text-th-tertiary font-mono w-14 flex-shrink-0">{formatDate(post.date)}</span>

              <div className="flex-grow min-w-0">
                <span className={`text-sm text-th-primary group-hover:text-${color} transition-colors truncate block`}>
                  <Highlight text={post.displayTitle || post.title} query={query} />
                </span>
                <span className="text-[11px] text-th-tertiary truncate block">
                  <Highlight text={post.description} query={query} />
                </span>
              </div>

              {tags.length > 0 && (
                <div className="hidden sm:flex gap-1.5 flex-shrink-0">
                  {tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 border border-slate-400/30 text-slate-400 rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

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

  /* ── Default: editorial card layout ── */
  return (
    <div className="max-w-3xl mx-auto">
      {posts.map((post, index) => {
        const readTime = calculateReadingTime(post.content);
        const tags = post.tags || [];

        return (
          <div key={post.id} className={`thread-card ${index < posts.length - 1 ? 'border-b border-th-border pb-8 mb-8' : ''}`}>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Text — left */}
              <div className="flex-grow min-w-0">
                {/* Reading time + date */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 border border-${color}/30 text-${color} rounded-sm`}>
                    <ClockIcon /> {readTime} MIN READ
                  </span>
                  <span className="text-xs text-th-tertiary font-mono">{formatDate(post.date)}</span>
                </div>

                {/* Title + Description — both clickable */}
                <Link to={postPath(post.category, post.id)} className="thread-title-link group block mb-3">
                  <h3 className="thread-card-title text-xl font-bold text-th-primary transition-colors leading-tight mb-2">
                    {post.displayTitle || post.title}
                  </h3>
                  <p className="text-sm text-th-secondary font-sans leading-relaxed">
                    {post.description}
                  </p>
                </Link>

                {/* Tag pills */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-0.5 border border-slate-400/30 text-slate-400 rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo — right, rose-tinted */}
              {post.thumbnail && (
                <Link to={postPath(post.category, post.id)} className="thread-thumb relative w-full md:w-56 h-36 overflow-hidden flex-shrink-0 self-start block">
                  <img
                    src={post.thumbnail}
                    alt=""
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
