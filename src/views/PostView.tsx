// Post view router — delegates to ArticlePostView for all categories

import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { posts } from '../data/data';
import { ArticlePostView } from './ArticlePostView';

const HISTORY_KEY = 'infraphysics:article-history';
const MAX_HISTORY = 20;

export const PostView: React.FC = () => {
  const { category, id } = useParams();
  const post = posts.find(p => p.id === id && p.category === category);

  useEffect(() => {
    if (!post) return;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const history: { category: string; id: string }[] = raw ? JSON.parse(raw) : [];
      const filtered = history.filter(h => !(h.category === post.category && h.id === post.id));
      filtered.unshift({ category: post.category, id: post.id });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_HISTORY)));
    } catch { /* localStorage unavailable */ }
  }, [post]);

  if (!post) return (
    <div className="py-20 text-center">
      <div className="text-6xl mb-4 text-th-muted">404</div>
      <p className="text-th-tertiary">Entry not found in the archive</p>
      <Link to="/home" className="inline-block mt-6 px-4 py-2 bg-th-active text-th-heading text-sm hover:bg-th-active-hover transition-colors border border-th-border">
        Return Home
      </Link>
    </div>
  );

  return <ArticlePostView post={post} />;
};
