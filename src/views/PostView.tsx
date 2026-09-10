// Post view router — delegates to ArticlePostView for all categories

import React, { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { contentRoutes } from '../lib/contentRoutes';
import { posts } from '../data/data';
import { useLang } from '../contexts/LangContext';
import { ArticlePostView } from './ArticlePostView';
import { ErrorConceptView } from './ErrorConceptView';
import type { Post } from '../types';

const HISTORY_KEY = 'infraphysics:article-history';
const MAX_HISTORY = 20;

export const PostView: React.FC = () => {
  const { category } = useParams();
  const location = useLocation();
  const { lang: preferred } = useLang();
  const route = contentRoutes.resolve(location.pathname) as (ReturnType<typeof contentRoutes.resolve> & { lang?: string }) | undefined;
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

  // The url says which version is on screen. The preference only steps in on the English url of a
  // page that also exists in the preferred language: then the reader lands on that version.
  const translation = post.translations?.[preferred];
  if (!route.lang && preferred !== 'en' && translation) {
    return <Navigate to={`/${preferred}${route.canonical}${location.search}${location.hash}`} replace />;
  }
  const onScreen: Post = route.lang && post.translations?.[route.lang]
    ? { ...post, ...post.translations[route.lang], content: post.translations[route.lang].content || post.content, lang: route.lang }
    : { ...post, lang: post.lang || 'en' };
  return <ArticlePostView post={onScreen} />;
};
