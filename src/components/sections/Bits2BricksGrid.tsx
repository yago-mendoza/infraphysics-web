// Bits2Bricks section — square image card grid

import React from 'react';
import { Link } from 'react-router-dom';
import { Highlight } from '../ui';
import { ArrowRightIcon } from '../icons';
import { postPath } from '../../config/categories';
import type { SectionRendererProps } from './index';

export const Bits2BricksGrid: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, color }) => {
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
        const pills = [...(post.technologies || []), ...(post.tags || [])];

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
            <div className="p-4 space-y-3">
              <h3 className={`font-bold text-base text-th-primary group-hover:text-${color} transition-colors leading-tight line-clamp-2`}>
                <Highlight text={post.displayTitle || post.title} query={query} />
              </h3>

              <p className="text-sm text-th-secondary font-sans leading-relaxed line-clamp-2">
                <Highlight text={post.description} query={query} />
              </p>

              {/* Hashtag pills */}
              {pills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {pills.slice(0, 4).map(tag => (
                    <span key={tag} className={`text-[11px] text-${color}`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Search excerpt */}
              {contentExcerpt && (
                <div className="text-xs text-th-secondary p-2 border-l-2" style={{ backgroundColor: 'var(--highlight-bg)', borderColor: 'var(--highlight-text)' }}>
                  <Highlight text={contentExcerpt} query={query} />
                </div>
              )}

              {/* CTA */}
              <span className={`inline-flex items-center gap-1.5 text-xs text-${color} font-medium`}>
                Start Learning <ArrowRightIcon />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
