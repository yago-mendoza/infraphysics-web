// Article post view — unified terminal/cyberpunk theme for all article categories

import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatDate, formatDateTerminal, calculateReadingTime } from '../lib';
import { getProjectDisplayTechnologies } from '../lib/projectPresentation';
import { initBrainIndex, type BrainIndex } from '../lib/brainIndex';
import { getActiveChain, ACTIVE_HEADING_THRESHOLD } from '../lib/headings';
import { WikiContent } from '../components/wiki/WikiContent';
import { CATEGORY_CONFIG, sectionPath as getSectionPath, postPath, isBlogCategory } from '../config/categories';
import { ArrowRightIcon, GitHubIcon, LinkedInIcon, TwitterIcon, RedditIcon, HackerNewsIcon, ClipboardIcon, CheckIcon, ShareIcon, HeartIcon, EyeIcon } from '../components/icons';

import { ArticleHashtags } from '../components/article/ArticleHashtags';
import { BlogMetabar } from '../components/article/BlogMetabar';
import { posts } from '../data/data';
import { Post } from '../types';
import { useArticleContext } from '../contexts/ArticleContext';
import { useKeyboardShortcuts, ShortcutDef } from '../hooks/useKeyboardShortcuts';
import { useViewCount } from '../hooks/useViewCount';
import { useReaction } from '../hooks/useReaction';
import { useTheme } from '../contexts/ThemeContext';
import Giscus from '@giscus/react';
import '../styles/article.css';
import '../styles/article-layout.css';
import '../styles/article-geometry.css';

interface ArticlePostViewProps {
  post: Post;
}

const GiscusComments: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className="article-comments">
      <Giscus
        repo="yago-mendoza/infraphysics-comments"
        repoId="R_kgDORbJE3A"
        category="Comments"
        categoryId="DIC_kwDORbJE3M4C3Z8Y"
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'light' ? 'light' : 'transparent_dark'}
        lang="es"
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
  const [copied, setCopied] = useState(false);
  const [contentCopied, setContentCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const { setArticleState, clearArticleState, updateActiveHeading } = useArticleContext();

  // Async brain index for wiki-link resolution in articles
  const [brainIndex, setBrainIndex] = useState<BrainIndex | null>(null);
  useEffect(() => { initBrainIndex().then(setBrainIndex).catch(() => {}); }, []);

  // Click outside closes share dropdown
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareOpen]);

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
  const readingTime = useMemo(() => calculateReadingTime(post.content), [post.content]);
  const { views } = useViewCount(location.pathname);
  const { hearts, hearted, toggle: toggleHeart } = useReaction(location.pathname);

  const authorName = post.author || 'Yago Mendoza';
  const authorPath = authorName.toLowerCase() === 'yago mendoza' ? '/about' : '/contact';

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

    // Place inside navbar, flush with its inner bottom edge
    const nav = document.querySelector('.fixed.top-0.z-50') as HTMLElement | null;
    if (nav && nav.offsetHeight > 0) {
      const border = parseFloat(getComputedStyle(nav).borderBottomWidth) || 1;
      const barH = parseFloat(getComputedStyle(el).height) || 3;
      el.style.top = `${nav.offsetHeight - border - barH}px`;
    }

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

  const shareUrl = `${window.location.origin}${location.pathname}`;
  const shareTitle = post.displayTitle || post.title;

  const shareDropdown = (
    <div ref={shareRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        className="article-share-btn"
        onClick={() => setShareOpen(o => !o)}
        title="Share"
      >
        {!isBlog && <ShareIcon size={14} />}
        {isBlog && 'Share'}
      </button>
      {shareOpen && (
        <div className="article-share-dropdown">
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out: ${shareTitle}`)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
            <TwitterIcon size={14} /> Share on X
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
            <LinkedInIcon size={14} /> Share on LinkedIn
          </a>
          <a href={`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer">
            <RedditIcon size={14} /> Share on Reddit
          </a>
          <a href={`https://news.ycombinator.com/submitlink?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer">
            <HackerNewsIcon size={14} /> Hacker News
          </a>
          <button onClick={() => {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}>
            {copied ? <CheckIcon size={14} /> : <ClipboardIcon size={14} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <div className="article-share-dropdown-sep" />
          <button onClick={() => {
            const el = document.querySelector('.article-content');
            if (el) {
              navigator.clipboard.writeText((el as HTMLElement).innerText);
              setContentCopied(true);
              setTimeout(() => setContentCopied(false), 2000);
            }
          }}>
            {contentCopied ? <CheckIcon size={14} /> : <ClipboardIcon size={14} />}
            {contentCopied ? 'Copied!' : 'Copy content'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`article-page-wrapper article-${post.category}${isBlog ? ' article-blog' : ''}${isBlog ? ' article-geometry' : ''} animate-fade-in`}>
      {createPortal(
        <div ref={progressRef} className="article-progress-bar" style={{ backgroundColor: `var(--cat-${post.category}-accent)` }} />,
        document.body
      )}

      {isBlog ? (
        /* Blog geometry: breadcrumb, sans title, meta line, rounded hero,
           sticky index of top-level sections on the left, body on the right.
           Essays stack the hero under the meta; Bits2Bricks put the hashtags
           above the title, the hero beside it and number the index. */
        <article className={`glab${isEssays ? '' : ' glab-split'}`}>
          <nav className="glab-crumb" aria-label="Breadcrumb">
            <Link to="/home">home</Link><span>/</span><Link to={getSectionPath(post.category)}>blog</Link><span>/</span><b>{catCfg?.title ?? post.category}</b>
          </nav>
          <div className="glab-head">
            <div className="glab-head-text">
              {!isEssays && <ArticleHashtags tags={post.tags} technologies={post.technologies} />}
              <h1 className="glab-title">{post.displayTitle || post.title}</h1>
              {post.subtitle && <p className="glab-subtitle">{post.subtitle}</p>}
              <div className="glab-meta-row">
                <p className="glab-meta">
                  <Link to={authorPath}>{authorName}</Link>
                  <span>·</span><time dateTime={post.date}>{formattedDate}</time>
                  <span>·</span><span>{readingTime} min read</span>
                  {!isEssays && post.complexity != null && <><span>·</span><span>complexity {post.complexity}/10</span></>}
                </p>
                <div className="article-engagement-row article-essays-engagement">
                  <div className="article-engagement-left">
                    {views != null && (
                      <span className="article-meta-views"><EyeIcon size={15} /> {views}</span>
                    )}
                    {hearts != null && (
                      <button onClick={toggleHeart} className={`article-heart-btn${hearted ? ' hearted' : ''}`} title={hearted ? 'Unlike' : 'Like'}>
                        <HeartIcon size={15} filled={hearted} /> {hearts}
                      </button>
                    )}
                  </div>
                  {shareDropdown}
                </div>
              </div>
            </div>
            {post.thumbnail && (
              <figure className={`glab-hero thumb-${post.thumbnailAspect || 'full'}`}>
                <img src={post.thumbnail} alt={post.displayTitle || post.title} loading="eager" style={thumbFocusStyle} />
              </figure>
            )}
          </div>
          <div className="glab-grid">
            <aside className={`glab-index${isEssays ? '' : ' glab-index-numbered'}`} id="article-toc">
              {topHeadings.length > 1 && (
                <>
                  <small>{isEssays ? 'In this article' : 'Sections'}</small>
                  <ol>
                    {topHeadings.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="article-toc-link" onClick={event => { event.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}>{!isEssays && <b>{String(i + 1).padStart(2, '0')}</b>}<span>{h.text}</span></a></li>)}
                  </ol>
                </>
              )}
            </aside>
            <div className="glab-body">
              <WikiContent
                html={contentWithIds}
                allWikiNotes={brainIndex?.allWikiNotes}
                className="article-content"
              />
              <GiscusComments />
            </div>
          </div>
        </article>
      ) : (
      <article className="article-container">

        {/* ── HERO IMAGE (projects only — grayscale) ── */}
        {!isBlog && post.thumbnail && (
          <div className={`article-hero thumb-${post.thumbnailAspect || 'full'} shade-${post.thumbnailShading || 'heavy'}`}>
            <img
              src={post.thumbnail}
              alt={post.displayTitle || post.title}
              loading="lazy"
              className="article-hero-img"
              style={thumbFocusStyle}
            />
            <div className="article-hero-gradient" />
          </div>
        )}

        {/* ── BODY ── */}
        <div className="article-body">

          {/* Nav row (projects only): tags on the left, engagement buttons on the right.
              Blog articles rely on the floating top bar's back link instead. */}
          {!isBlog && (
            <div className="article-nav-row">
              <div className="article-nav-tags">
                {post.tags && post.tags.length > 0 && (
                  <div className="article-pills article-pills-topics" aria-label="Project topics">
                    {post.tags.map(tag => (
                      <span key={tag} className="article-pill article-pill-topic">{tag}</span>
                    ))}
                  </div>
                )}
                {visibleProjectTechnologies.length > 0 && (
                  <div className="article-pills article-pills-tech" aria-label="Project technologies">
                    {visibleProjectTechnologies.map(tech => (
                      <span key={tech} className="article-pill article-pill-tech">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="article-engagement-row">
                {views != null && (
                  <span className="article-meta-views"><EyeIcon size={15} /> {views}</span>
                )}
                {hearts != null && (
                  <button onClick={toggleHeart} className={`article-heart-btn${hearted ? ' hearted' : ''}`} title={hearted ? 'Unlike' : 'Like'}>
                    <HeartIcon size={15} filled={hearted} /> {hearts}
                  </button>
                )}
                <a
                  href={post.github || 'https://github.com/yago-mendoza'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-social-btn article-social-github"
                  title={post.github ? 'View on GitHub' : 'GitHub'}
                >
                  <GitHubIcon size={18} />
                </a>
                {shareDropdown}
              </div>
            </div>
          )}

          {/* Blog image — above meta/title (blog only) */}
          {isBlog && post.thumbnail && (
            <div className={`article-blog-image thumb-${post.thumbnailAspect || 'full'}`}>
              <img
                src={post.thumbnail}
                alt={post.displayTitle || post.title}
                loading="lazy"
                className="article-blog-image-img"
                style={thumbFocusStyle}
              />
            </div>
          )}

          {/* META — above title for blog (moved to metabar below title), below for projects */}

          {/* Tag pills — below meta, above title (blog only) */}
          {isBlog && <ArticleHashtags tags={post.tags} technologies={post.technologies} />}

          {/* TITLE — displayTitle large + subtitle below smaller/gray */}
          <div className="article-title-block">
            <h1 className="article-title">
              {post.displayTitle || post.title}
            </h1>
            {post.subtitle && (
              <p className="article-subtitle">{post.subtitle}</p>
            )}
          </div>

          {/* META — below title for projects */}
          {!isBlog && (
            <div className="article-meta">
              <span className="article-meta-date">{formattedDate}</span>
              <span className="article-meta-reading-time">{readingTime} min read</span>
              <Link to={authorPath} className="article-meta-author">{authorName}</Link>
            </div>
          )}

          {/* Meta bar (blog non-essays only — essays has its own in header card) */}
          {isBlog && post.category !== 'essays' && (
            <BlogMetabar date={post.date} authorName={authorName} authorPath={authorPath} readingTime={readingTime} views={views} hearts={hearts} hearted={hearted} toggleHeart={toggleHeart} shareDropdown={shareDropdown} formatDate={formatDate} />
          )}

          {/* NOTES + DIVIDERS (projects only) */}
          {!isBlog && (
            <>
              {/* Thin gray line between meta and notes */}
              <div className="article-divider-thin" />

              {/* TLDR — single compact paragraph */}
              {tldrText && (
                <div className="article-notes">
                  <p className="article-notes-line">{tldrText}</p>
                </div>
              )}

              {/* Thick white line before article */}
              <div className="article-divider-thick" />
            </>
          )}

          {/* Table of Contents — projects uses lateral TOC in floating bar (same as blog) */}

          {/* Article content */}
          <WikiContent
            html={contentWithIds}
            allWikiNotes={brainIndex?.allWikiNotes}
            className="article-content"
          />

          {/* Comments — Giscus (GitHub Discussions) */}
          <GiscusComments />


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
