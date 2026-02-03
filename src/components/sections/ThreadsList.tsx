// Threads section — minimal editorial layout, no borders

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib';
import { Highlight } from '../ui';
import { postPath } from '../../config/categories';
import type { SectionRendererProps } from './index';

export const ThreadsList: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, color }) => {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-th-muted text-4xl mb-4">&empty;</div>
        <p className="text-th-tertiary text-sm">No entries found{query ? ` matching "${query}"` : ''}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {posts.map((post, index) => {
        const contentExcerpt = getExcerpt(post.content, query);
        const pills = post.tags || [];

        return (
          <Link
            key={post.id}
            to={postPath(post.category, post.id)}
            className={`group block py-6 ${index < posts.length - 1 ? 'border-b border-th-border' : ''}`}
          >
            <div className="flex gap-5">
              {/* Text content */}
              <div className="flex-grow min-w-0">
                <h3 className={`font-bold text-lg text-th-primary group-hover:text-${color} transition-colors leading-tight mb-1.5`}>
                  <Highlight text={post.displayTitle || post.title} query={query} />
                </h3>

                <span className="text-xs text-th-tertiary">{formatDate(post.date)}</span>

                <p className="mt-2 text-sm text-th-secondary font-sans leading-relaxed line-clamp-3">
                  <Highlight text={post.description} query={query} />
                </p>

                {/* Topic pills */}
                {pills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {pills.slice(0, 4).map(tag => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 bg-th-elevated text-th-secondary rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Search excerpt */}
                {contentExcerpt && (
                  <div className="mt-3 text-xs text-th-secondary p-2 border-l-2" style={{ backgroundColor: 'var(--highlight-bg)', borderColor: 'var(--highlight-text)' }}>
                    <Highlight text={contentExcerpt} query={query} />
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              {post.thumbnail && (
                <div className="hidden sm:block flex-shrink-0 w-40 h-40 overflow-hidden rounded-sm">
                  <img
                    src={post.thumbnail}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
