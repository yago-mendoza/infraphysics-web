// Shared React component for rendering HTML content with wiki-link click handling + hover preview

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { resolveWikiLinks } from '../lib/wikilinks';
import { WikiLinkPreview } from './WikiLinkPreview';

interface PreviewState {
  visible: boolean;
  title: string;
  address: string;
  description: string;
  x: number;
  y: number;
}

const INITIAL_PREVIEW: PreviewState = {
  visible: false,
  title: '',
  address: '',
  description: '',
  x: 0,
  y: 0,
};

interface WikiContentProps {
  html: string;
  allFieldNotes: Post[];
  className?: string;
}

export const WikiContent: React.FC<WikiContentProps> = ({ html, allFieldNotes, className }) => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<PreviewState>(INITIAL_PREVIEW);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedHtml = useMemo(() => {
    const { html: processed } = resolveWikiLinks(html, allFieldNotes);
    return processed;
  }, [html, allFieldNotes]);

  const showPreview = useCallback((link: Element, e: MouseEvent) => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }

    const title = decodeURIComponent(link.getAttribute('data-title') || '');
    const address = link.getAttribute('data-address') || '';
    const description = decodeURIComponent(link.getAttribute('data-description') || '');

    setPreview({
      visible: true,
      title,
      address,
      description,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const hidePreview = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      setPreview(INITIAL_PREVIEW);
    }, 100);
  }, []);

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

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.wiki-ref-resolved');
      if (link) showPreview(link, e);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.wiki-ref-resolved');
      if (link) hidePreview();
    };

    el.addEventListener('click', handleClick);
    el.addEventListener('mouseenter', handleMouseEnter, true);
    el.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      el.removeEventListener('click', handleClick);
      el.removeEventListener('mouseenter', handleMouseEnter, true);
      el.removeEventListener('mouseleave', handleMouseLeave, true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [navigate, showPreview, hidePreview]);

  return (
    <>
      <div
        ref={contentRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: resolvedHtml }}
      />
      <WikiLinkPreview {...preview} />
    </>
  );
};
