// Article context — bridges article data up to SearchPalette and global shortcuts

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Post } from '../types';

interface HeadingInfo {
  level: number;
  text: string;
  id: string;
  number: string;
  depth: number;
}

export interface ArticleState {
  post: Post;
  headings: HeadingInfo[];
  activeHeadingId: string;
  nextPost: Post | null;
  prevPost: Post | null;
}

interface ArticleContextType {
  article: ArticleState | null;
  setArticleState: (state: ArticleState) => void;
  clearArticleState: () => void;
  updateActiveHeading: (id: string) => void;
}

const ArticleContext = createContext<ArticleContextType>({
  article: null,
  setArticleState: () => {},
  clearArticleState: () => {},
  updateActiveHeading: () => {},
});

export const useArticleContext = () => useContext(ArticleContext);

export const ArticleContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [article, setArticle] = useState<ArticleState | null>(null);

  const setArticleState = useCallback((state: ArticleState) => {
    setArticle(state);
  }, []);

  const clearArticleState = useCallback(() => {
    setArticle(null);
  }, []);

  const updateActiveHeading = useCallback((id: string) => {
    setArticle(prev => prev ? { ...prev, activeHeadingId: id } : null);
  }, []);

  return (
    <ArticleContext.Provider value={{ article, setArticleState, clearArticleState, updateActiveHeading }}>
      {children}
    </ArticleContext.Provider>
  );
};
