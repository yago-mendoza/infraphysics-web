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
  allFieldNotes?: Post[];
  className?: string;
  onWikiLinkClick?: (conceptId: string) => void;
}

export const WikiContent: React.FC<WikiContentProps> = ({ html, allFieldNotes, className, onWikiLinkClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<PreviewState>(INITIAL_PREVIEW);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedHtml = useMemo(() => {
    if (!allFieldNotes) return html;
    const { html: processed } = resolveWikiLinks(html, allFieldNotes);
    return processed;
  }, [html, allFieldNotes]);

  // Kill preview on route change or content change
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

  // Keep callbacks in refs so the click handler always has the latest functions
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const onWikiLinkClickRef = useRef(onWikiLinkClick);
  onWikiLinkClickRef.current = onWikiLinkClick;

  // Track the currently hovered wiki link href + element for click navigation.
  const hoveredLinkRef = useRef<{ el: HTMLElement; href: string } | null>(null);

  // -----------------------------------------------------------------
  // Hover preview + click navigation.
  //   mouseover on a wiki-link  → show preview (once per distinct link)
  //   mouseover on anything else → schedule hide (80 ms debounce)
  //   mouseleave container       → instant hide
  //   click on a wiki-link       → navigate via React Router
  // -----------------------------------------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.wiki-ref-resolved') as HTMLElement | null;

      if (link) {
        clearHide();
        const href = link.getAttribute('href') || '';
        // Use string comparison — DOM element identity (?.el !== link) fails here
        // because setPreview triggers re-render → dangerouslySetInnerHTML recreates
        // DOM nodes → stored element reference goes stale → guard always passes →
        // infinite render loop (~150 renders/sec during hover, delays proportional
        // to hover duration). String href is stable across DOM recreations.
        const isNewLink = hoveredLinkRef.current?.href !== href;
        // Always refresh el reference — DOM nodes may be recreated on re-render
        hoveredLinkRef.current = { el: link, href };

        if (isNewLink) {
          const title = decodeURIComponent(link.getAttribute('data-title') || '');
          const address = link.getAttribute('data-address') || '';
          const description = decodeURIComponent(link.getAttribute('data-description') || '');
          setPreview({ visible: true, title, address, description, x: e.clientX, y: e.clientY });
        }
      } else {
        // Mouse is on non-link content — schedule hide
        if (!hideTimer.current) {
          hideTimer.current = setTimeout(() => {
            hoveredLinkRef.current = null;
            setPreview(INITIAL_PREVIEW);
            hideTimer.current = null;
          }, 80);
        }
      }
    };

    const onLeave = () => {
      clearHide();
      hoveredLinkRef.current = null;
      setPreview(INITIAL_PREVIEW);
    };

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a.wiki-ref-resolved') as HTMLAnchorElement | null;
      if (link) {
        e.preventDefault();
        hoveredLinkRef.current = null;
        // Preview clears via useEffect on location.pathname change
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/^\/lab\/second-brain\/(.+)$/);
          if (match && onWikiLinkClickRef.current) {
            onWikiLinkClickRef.current(match[1]);
          }
          navigateRef.current(href);
        }
      }
    };

    el.addEventListener('mouseover', onOver);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('mouseover', onOver);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('click', onClick);
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
