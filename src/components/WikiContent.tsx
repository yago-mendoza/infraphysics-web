// Renders HTML content with wiki-link hover preview and click navigation.

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldNoteMeta } from '../types';
import { resolveWikiLinks } from '../lib/wikilinks';
import { WikiLinkPreview } from './WikiLinkPreview';

interface PreviewState {
  visible: boolean;
  title: string;
  address: string;
  description: string;
  x: number;
  y: number;
  variant: 'default' | 'blue';
}

const INITIAL_PREVIEW: PreviewState = {
  visible: false,
  title: '',
  address: '',
  description: '',
  x: 0,
  y: 0,
  variant: 'default',
};

interface WikiContentProps {
  html: string;
  allFieldNotes?: FieldNoteMeta[];
  className?: string;
  onWikiLinkClick?: (conceptId: string) => void;
  isVisited?: (noteId: string) => boolean;
}

export const WikiContent: React.FC<WikiContentProps> = ({ html, allFieldNotes, className, onWikiLinkClick, isVisited }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<PreviewState>(INITIAL_PREVIEW);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Two resolution modes:
  //   1. Article context: allFieldNotes provided → resolves wiki-links client-side
  //   2. Second Brain context: allFieldNotes omitted → html already pre-resolved by fetchNoteContent()
  const resolvedHtml = useMemo(() => {
    if (!allFieldNotes) return html;
    const { html: processed } = resolveWikiLinks(html, allFieldNotes);
    return processed;
  }, [html, allFieldNotes]);

  // Kill preview on route change or content change
  useEffect(() => {
    setPreview(INITIAL_PREVIEW);
  }, [location.pathname, html]);

  // CSS rules for visited wiki-links — attribute selectors survive dangerouslySetInnerHTML
  // DOM recreation. Previous approach (useEffect adding .wiki-ref-visited class) caused a
  // 1-frame purple flash because the class was stripped on re-render then re-added next frame.
  const visitedStyles = useMemo(() => {
    if (!isVisited) return '';
    const hrefRegex = /href="\/lab\/second-brain\/([^"]+)"/g;
    const selectors: string[] = [];
    const seen = new Set<string>();
    let m;
    while ((m = hrefRegex.exec(resolvedHtml)) !== null) {
      const noteId = m[1];
      if (!seen.has(noteId) && isVisited(noteId)) {
        seen.add(noteId);
        selectors.push(`a.wiki-ref-resolved[href="/lab/second-brain/${noteId}"]`);
      }
    }
    if (selectors.length === 0) return '';
    return `${selectors.join(',\n')} { --wiki-link: rgba(96, 165, 250, 0.85); --wiki-link-hover: rgba(96, 165, 250, 1); }`;
  }, [resolvedHtml, isVisited]);

  useEffect(() => {
    const kill = () => setPreview(INITIAL_PREVIEW);
    window.addEventListener('scroll', kill, true);
    return () => window.removeEventListener('scroll', kill, true);
  }, []);

  const clearHide = useCallback(() => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  // Keep callbacks in refs so event handlers always have the latest functions
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const onWikiLinkClickRef = useRef(onWikiLinkClick);
  onWikiLinkClickRef.current = onWikiLinkClick;
  const isVisitedRef = useRef(isVisited);
  isVisitedRef.current = isVisited;

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
          const address = decodeURIComponent(link.getAttribute('data-address') || '');
          const description = decodeURIComponent(link.getAttribute('data-description') || '');
          const hrefMatch = href.match(/^\/lab\/second-brain\/(.+)$/);
          const visited = hrefMatch ? !!isVisitedRef.current?.(hrefMatch[1]) : false;
          setPreview({ visible: true, title, address, description, x: e.clientX, y: e.clientY, variant: visited ? 'blue' : 'default' });
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
      // Copy button (shared class for code blocks + blockquotes)
      const copyBtn = (e.target as HTMLElement).closest('.copy-btn') as HTMLButtonElement | null;
      if (copyBtn) {
        const svgIcon = copyBtn.querySelector('svg')?.outerHTML || '';
        const terminal = copyBtn.closest('.code-terminal');
        const text = terminal ? (terminal.querySelector('code')?.textContent || '') : '';
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = `${svgIcon} Copied`;
          copyBtn.classList.add('copied');
          setTimeout(() => { copyBtn.innerHTML = `${svgIcon} Copy`; copyBtn.classList.remove('copied'); }, 1500);
        }).catch(() => {
          copyBtn.innerHTML = `${svgIcon} Error`;
          setTimeout(() => { copyBtn.innerHTML = `${svgIcon} Copy`; }, 1500);
        });
        return;
      }

      // Wiki links
      const link = (e.target as HTMLElement).closest('a.wiki-ref-resolved') as HTMLAnchorElement | null;
      if (link) {
        e.preventDefault();
        hoveredLinkRef.current = null;
        // Track wiki-link clicks for retention hints
        try {
          const c = parseInt(localStorage.getItem('infraphysics:wikilink-clicks') || '0', 10);
          localStorage.setItem('infraphysics:wikilink-clicks', String(c + 1));
        } catch {}
        const href = link.getAttribute('href');
        if (href) {
          if (onWikiLinkClickRef.current) {
            // Second Brain context — trail management + same-tab navigation
            const match = href.match(/^\/lab\/second-brain\/(.+)$/);
            if (match) onWikiLinkClickRef.current(match[1]);
            navigateRef.current(href);
          } else {
            // Article context — open in new tab
            window.open(href, '_blank');
          }
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
      {visitedStyles && <style>{visitedStyles}</style>}
      <div
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: resolvedHtml }}
      />
      <WikiLinkPreview {...preview} />
    </>
  );
};
