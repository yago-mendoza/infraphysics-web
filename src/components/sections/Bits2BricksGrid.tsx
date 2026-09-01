import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTimeline } from '../../lib/date';
import { postPath } from '../../config/categories';
import { EmptyState, SearchResultsList } from './SearchResultsList';
import type { SectionRendererProps } from './index';

export const Bits2BricksGrid: React.FC<SectionRendererProps> = ({ posts, query, getMatchCount, accent }) => {
  if (posts.length === 0) return <EmptyState query={query} />;
  if (query) return <SearchResultsList posts={posts} query={query} getMatchCount={getMatchCount} accent={accent} tagAccent={accent} />;
  return <div className="bits-research-wall">{posts.map((post, index) => <article key={post.id} className="group"><Link to={postPath(post.category, post.id)}>
    <span className="bits-wall-image">{post.thumbnail ? <img src={post.thumbnail} alt="" loading="lazy" /> : <i>B/{String(index + 1).padStart(2, '0')}</i>}<b>{String(index + 1).padStart(2, '0')}</b></span>
    <span className="bits-wall-copy"><span><time>{formatDateTimeline(post.date)}</time><i>technical</i></span><strong>{post.displayTitle || post.title}</strong><small>{post.description}</small></span>
    <span className="bits-wall-tags">{(post.tags || []).slice(0, 3).map(tag => <i key={tag}>{tag}</i>)}</span>
    <span className="bits-wall-arrow">↗</span>
  </Link></article>)}</div>;
};
