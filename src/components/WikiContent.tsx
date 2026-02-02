// Renders HTML content with wiki-link hover preview and click navigation.

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
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
  // Hover preview. One event does everything:
  //   mouseover on a wiki-link  → show preview
  //   mouseover on anything else → schedule hide (80 ms debounce)
  //   mouseleave container       → instant hide
  // No mouseout / relatedTarget gymnastics needed.
  // -----------------------------------------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.wiki-ref-resolved') as HTMLElement | null;

      if (link) {
        // Mouse entered a wiki-link — show / update preview
        clearHide();
        const title = decodeURIComponent(link.getAttribute('data-title') || '');
        const address = link.getAttribute('data-address') || '';
        const description = decodeURIComponent(link.getAttribute('data-description') || '');
        setPreview({ visible: true, title, address, description, x: e.clientX, y: e.clientY });
      } else {
        // Mouse is on non-link content — schedule hide
        if (!hideTimer.current) {
          hideTimer.current = setTimeout(() => {
            setPreview(INITIAL_PREVIEW);
            hideTimer.current = null;
          }, 80);
        }
      }
    };

    const onLeave = () => {
      clearHide();
      setPreview(INITIAL_PREVIEW);
    };

    el.addEventListener('mouseover', onOver);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseover', onOver);
      el.removeEventListener('mouseleave', onLeave);
      clearHide();
    };
  }, [clearHide]);

  // Navigate via React Router when a resolved wiki-link is clicked.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a.wiki-ref-resolved') as HTMLAnchorElement | null;
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) navigate(href);
      }
    };

    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [navigate]);

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
