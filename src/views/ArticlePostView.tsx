// Article post view — unified terminal/cyberpunk theme for all article categories

import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatDate, formatDateTerminal } from '../lib';
import { getProjectDisplayTechnologies } from '../lib/projectPresentation';
import { initBrainIndex, type BrainIndex } from '../lib/brainIndex';
import { getActiveChain, ACTIVE_HEADING_THRESHOLD } from '../lib/headings';
import { WikiContent } from '../components/wiki/WikiContent';
import { CATEGORY_CONFIG, STATUS_CONFIG, sectionPath as getSectionPath, postPath, isBlogCategory, categoryGroup, catAccentVar } from '../config/categories';
import { ArrowRightIcon, GitHubIcon, LinkedInIcon, TwitterIcon, RedditIcon, HackerNewsIcon, ClipboardIcon, RocketIcon, CheckIcon, ShareIcon, HeartIcon, EyeIcon, Logo } from '../components/icons';

import { ArticleHashtags } from '../components/article/ArticleHashtags';
import { BlogMetabar } from '../components/article/BlogMetabar';
import { ProjectBrief } from '../components/article/ProjectBrief';
import { posts } from '../data/data';
import { Post } from '../types';
import { useArticleContext } from '../contexts/ArticleContext';
import { useKeyboardShortcuts, ShortcutDef } from '../hooks/useKeyboardShortcuts';
import { useViewCount } from '../hooks/useViewCount';
import { useReaction } from '../hooks/useReaction';
import { ARTICLE_VIEWS_DISPLAY_MIN, ARTICLE_HEARTS_DISPLAY_MIN } from '../config/analytics';
import { useTheme } from '../contexts/ThemeContext';
import Giscus from '@giscus/react';
import '../styles/article.css';
import '../styles/article-layout.css';
import '../styles/article-geometry.css';
import '../styles/project-page.css';

interface ArticlePostViewProps {
  post: Post;
}

const GiscusComments: React.FC<{ legacyPath: string; lang: string }> = ({ legacyPath, lang }) => {
  const { theme } = useTheme();
  return (
    <div className="article-comments">
      <Giscus
        repo="yago-mendoza/infraphysics-comments"
        repoId="R_kgDORbJE3A"
        category="Comments"
        categoryId="DIC_kwDORbJE3M4C3Z8Y"
        mapping="specific"
        term={legacyPath.slice(1)}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'light' ? 'light' : 'transparent_dark'}
        lang={lang === 'es' ? 'es' : 'en'}
        loading="lazy"
      />
    </div>
  );
};

export const ArticlePostView: React.FC<ArticlePostViewProps> = ({ post }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const catCfg = CATEGORY_CONFIG[post.category];
  const isBlog = isBlogCategory(post.category);
  const isEssays = post.category === 'essays';
  const visibleProjectTechnologies = post.category === 'projects' ? getProjectDisplayTechnologies(post.technologies) : [];
  const project = post.category === 'projects' ? post : null;
  const projectTags = project?.tags ?? [];
  const statusCfg = project?.status ? STATUS_CONFIG[project.status] : null;
  const [copied, setCopied] = useState(false);
  const [contentCopied, setContentCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [shareClosing, setShareClosing] = useState(false);
  // Close with the exit animation: the closing class plays, then the sheet unmounts.
  const closeShare = useCallback(() => {
    setShareClosing(true);
    window.setTimeout(() => { setShareOpen(false); setShareClosing(false); }, 180);
  }, []);
  const { setArticleState, clearArticleState, updateActiveHeading } = useArticleContext();

  // Async brain index for wiki-link resolution in articles
  const [brainIndex, setBrainIndex] = useState<BrainIndex | null>(null);
  useEffect(() => { initBrainIndex().then(setBrainIndex).catch(() => {}); }, []);

  // Escape closes the share sheet
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeShare(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shareOpen, closeShare]);

  // Compute next/prev posts within same category sorted by date
  const { nextPost, prevPost } = useMemo(() => {
    const sameCat = posts
      .filter(p => p.category === post.category)
      .sort((a, b) => a.date.localeCompare(b.date));
    const idx = sameCat.findIndex(p => p.id === post.id);
    return {
      nextPost: idx < sameCat.length - 1 ? sameCat[idx + 1] : null,
      prevPost: idx > 0 ? sameCat[idx - 1] : null,
    };
  }, [post.id, post.category]);

  // Status label + dot color

  const formattedDate = useMemo(() => formatDateTerminal(post.date), [post.date]);
  const legacyPath = `/${categoryGroup(post.category)}/${post.category}/${post.id}`;
  const { views } = useViewCount(legacyPath);
  const { hearts, hearted, toggle: toggleHeart } = useReaction(legacyPath);
  // Counters are always tracked; small ones are not displayed (config/analytics.ts).
  const shownViews = views != null && views >= ARTICLE_VIEWS_DISPLAY_MIN ? views : null;
  const shownHearts = hearts != null && (hearts >= ARTICLE_HEARTS_DISPLAY_MIN || hearted) ? hearts : null;

  const authorName = post.author || 'Yago Mendoza';
  const authorPath = authorName.toLowerCase() === 'yago mendoza' ? '/about' : '/contact';
  // The two circles, the site behind the author, for the blog card and the project sheet (the site owner only).
  const authorStack = authorPath === '/about' ? <span className="glab-author-stack"><i className="glab-author-logo" aria-hidden="true"><Logo color="currentColor" /></i><img className="glab-author-photo" src="/avatar.jpg" alt="" width={240} height={240} loading="lazy" decoding="async" /></span> : null;
  // The author link: the name with the small round portrait beside it (the site owner only).
  const authorLink = <Link to={authorPath} className="author-link">{authorPath === '/about' && <img className="author-mini" src="/avatar-mini.jpg" alt="" width={32} height={32} loading="lazy" decoding="async" />}{authorName}</Link>;

  // Banner vertical crop anchor — object-position Y% (0 = top, 50 = center, 100 = bottom).
  // Only bites on cover-cropped aspects (wide/banner/strip); `full` shows the whole image.
  const thumbFocusStyle = post.thumbnailFocus != null
    ? { objectPosition: `50% ${post.thumbnailFocus}%` }
    : undefined;

  // tldr renders as a single compact paragraph. Legacy array values are joined into one.
  const tldrText: string = !post.tldr
    ? ''
    : Array.isArray(post.tldr)
      ? post.tldr.join(' ')
      : String(post.tldr).trim();

  /*
   * Heading extraction + content enrichment
   */
  const { headings, contentWithIds } = useMemo(() => {
    const raw: { level: number; text: string; id: string }[] = [];
    const seen = new Map<string, number>();

    const processed = post.content.replace(
      /<(h[1-4])(\s[^>]*)?>(.+?)<\/\1>/gi,
      (_match, tag, attrs, inner) => {
        const level = parseInt(tag[1]);
        const text = inner.replace(/<[^>]*>/g, '').trim()
          .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/^\d+\.\s+/, '');
        let slug = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (!slug) slug = 'section';

        const count = seen.get(slug) || 0;
        seen.set(slug, count + 1);
        if (count > 0) slug += `-${count}`;

        const id = `toc-${slug}`;
        raw.push({ level, text, id });
        // Strip leading "1. " / "2. " etc. from rendered heading (S-prefix replaces it)
        const cleanInner = inner.replace(/^\s*\d+\.\s+/, '');
        return `<${tag}${attrs || ''} id="${id}" data-toc-id="${id}" class="heading-toc-link">${cleanInner}</${tag}>`;
      }
    );

    // Rewrite in-article anchor links: href="#slug" → href="#toc-slug" for matching headings
    const slugSet = new Set(raw.map(h => h.id.replace(/^toc-/, '')));
    const finalProcessed = processed.replace(
      /href="#([^"]+)"/g,
      (m, slug) => {
        if (slug.startsWith('toc-') && slugSet.has(slug.replace(/^toc-/, ''))) return m;
        if (slugSet.has(slug)) return `href="#toc-${slug}"`;
        return m;
      }
    );

    if (raw.length === 0) {
      return { headings: [] as { level: number; text: string; id: string; number: string; depth: number }[], contentWithIds: finalProcessed };
    }

    // Hierarchical numbering (1, 1.1, 1.2, 2, 2.1, …)
    const minLevel = Math.min(...raw.map(h => h.level));
    const headings = raw.map(h => ({ ...h, number: '', depth: h.level - minLevel }));

    return { headings, contentWithIds: finalProcessed };
  }, [post.content, isBlog]);

  const topHeadings = useMemo(() => headings.filter(h => h.depth === 0), [headings]);
  const [tocOpen, setTocOpen] = useState(isBlog);
  const [blinkId, setBlinkId] = useState<string>('');
  const blinkTimer = useRef<ReturnType<typeof setTimeout>>(0 as any);
  const progressRef = useRef<HTMLDivElement>(null);
  // Scroll-based active heading tracking — ref + direct DOM, no React re-renders.
  // This avoids disrupting browser Ctrl+F which breaks when React reconciles during scroll.
  const activeIdRef = useRef<string>('');

  useEffect(() => {
    if (headings.length < 2) return;

    let currentActiveId = '';
    let rafId = 0;

    const tick = () => {
      let newActiveId = '';
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= ACTIVE_HEADING_THRESHOLD) {
            newActiveId = h.id;
          }
        }
      }
      if (newActiveId !== currentActiveId) {
        currentActiveId = newActiveId;
        activeIdRef.current = newActiveId;

        // Direct DOM manipulation — no React re-render
        const tocEl = document.getElementById('article-toc');
        if (tocEl) {
          const activeSet = getActiveChain(headings, newActiveId);
          tocEl.querySelectorAll('.article-toc-link').forEach(link => {
            const href = link.getAttribute('href');
            const id = href?.startsWith('#') ? href.slice(1) : '';
            link.classList.toggle('article-toc-link--active', activeSet.has(id));
          });
        }

      }
      rafId = 0;
    };

    const handleScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [headings]);

  // Click handler for headings — opens TOC, scrolls to it, blinks entry (projects only; blog uses lateral TOC)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isBlog) return;
      const heading = (e.target as HTMLElement).closest('.heading-toc-link') as HTMLElement | null;
      if (!heading) return;
      // Don't intercept clicks on actual links inside headings
      if ((e.target as HTMLElement).closest('a, button')) return;
      const tocId = heading.dataset.tocId;
      if (!tocId) return;

      // Open TOC if collapsed
      setTocOpen(true);

      // Reset blink so React can restart the animation even if same ID
      clearTimeout(blinkTimer.current);
      setBlinkId('');

      // Wait for React render (blink cleared), then scroll + set blink
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const link = document.querySelector(`.article-toc-link[href="#${tocId}"]`) as HTMLElement | null;
          if (link) link.scrollIntoView({ behavior: 'instant', block: 'center' });
          setBlinkId(tocId!);
          blinkTimer.current = setTimeout(() => setBlinkId(''), 1200);
        });
      });
    };

    // In-article anchor links (href="#toc-...") — instant scroll to heading
    const anchorHandler = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('.article-content a[href^="#toc-"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    };

    document.addEventListener('click', handler);
    document.addEventListener('click', anchorHandler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('click', anchorHandler);
    };
  }, []);

  // Mobile reading progress bar
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;

    let rafId = 0;
    const tick = () => {
      // 100% when the comments block bottom reaches the viewport bottom
      const endMarker = document.querySelector('.article-comments');
      if (!endMarker) { rafId = 0; return; }
      const endAbsBottom = window.scrollY + endMarker.getBoundingClientRect().bottom;
      const targetScroll = endAbsBottom - window.innerHeight;
      const progress = targetScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / targetScroll)) : 1;
      el.style.width = `${progress * 100}%`;
      rafId = 0;
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Push article state to ArticleContext (consumed by SearchPalette)
  useEffect(() => {
    setArticleState({
      post,
      headings,
      activeHeadingId: activeIdRef.current,
      nextPost,
      prevPost,
    });
    return () => clearArticleState();
  }, [post, headings, nextPost, prevPost]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync active heading ID to context
  // Contextual keyboard shortcuts
  const scrollToHeading = useCallback((direction: 'next' | 'prev') => {
    if (headings.length < 2) return;
    const activeIndex = headings.findIndex(h => h.id === activeIdRef.current);
    let targetIdx: number;
    if (direction === 'next') {
      targetIdx = activeIndex < headings.length - 1 ? activeIndex + 1 : headings.length - 1;
      if (activeIndex === -1) targetIdx = 0;
    } else {
      targetIdx = activeIndex > 0 ? activeIndex - 1 : 0;
      if (activeIndex === -1) targetIdx = 0;
    }
    document.getElementById(headings[targetIdx].id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [headings]);

  const articleShortcuts = useMemo<ShortcutDef[]>(() => [
    { key: 'g', label: 'GitHub', action: () => { if (post.github) window.open(post.github, '_blank'); }, enabled: !!post.github },
    { key: 'd', label: 'Demo', action: () => { if (post.demo) window.open(post.demo, '_blank'); }, enabled: !!post.demo },
    { key: 'j', label: 'Next section', action: () => scrollToHeading('next'), enabled: headings.length > 1 },
    { key: 'k', label: 'Prev section', action: () => scrollToHeading('prev'), enabled: headings.length > 1 },
    { key: 't', label: 'Prev section', action: () => scrollToHeading('prev'), enabled: headings.length > 1 },
    { key: 'b', label: 'Next section', action: () => scrollToHeading('next'), enabled: headings.length > 1 },
    { key: 'n', label: 'Newer', action: () => { if (nextPost) navigate(postPath(nextPost.category, nextPost.id)); }, enabled: !!nextPost },
    { key: 'p', label: 'Older', action: () => { if (prevPost) navigate(postPath(prevPost.category, prevPost.id)); }, enabled: !!prevPost },
  ], [post.github, post.demo, headings.length, nextPost, prevPost, scrollToHeading, navigate]);

  useKeyboardShortcuts(articleShortcuts);

  // Related posts — explicit editorial links first, deterministic topic overlap second.
  const targetCategory = catCfg?.relatedCategory || post.category;
  const targetCatCfg = CATEGORY_CONFIG[targetCategory];
  const relatedSectionPath = getSectionPath(targetCategory);
  const relatedAccent = targetCatCfg?.accentVar || 'var(--text-secondary)';

  const recommendedPosts = useMemo(() => {
    const pool = posts.filter(p => p.category === targetCategory && p.id !== post.id);

    // Explicit editorial links may cross category boundaries. Resolve them
    // globally and preserve the author's order; category fallback stays below.
    if (post.related?.length) {
      const explicit = post.related
        .map(id => posts.find(p => p.id === id && !(p.id === post.id && p.category === post.category)))
        .filter((p): p is Post => p !== undefined);
      if (explicit.length > 0) return explicit.slice(0, 3);
    }

    const topics = new Set((post.tags || []).map(tag => tag.toLowerCase()));
    return pool
      .map(candidate => ({
        candidate,
        overlap: (candidate.tags || []).reduce((score, tag) => score + (topics.has(tag.toLowerCase()) ? 1 : 0), 0),
      }))
      .sort((a, b) => b.overlap - a.overlap
        || new Date(b.candidate.date).getTime() - new Date(a.candidate.date).getTime())
      .slice(0, 3)
      .map(({ candidate }) => candidate);
  }, [post, targetCategory]);

  const tocHeadings = headings;
  const tocList = tocHeadings.length > 1 ? (
    <ol className="article-toc-list">
      {tocHeadings.map((h) => (
        <li
          key={h.id}
          className={`article-toc-item article-toc-depth-${h.depth}`}
        >
          <a
            href={`#${h.id}`}
            className={`article-toc-link${blinkId === h.id ? ' toc-blink' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
            }}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  ) : null;

  const relatedLabel = catCfg?.relatedLabel || 'Related Articles';

  // Phones: a floating Sections button opens the index as a bottom sheet, wherever the reader is.
  const mobileIndex = topHeadings.length > 1 && (
    <>
      <button type="button" className="article-index-fab" onClick={() => setIndexOpen(true)} aria-haspopup="dialog" aria-expanded={indexOpen}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        Sections
      </button>
      {indexOpen && createPortal(
        <div className="article-index-veil" role="presentation" onClick={e => { if (e.target === e.currentTarget) setIndexOpen(false); }}>
          <div className="article-index-sheet" role="dialog" aria-modal="true" aria-label="Sections" style={{ '--art-accent': catAccentVar(post.category) } as React.CSSProperties}>
            <small>Sections</small>
            <ol>
              {topHeadings.map((h, i) => <li key={h.id}><a href={`#${h.id}`} onClick={event => { event.preventDefault(); setIndexOpen(false); document.getElementById(h.id)?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}><b>{String(i + 1).padStart(2, '0')}</b><span>{h.text}</span></a></li>)}
            </ol>
          </div>
        </div>,
        document.body,
      )}
    </>
  );

  const shareUrl = `${window.location.origin}${location.pathname}`;
  const shareTitle = post.displayTitle || post.title;

  // The share sheet: the page dims and one centred card lists the options side by side (copy link
  // first), in the category accent. No heading, no numbers, no close: the veil and Escape close it.
  // It is a portal, so the accent is set on the card itself.
  const shareDropdown = (
    <>
      <button
        className="article-share-btn"
        onClick={() => setShareOpen(true)}
        title="Share"
        aria-haspopup="dialog"
        aria-expanded={shareOpen}
      >
        <ShareIcon size={14} />
      </button>
      {shareOpen && createPortal(
        <div className={`article-share-veil${shareClosing ? ' is-closing' : ''}`} role="presentation" onClick={e => { if (e.target === e.currentTarget) closeShare(); }}>
          <div className="article-share-sheet" role="dialog" aria-modal="true" aria-label="Share this piece" style={{ '--share-accent': catAccentVar(post.category) } as React.CSSProperties}>
            <div className="article-share-options">
              <button type="button" onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}>{copied ? <CheckIcon size={18} /> : <ClipboardIcon size={18} />}<span>{copied ? 'Link copied' : 'Copy link'}</span></button>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out: ${shareTitle}`)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"><TwitterIcon size={18} /><span>X</span></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"><LinkedInIcon size={18} /><span>LinkedIn</span></a>
              <a href={`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer"><RedditIcon size={18} /><span>Reddit</span></a>
              <a href={`https://news.ycombinator.com/submitlink?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer"><HackerNewsIcon size={18} /><span>Hacker News</span></a>
              <button type="button" onClick={() => {
                const el = document.querySelector('.article-content');
                if (el) {
                  navigator.clipboard.writeText((el as HTMLElement).innerText);
                  setContentCopied(true);
                  setTimeout(() => setContentCopied(false), 2000);
                }
              }}>{contentCopied ? <CheckIcon size={18} /> : <RocketIcon size={18} />}<span>{contentCopied ? 'Text copied' : 'Copy the text'}</span></button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );

  return (
    <div className={`article-page-wrapper article-${post.category}${isBlog ? ' article-blog article-geometry' : ' pj'} animate-fade-in`} lang={post.lang === 'es' ? 'es' : undefined}>
      {createPortal(
        <div ref={progressRef} className="article-progress-bar" style={{ backgroundColor: `var(--cat-${post.category}-accent)` }} />,
        document.body
      )}

      {isBlog ? (
        /* Blog geometry: breadcrumb, sans title, meta line, rounded hero,
           sticky index of top-level sections on the left, body on the right.
           Essays stack the hero under the meta; Bits2Bricks put the hashtags
           above the title, the hero beside it and number the index. */
        <>
        {/* The thin black bar on the top edge of every article page. */}
        {mobileIndex}
        <article className={`glab${isEssays ? '' : ' glab-split'}`}>
          <div className="glab-head">
            <div className="glab-head-text">
              {!isEssays && <ArticleHashtags tags={post.tags} technologies={post.technologies} />}
              <h1 className="glab-title">{post.displayTitle || post.title}</h1>
              {/* Essays: the date at the left of the subtitle, in the subtitle's own type. Bits2Bricks keep the meta row. */}
              {isEssays
                ? <p className="glab-subtitle glab-subtitle-dated"><time dateTime={post.date}>{formattedDate}</time>{post.subtitle && <span>{post.subtitle}</span>}</p>
                : post.subtitle && <p className="glab-subtitle">{post.subtitle}</p>}
              {/* Essays with an index carry views, likes and share under it (as projects do); without one they keep this row. */}
              {(!isEssays || topHeadings.length <= 1) && <div className="glab-meta-row">
                <p className="glab-meta">
                  {topHeadings.length <= 1 && <>{authorLink}{!isEssays && <span>·</span>}</>}
                  {!isEssays && <time dateTime={post.date}>{formattedDate}</time>}
                  {!isEssays && post.complexity != null && <><span>·</span><span>complexity {post.complexity}/10</span></>}
                </p>
                <div className="article-engagement-row article-essays-engagement">
                  <div className="article-engagement-left">
                    {shownViews != null && (
                      <span className="article-meta-views"><EyeIcon size={15} /> {shownViews}</span>
                    )}
                    {/* Always offered, count or no count: a like the reader cannot give is no like. */}
                    <button onClick={toggleHeart} className={`article-heart-btn${hearted ? ' hearted' : ''}`} title={hearted ? 'Unlike' : 'Like'}>
                      <HeartIcon size={15} filled={hearted} />{shownHearts != null && <> {shownHearts}</>}
                    </button>
                  </div>
                  {shareDropdown}
                </div>
              </div>}
            </div>
            {post.thumbnail && (
              <figure className={`glab-hero thumb-${post.thumbnailAspect || 'full'}`}>
                <img src={post.thumbnail} alt={post.displayTitle || post.title} loading="eager" style={thumbFocusStyle} />
              </figure>
            )}
          </div>
          {/* A piece with a single section has no index: the rail is not rendered and the body sits centred in the column. */}
          <div className={`glab-grid${topHeadings.length > 1 ? '' : ' glab-grid-solo'}`}>
            {topHeadings.length > 1 && (
              <aside className={`glab-index${isEssays ? '' : ' glab-index-numbered'}`} id="article-toc">
                {/* The author, above the index: the portrait and the name, as the home presents the site. */}
                <Link to={authorPath} className="glab-author">
                  {authorStack}
                  <span><b>{authorName}</b>{authorPath === '/about' && <small>AI &amp; Industrial Engineer</small>}</span>
                </Link>
                <small>{isEssays ? 'In this article' : 'Sections'}</small>
                <ol>
                  {topHeadings.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="article-toc-link" onClick={event => { event.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}>{!isEssays && <b>{String(i + 1).padStart(2, '0')}</b>}<span>{h.text}</span></a></li>)}
                </ol>
                {isEssays && (
                  <div className="article-engagement-row glab-engagement">
                    {shownViews != null && <span className="article-meta-views"><EyeIcon size={15} /> {shownViews}</span>}
                    <button onClick={toggleHeart} className={`article-heart-btn${hearted ? ' hearted' : ''}`} title={hearted ? 'Unlike' : 'Like'}>
                      <HeartIcon size={15} filled={hearted} />{shownHearts != null && <> {shownHearts}</>}
                    </button>
                    {shareDropdown}
                  </div>
                )}
              </aside>
            )}
            <div className="glab-body">
              <WikiContent
                html={contentWithIds}
                allWikiNotes={brainIndex?.allWikiNotes}
                className="article-content"
              />
            </div>
          </div>
          {/* Comments sit after the grid, under the body column, so the sticky index stops at the end of the text. */}
          <div className={`glab-after${topHeadings.length > 1 ? '' : ' glab-after-solo'}`}>
            <GiscusComments legacyPath={legacyPath} lang={post.lang || 'en'} />
          </div>
        </article>
        </>
      ) : (
      /* Projects: the full-bleed cover fading into the page, title and byline on it over a soft
         scrim, the brief strip, a labelled summary, the body beside a numbered index and a facts
         sheet (project-page.css). */
      <article className="pj-page">
        {mobileIndex}
        <header>
          <div className="pj-plate">{post.thumbnail && <img src={post.thumbnail} alt="" loading="eager" style={thumbFocusStyle} />}</div>
          <div className="pj-column pj-plate-text">
            <div className="pj-plate-scrim">
              <p className="pj-meta">
                {statusCfg && <><span className="pj-status" style={{ '--status': statusCfg.dotColor } as React.CSSProperties}><i />{statusCfg.label.toLowerCase()}</span><span>·</span></>}
                {authorLink}
                <span>·</span><time dateTime={post.date}>{formattedDate}</time>
                {post.complexity != null && <><span>·</span><span>complexity {post.complexity}/10</span></>}
              </p>
              <h1 className="pj-title">{post.displayTitle || post.title}</h1>
              {post.subtitle && <p className="pj-subtitle">{post.subtitle}</p>}
              {(visibleProjectTechnologies.length > 0 || projectTags.length > 0) && (
                <div className="pj-chips">
                  {visibleProjectTechnologies.map(tech => <span key={tech} className="is-tech">{tech}</span>)}
                  {projectTags.map(tag => <span key={tag}>{tag}</span>)}
                </div>
              )}
              {/* Phones only (project-page.css): the actions live here, the rail with the facts is gone. */}
              <div className="article-engagement-row pj-engagement pj-engagement-top">
                {shownViews != null && <span className="article-meta-views"><EyeIcon size={15} /> {shownViews}</span>}
                <button onClick={toggleHeart} className={`article-heart-btn${hearted ? ' hearted' : ''}`} title={hearted ? 'Unlike' : 'Like'}>
                  <HeartIcon size={15} filled={hearted} />{shownHearts != null && <> {shownHearts}</>}
                </button>
                {shareDropdown}
              </div>
            </div>
          </div>
        </header>
        <ProjectBrief postId={post.id} />
        <div className="pj-column pj-grid">
          <div className="pj-body">
            {tldrText && (
              <section className="pj-summary" aria-label="Summary">
                <small>Summary</small>
                <p className="pj-lead">{tldrText}</p>
              </section>
            )}
            <WikiContent
              html={contentWithIds}
              allWikiNotes={brainIndex?.allWikiNotes}
              className="article-content"
            />
          </div>
          <aside className="pj-rail" id="article-toc">
            {topHeadings.length > 1 && (
              <nav className="pj-index" aria-label="Sections">
                <small>Sections</small>
                <ol>
                  {topHeadings.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="article-toc-link" onClick={event => { event.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}><b>{String(i + 1).padStart(2, '0')}</b><span>{h.text}</span></a></li>)}
                </ol>
              </nav>
            )}
            <dl className="pj-facts">
              <div className="pj-fact-author"><dt>Author</dt><dd><Link to={authorPath} className="author-link">{authorStack}{authorName}</Link></dd></div>
              {statusCfg && <div><dt>Status</dt><dd><span className="pj-status" style={{ '--status': statusCfg.dotColor } as React.CSSProperties}><i />{statusCfg.label.toLowerCase()}</span></dd></div>}
              <div><dt>Date</dt><dd>{formattedDate}</dd></div>
              {post.complexity != null && <div><dt>Complexity</dt><dd>{post.complexity} / 10</dd></div>}
              {visibleProjectTechnologies.length > 0 && <div><dt>Stack</dt><dd>{visibleProjectTechnologies.join(', ')}</dd></div>}
              {projectTags.length > 0 && <div><dt>Topics</dt><dd>{projectTags.join(', ')}</dd></div>}
              {project?.github && <div><dt>Source</dt><dd><a href={project.github} target="_blank" rel="noopener noreferrer">GitHub</a></dd></div>}
              {project?.demo && <div><dt>Demo</dt><dd><a href={project.demo} target="_blank" rel="noopener noreferrer">Live</a></dd></div>}
            </dl>
            <div className="article-engagement-row pj-engagement">
              {shownViews != null && <span className="article-meta-views"><EyeIcon size={15} /> {shownViews}</span>}
              <button onClick={toggleHeart} className={`article-heart-btn${hearted ? ' hearted' : ''}`} title={hearted ? 'Unlike' : 'Like'}>
                <HeartIcon size={15} filled={hearted} />{shownHearts != null && <> {shownHearts}</>}
              </button>
              {shareDropdown}
            </div>
          </aside>
        </div>
        {/* Comments after the grid, in the body column, so the sticky rail stops at the end of the text. */}
        <div className="pj-column pj-after">
          <GiscusComments legacyPath={legacyPath} lang={post.lang || 'en'} />
        </div>
      </article>
      )}

      {/* ════════════════════════════════════════════
          RELATED POSTS — OUTSIDE the box
          ════════════════════════════════════════════ */}
      <div className={`article-related article-${targetCategory}`}>
        <div className="article-related-header">
          <h3 className="article-related-title">{relatedLabel}</h3>
          <Link to={relatedSectionPath} className="article-related-viewall">
            View all <ArrowRightIcon />
          </Link>
        </div>
        <div className="article-related-grid">
          {recommendedPosts.map(rec => (
            <Link
              key={rec.id}
              to={postPath(rec.category, rec.id)}
              className="article-related-card group"
            >
              <div className="article-related-thumb">
                <img
                  src={rec.thumbnail || ''}
                  alt={rec.displayTitle || rec.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="article-related-info">
                <div className="article-related-meta">
                  <span className="text-[10px] uppercase" style={{ color: relatedAccent }}>{rec.category}</span>
                  <span className="text-[10px] text-th-tertiary">{formatDate(rec.date)}</span>
                </div>
                <h4 className="article-related-name">
                  {rec.displayTitle || rec.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};
