// Renders HTML content with wiki-link hover preview and click navigation.

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldNoteMeta } from '../types';
import { resolveWikiLinks } from '../lib/wikilinks';
import { secondBrainUidFromPath } from '../config/categories';
import { WikiLinkPreview } from './WikiLinkPreview';
import '../styles/editorial-primitives.css';

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

const HEADING_LINK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

function withHeadingLinks(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(/<(h[1-5])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (match, tag, attrs = '', inner) => {
    if (/heading-anchor-link/.test(inner)) return match;
    const plain = inner.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
    let slug = plain.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/(^-|-$)/g, '') || 'section';
    const count = seen.get(slug) || 0;
    seen.set(slug, count + 1);
    if (count) slug = `${slug}-${count}`;
    const existingId = attrs.match(/\sid="([^"]+)"/)?.[1];
    const id = existingId || `section-${slug}`;
    const nextAttrs = existingId ? attrs : `${attrs} id="${id}"`;
    const label = plain.replace(/"/g, '&quot;');
    return `<${tag}${nextAttrs}><button class="heading-anchor-link" type="button" data-heading-id="${id}" aria-label="Copy link to ${label}">${HEADING_LINK_ICON}</button>${inner}</${tag}>`;
  });
}

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
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Two resolution modes:
  //   1. Article context: allFieldNotes provided → resolves wiki-links client-side
  //   2. Second Brain context: allFieldNotes omitted → html already pre-resolved by fetchNoteContent()
  const resolvedHtml = useMemo(() => {
    if (!allFieldNotes) return withHeadingLinks(html);
    const { html: processed } = resolveWikiLinks(html, allFieldNotes);
    return withHeadingLinks(processed);
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
    const hrefRegex = /href="((?:\/wiki|\/lab\/second-brain)\/([^"]+))"/g;
    const selectors: string[] = [];
    const seen = new Set<string>();
    let m;
    while ((m = hrefRegex.exec(resolvedHtml)) !== null) {
      const href = m[1];
      const noteId = m[2];
      if (!seen.has(noteId) && isVisited(noteId)) {
        seen.add(noteId);
        selectors.push(`a.wiki-ref-resolved[href="${href}"]`);
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

  useEffect(() => {
    document.documentElement.classList.toggle('editorial-lightbox-open', !!lightbox);
    if (!lightbox) return () => document.documentElement.classList.remove('editorial-lightbox-open');
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setLightbox(null); };
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.documentElement.classList.remove('editorial-lightbox-open');
    };
  }, [lightbox]);

  // Break out only primitives that would otherwise need horizontal scrolling.
  // The class is measured from their real rendered content, not guessed by type.
  useEffect(() => {
    const root: HTMLDivElement | null = containerRef.current;
    if (!root) return;
    const measure = () => {
      const wiki = !!root.closest('.article-wiki');
      root.querySelectorAll<HTMLElement>('.code-terminal, .table-wrapper').forEach(node => {
        if (wiki) { node.classList.remove('is-wide'); return; }
        node.classList.remove('is-wide');
        const content = node.matches('.code-terminal')
          ? node.querySelector<HTMLElement>('pre')
          : node.querySelector<HTMLElement>('table');
        if (content && content.scrollWidth > node.clientWidth + 2) node.classList.add('is-wide');
      });
    };
    const frame = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [resolvedHtml]);

  const clearHide = useCallback(() => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  // Keep callbacks in refs so event handlers always have the latest functions
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
          const address = decodeURIComponent(link.getAttribute('data-address') || '');
          const description = decodeURIComponent(link.getAttribute('data-description') || '');
          setPreview({ visible: true, title, address, description, x: e.clientX, y: e.clientY });
          const noteId = secondBrainUidFromPath(href);
          if (noteId) window.dispatchEvent(new CustomEvent('wiki-link-preview', { detail: noteId }));
        }
      } else {
        // Mouse is on non-link content — schedule hide
        if (!hideTimer.current) {
          hideTimer.current = setTimeout(() => {
            hoveredLinkRef.current = null;
            setPreview(INITIAL_PREVIEW);
            window.dispatchEvent(new CustomEvent('wiki-link-preview', { detail: null }));
            hideTimer.current = null;
          }, 80);
        }
      }
    };

    const onLeave = () => {
      clearHide();
      hoveredLinkRef.current = null;
      setPreview(INITIAL_PREVIEW);
      window.dispatchEvent(new CustomEvent('wiki-link-preview', { detail: null }));
    };

    const onClick = (e: MouseEvent) => {
      const headingAnchor = (e.target as HTMLElement).closest('.heading-anchor-link') as HTMLButtonElement | null;
      if (headingAnchor) {
        e.preventDefault();
        e.stopPropagation();
        const id = headingAnchor.dataset.headingId;
        if (!id) return;
        const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`;
        history.replaceState(null, '', `#${id}`);
        navigator.clipboard.writeText(url).then(() => {
          headingAnchor.classList.add('is-copied');
          setTimeout(() => headingAnchor.classList.remove('is-copied'), 1200);
        }).catch(() => {});
        return;
      }

      const contentImage = (e.target as HTMLElement).closest('img') as HTMLImageElement | null;
      if (contentImage && contentImage.closest('.article-content')) {
        e.preventDefault();
        setLightbox({ src: contentImage.currentSrc || contentImage.src, alt: contentImage.alt || '' });
        return;
      }

      // Copy button (shared class for code blocks + blockquotes)
      const copyBtn = (e.target as HTMLElement).closest('.copy-btn') as HTMLButtonElement | null;
      if (copyBtn) {
        const svgIcon = copyBtn.querySelector('svg')?.outerHTML || '';
        const terminal = copyBtn.closest('.code-terminal, .code-block');
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
            const noteId = secondBrainUidFromPath(href);
            if (noteId) onWikiLinkClickRef.current(noteId);
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
      window.dispatchEvent(new CustomEvent('wiki-link-preview', { detail: null }));
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
      {lightbox && (
        <button className="editorial-lightbox" type="button" onClick={() => setLightbox(null)} aria-label="Close enlarged image">
          <img src={lightbox.src} alt={lightbox.alt} />
        </button>
      )}
    </>
  );
};
