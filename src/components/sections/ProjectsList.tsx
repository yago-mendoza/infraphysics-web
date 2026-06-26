// Projects section — single-column timeline with L-corner photos

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTimeline } from '../../lib/date';
import { Highlight, StatusBadge } from '../ui';
import { EyeIcon, HeartIcon } from '../icons';
import { postPath, STATUS_CONFIG } from '../../config/categories';
import { ComplexityBar } from '../ui';
import type { ArticleStats } from '../../hooks/useArticleStats';
import { EmptyState } from './SearchResultsList';
import type { SectionRendererProps } from './index';

export const ProjectsList: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, getMatchCount, accent, stats }) => {
  if (posts.length === 0) return <EmptyState query={query} />;

  return (
    <div className="max-w-3xl mx-auto">
      {posts.map((post, index) => {
        const contentExcerpt = getExcerpt(post.content, query);
        const techs = post.technologies || [];
        const statusLabel = post.status ? (STATUS_CONFIG[post.status]?.label || post.status.toUpperCase()) : null;

        return (
          <div key={post.id} className="listing-card project-card relative flex gap-6">
            {/* Timeline rail */}
            <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-7">
              {/* Line above node — brightens toward the node */}
              {index > 0
                ? <div className="w-px flex-grow" style={{ background: `linear-gradient(to bottom, color-mix(in srgb, ${accent} 6%, transparent), color-mix(in srgb, ${accent} 40%, transparent))` }} />
                : <div className="flex-grow" />}
              {/* Node — glowing accent core, halo, and ring */}
              <div className="relative flex items-center justify-center flex-shrink-0 my-2">
                <span className="absolute rounded-full" style={{ width: 20, height: 20, background: accent, opacity: 0.12, filter: 'blur(5px)' }} />
                <span className="absolute rounded-full" style={{ width: 13, height: 13, border: `1px solid ${accent}`, opacity: 0.45 }} />
                <span className="rounded-full" style={{ width: 7, height: 7, background: accent, boxShadow: `0 0 7px ${accent}` }} />
              </div>
              {/* Line below node — fades away from the node */}
              {index < posts.length - 1
                ? <div className="w-px flex-grow" style={{ background: `linear-gradient(to bottom, color-mix(in srgb, ${accent} 40%, transparent), color-mix(in srgb, ${accent} 6%, transparent))` }} />
                : <div className="flex-grow" />}
            </div>

            {/* Card content */}
            <div className={`flex-grow pb-10 ${index === posts.length - 1 ? 'pb-0' : ''}`}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Photo */}
                {post.thumbnail && (
                  <Link to={postPath(post.category, post.id)} className="listing-thumb listing-title-link project-thumb relative w-full md:w-72 h-64 overflow-hidden flex-shrink-0 self-start block">
                    <img
                      src={post.thumbnail}
                      alt={post.displayTitle || post.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    {post.complexity != null && (
                      <span className="absolute top-2 right-2 px-1.5 py-1 backdrop-blur-sm rounded-sm" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                        <ComplexityBar value={post.complexity} category={post.category} />
                      </span>
                    )}
                  </Link>
                )}

                {/* Text */}
                <div className="flex-grow min-w-0">
                  {/* Status + date + stats */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {post.status && <StatusBadge status={post.status} label={statusLabel || undefined} />}
                    <span className="text-xs text-th-tertiary font-mono">{formatDateTimeline(post.date)}</span>
                    {(() => {
                      const s = stats?.[postPath(post.category, post.id)];
                      if (!s) return null;
                      return (
                        <span className="inline-flex items-center gap-3 text-xs text-th-tertiary font-mono">
                          {s.views > 0 && <span className="inline-flex items-center gap-1"><EyeIcon size={12} /> {s.views}</span>}
                          {s.hearts > 0 && <span className="inline-flex items-center gap-1"><HeartIcon size={12} /> {s.hearts}</span>}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Title */}
                  <Link to={postPath(post.category, post.id)} className="group listing-title-link">
                    <h3 className="listing-card-title text-xl font-bold tracking-wide text-th-primary transition-colors leading-tight mb-3">
                      <Highlight text={post.displayTitle || post.title} query={query} />
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-sm text-th-secondary font-sans leading-relaxed mb-4 line-clamp-3">
                    <Highlight text={post.description} query={query} />
                  </p>

                  {/* Pills — topics (purple) + technologies (lime), sorted alphabetically */}
                  {(() => {
                    const topics = (post.tags || []).map(t => ({ label: t, type: 'topic' as const }));
                    const technologies = techs.map(t => ({ label: t, type: 'tech' as const }));
                    const pills = [...topics, ...technologies].sort((a, b) => a.label.localeCompare(b.label));
                    if (pills.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pills.map(pill => (
                          <span
                            key={`${pill.type}-${pill.label}`}
                            className={`pill ${pill.type === 'tech' ? 'pill-tech' : ''}`}
                            style={pill.type === 'topic'
                              ? { borderColor: 'var(--pill-topic-border)', color: 'var(--pill-topic-text)' }
                              : undefined
                            }
                          >
                            {pill.label}
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Search excerpt + match count */}
                  {query && (() => {
                    const count = getMatchCount(post.content, query);
                    if (!contentExcerpt && count === 0) return null;
                    const lq = query.toLowerCase();
                    const visibleMatch = (post.displayTitle || post.title).toLowerCase().includes(lq) || post.description.toLowerCase().includes(lq);
                    return (
                      <div className="mb-4 text-sm p-2.5 animate-fade-in" style={{ backgroundColor: 'var(--highlight-bg)' }}>
                        {contentExcerpt && (
                          <div className="text-th-secondary">
                            <Highlight text={contentExcerpt} query={query} />
                          </div>
                        )}
                        {count > 0 && (
                          <span className={`text-[11px] text-th-tertiary ${contentExcerpt ? 'mt-1.5' : ''} block`} style={{ color: 'var(--highlight-text)', opacity: 0.7 }}>
                            {visibleMatch ? '+' : ''}{count} {count === 1 ? 'match' : 'matches'} in document
                          </span>
                        )}
                      </div>
                    );
                  })()}

                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
