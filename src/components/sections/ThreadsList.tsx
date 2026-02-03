// Threads section — editorial card layout with diamond rail and rose-tinted photos

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTimeline } from '../../lib/date';
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

  return (
    <div className="max-w-3xl mx-auto">
      {posts.map((post, index) => {
        const contentExcerpt = getExcerpt(post.content, query);
        const readTime = calculateReadingTime(post.content);
        const tags = post.tags || [];

        return (
          <div key={post.id} className={`thread-card ${index < posts.length - 1 ? 'border-b border-th-border pb-8 mb-8' : ''}`} style={{ '--card-accent': accent } as React.CSSProperties}>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Text — left */}
              <div className="flex-grow min-w-0">
                {/* Reading time + date */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 border border-${color}/30 text-${color} rounded-sm`}>
                    <ClockIcon /> {readTime} MIN READ
                  </span>
                  <span className="text-xs text-th-tertiary font-mono">{formatDateTimeline(post.date)}</span>
                </div>

                {/* Title + Description — both clickable */}
                <Link to={postPath(post.category, post.id)} className="thread-title-link group block mb-3">
                  <h3 className="thread-card-title text-xl font-bold text-th-primary transition-colors leading-tight mb-2">
                    <Highlight text={post.displayTitle || post.title} query={query} />
                  </h3>
                  <p className="text-sm text-th-secondary font-sans leading-relaxed">
                    <Highlight text={post.description} query={query} />
                  </p>
                </Link>

                {/* Topic pills (rose) */}
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

                {/* Search excerpt + match count */}
                {query && (() => {
                  const count = getMatchCount(post.content, query);
                  if (!contentExcerpt && count === 0) return null;
                  return (
                    <div className="mb-4 text-sm p-2.5 animate-fade-in" style={{ backgroundColor: 'var(--highlight-bg)' }}>
                      {contentExcerpt && (
                        <div className="text-th-secondary">
                          <Highlight text={contentExcerpt} query={query} />
                        </div>
                      )}
                      {count > 0 && (
                        <span className={`text-[11px] text-th-tertiary ${contentExcerpt ? 'mt-1.5' : ''} block`} style={{ color: 'var(--highlight-text)', opacity: 0.7 }}>
                          {count} {count === 1 ? 'match' : 'matches'} in document
                        </span>
                      )}
                    </div>
                  );
                })()}

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
