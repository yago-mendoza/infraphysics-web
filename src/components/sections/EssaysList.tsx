import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTimeline } from '../../lib/date';
import { Highlight } from '../ui';
import { postPath } from '../../config/categories';
import { EmptyState } from './SearchResultsList';
import type { SectionRendererProps } from './index';

export const EssaysList: React.FC<SectionRendererProps> = ({ posts, query, getExcerpt, getMatchCount }) => {
  if (posts.length === 0) return <EmptyState query={query} />;
  return <div className="essays-editorial-matrix">{posts.map((post, index) => {
    const excerpt = getExcerpt(post.content, query);
    const matches = query ? getMatchCount(post.content, query) : 0;
    return <article key={post.id} className="group"><Link to={postPath(post.category, post.id)}>
      <span className="essays-editorial-image" style={post.thumbnailZoom ? { '--thumb-zoom': post.thumbnailZoom } as React.CSSProperties : undefined}>{post.thumbnail ? <img src={post.thumbnail} alt="" loading="lazy" /> : <i>E/{String(index + 1).padStart(2, '0')}</i>}<b>{String(index + 1).padStart(2, '0')}</b></span>
      <span className="essays-editorial-copy"><span><time>{formatDateTimeline(post.date)}</time><i>{[post.lang || 'en', ...Object.keys(post.translations || {})].join('/')}</i></span><strong><Highlight text={post.displayTitle || post.title} query={query} /></strong><small><Highlight text={excerpt || post.description} query={query} />{matches > 0 && ` · ${matches} matches`}</small></span>
      <span className="essays-editorial-arrow">↗</span>
    </Link></article>;
  })}</div>;
};
