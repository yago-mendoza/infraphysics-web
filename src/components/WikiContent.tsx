// Shared React component for rendering HTML content with wiki-link click handling

import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { resolveWikiLinks } from '../lib/wikilinks';

interface WikiContentProps {
  html: string;
  allFieldNotes: Post[];
  className?: string;
}

export const WikiContent: React.FC<WikiContentProps> = ({ html, allFieldNotes, className }) => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const resolvedHtml = useMemo(() => {
    const { html: processed } = resolveWikiLinks(html, allFieldNotes);
    return processed;
  }, [html, allFieldNotes]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.wiki-ref');
      if (link) {
        const href = link.getAttribute('href');
        if (href) {
          e.preventDefault();
          navigate(href);
        }
      }
    };

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [navigate]);

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: resolvedHtml }}
    />
  );
};
