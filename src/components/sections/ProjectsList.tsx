// Projects section — single-column timeline with L-corner photos

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTimeline } from '../../lib/date';
import { Highlight, StatusBadge } from '../ui';
import { GitHubIcon, ExternalLinkIcon } from '../icons';
import { postPath } from '../../config/categories';
import type { SectionRendererProps } from './index';

const STATUS_LABELS: Record<string, string> = {
  'active': 'ONGOING',
  'in-progress': 'ONGOING',
  'completed': 'FINISHED',
  'archived': 'ARCHIVED',
};

export const ProjectsList: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, color }) => {
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
        const techs = post.technologies || [];
        const statusLabel = post.status ? STATUS_LABELS[post.status] || post.status.toUpperCase() : null;

        return (
          <div key={post.id} className="relative flex gap-5">
            {/* Timeline rail */}
            <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-6">
              {/* Line above node */}
              {index > 0 && <div className="w-px flex-grow bg-th-border" />}
              {index === 0 && <div className="flex-grow" />}
              {/* Node */}
              <div className={`w-3 h-3 rounded-full border-2 border-${color} bg-th-base flex-shrink-0`} />
              {/* Line below node */}
              {index < posts.length - 1 && <div className="w-px flex-grow bg-th-border" />}
              {index === posts.length - 1 && <div className="flex-grow" />}
            </div>

            {/* Card content */}
            <div className={`flex-grow pb-8 ${index === posts.length - 1 ? 'pb-0' : ''}`}>
              <div className="flex flex-col md:flex-row gap-5">
                {/* Photo */}
                {post.thumbnail && (
                  <Link to={postPath(post.category, post.id)} className="flex-shrink-0">
                    <div className="w-full md:w-56 h-56 overflow-hidden">
                      <img
                        src={post.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                )}

                {/* Text */}
                <div className="flex-grow min-w-0">
                  {/* Status + date */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {post.status && <StatusBadge status={post.status} label={statusLabel || undefined} />}
                    <span className="text-[11px] text-th-tertiary font-mono">{formatDateTimeline(post.date)}</span>
                  </div>

                  {/* Title */}
                  <Link to={postPath(post.category, post.id)} className="group">
                    <h3 className={`text-xl font-bold uppercase tracking-wide text-th-primary group-hover:text-${color} transition-colors leading-tight mb-2`}>
                      <Highlight text={post.displayTitle || post.title} query={query} />
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-sm text-th-secondary font-sans leading-relaxed mb-3 line-clamp-3">
                    <Highlight text={post.description} query={query} />
                  </p>

                  {/* Tech pills */}
                  {techs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {techs.map(tech => (
                        <span key={tech} className={`text-[11px] px-2 py-0.5 border border-${color}/30 text-${color} rounded-sm`}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search excerpt */}
                  {contentExcerpt && (
                    <div className="mb-3 text-xs text-th-secondary p-2 border-l-2" style={{ backgroundColor: 'var(--highlight-bg)', borderColor: 'var(--highlight-text)' }}>
                      <Highlight text={contentExcerpt} query={query} />
                    </div>
                  )}

                  {/* Divider + links */}
                  <div className="border-t border-th-border pt-3 flex items-center gap-4 text-xs">
                    {post.github && (
                      <a
                        href={post.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-th-tertiary hover:text-th-heading transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        <GitHubIcon /> GitHub
                      </a>
                    )}
                    <Link
                      to={postPath(post.category, post.id)}
                      className={`inline-flex items-center gap-1.5 text-th-tertiary hover:text-${color} transition-colors`}
                    >
                      <ExternalLinkIcon /> Case Study
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
