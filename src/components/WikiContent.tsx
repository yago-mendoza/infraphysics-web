// Shared React component for rendering HTML content with wiki-link click handling + hover preview

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<PreviewState>(INITIAL_PREVIEW);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedHtml = useMemo(() => {
    const { html: processed } = resolveWikiLinks(html, allFieldNotes);
    return processed;
  }, [html, allFieldNotes]);

  // Kill preview on route change, content change, or scroll
  useEffect(() => {
    setPreview(INITIAL_PREVIEW);
  }, [location.pathname, html]);

  useEffect(() => {
    const kill = () => setPreview(INITIAL_PREVIEW);
    window.addEventListener('scroll', kill, true);
    return () => window.removeEventListener('scroll', kill, true);
  }, []);

  const clearHide = useCallback(() => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  // -----------------------------------------------------------------
  // Global document-level click handler for wiki-links.
  // Attached to `document` so it fires regardless of React's
  // synthetic event system or stopPropagation in the tree.
  // -----------------------------------------------------------------
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.wiki-ref-resolved') as HTMLAnchorElement | null;
      if (!link) return;

      // Only handle links inside our container
      if (!containerRef.current || !containerRef.current.contains(link)) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      const href = link.getAttribute('href');
      if (href) {
        setPreview(INITIAL_PREVIEW);
        clearHide();
        navigate(href);
      }
    };

    document.addEventListener('click', onClick, true); // capture phase
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate, clearHide]);

  // -----------------------------------------------------------------
  // Hover preview via native listeners on the container.
  // mouseover/mouseout bubble naturally through dangerouslySetInnerHTML.
  // -----------------------------------------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.wiki-ref-resolved') as HTMLElement | null;
      if (!link) return;

      clearHide();

      const title = decodeURIComponent(link.getAttribute('data-title') || '');
      const address = link.getAttribute('data-address') || '';
      const description = decodeURIComponent(link.getAttribute('data-description') || '');

      setPreview({ visible: true, title, address, description, x: e.clientX, y: e.clientY });
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement | null;
      const link = target.closest('a.wiki-ref-resolved');
      if (!link) return;

      // Only hide when mouse actually leaves the link (not moving to child/icon)
      if (!related || !link.contains(related)) {
        clearHide();
        hideTimer.current = setTimeout(() => setPreview(INITIAL_PREVIEW), 80);
      }
    };

    el.addEventListener('mouseover', onOver);
    el.addEventListener('mouseout', onOut);
    return () => {
      el.removeEventListener('mouseover', onOver);
      el.removeEventListener('mouseout', onOut);
      clearHide();
    };
  }, [clearHide]);

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: resolvedHtml }}
      />
      <WikiLinkPreview {...preview} />
    </>
  );
};
