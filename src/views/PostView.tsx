// Post view router — delegates to ArticlePostView for all categories

import React, { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { contentRoutes } from '../lib/contentRoutes';
import { posts } from '../data/data';
import { ArticlePostView } from './ArticlePostView';
import { ErrorConceptView } from './ErrorConceptView';

const HISTORY_KEY = 'infraphysics:article-history';
const MAX_HISTORY = 20;

export const PostView: React.FC = () => {
  const { category } = useParams();
  const location = useLocation();
  const route = contentRoutes.resolve(location.pathname);
  const post = posts.find(p => p.id === route?.id && p.category === category);

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

  if (!post) return <ErrorConceptView />;

  if (location.pathname !== route.canonical) return <Navigate to={route.canonical + location.search + location.hash} replace />;
  return <ArticlePostView post={post} />;
};
