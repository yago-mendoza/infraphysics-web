// Article post view — unified terminal/cyberpunk theme for all article categories

import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatDate, formatDateTerminal, calculateReadingTime } from '../lib';
import { initBrainIndex, type BrainIndex } from '../lib/brainIndex';
import { getActiveChain, ACTIVE_HEADING_THRESHOLD } from '../lib/headings';
import { WikiContent } from '../components/WikiContent';
import { CATEGORY_CONFIG, STATUS_CONFIG, sectionPath as getSectionPath, postPath, isBlogCategory } from '../config/categories';
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

interface ArticlePostViewProps {
  post: Post;
}

const FEEDBACK_COPY: Record<string, { label: string; placeholder: string }> = {
  projects: {
    label: "If you see something I don't, I'd genuinely like to know.",
    placeholder: 'A flaw in the approach, a better tool, a question I should be asking...',
  },
  threads: {
    label: "If this sparked a 'wait, but...' moment, I want to hear it.",
    placeholder: "A connection I didn't make, a 'yes, but', a book worth reading...",
  },
  bits2bricks: {
    label: 'If the explanation broke down at some point, I\'d like to fix it.',
    placeholder: 'A concept that needs unpacking, a leap that was too big...',
  },
};

const FeedbackForm: React.FC<{ title: string; category: string }> = ({ title, category }) => {
  const copy = FEEDBACK_COPY[category];
  if (!copy) return null;

  const [message, setMessage] = useState('');

  const mailtoHref = `mailto:contact@infraphysics.net?subject=${encodeURIComponent(`[infraphysics] Feedback on: ${title}`)}&body=${encodeURIComponent(message)}`;

  return (
    <div className="article-feedback">
      <span className="article-feedback-heading">End of the line. Thanks for reading.</span>
      <label className="article-feedback-label">{copy.label}</label>
      <div className="article-feedback-row">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={copy.placeholder}
          className="article-feedback-input"
          rows={3}
        />
        <a
          href={mailtoHref}
          className="article-feedback-send"
          onClick={(e) => { if (!message.trim()) e.preventDefault(); }}
        >
          Send
        </a>
      </div>
      <p className="article-feedback-alt">
        Have more to say? —{' '}
        <Link to="/contact" className="article-feedback-link">get in touch</Link>
      </p>
    </div>
  );
};

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
  const sectionPathUrl = getSectionPath(post.category);
  const location = useLocation();
  const navigate = useNavigate();
  const catCfg = CATEGORY_CONFIG[post.category];
  const isBlog = isBlogCategory(post.category);
  const isThreads = post.category === 'threads';
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
  const statusConfig = post.status ? (STATUS_CONFIG[post.status] || null) : null;

  const formattedDate = useMemo(() => formatDateTerminal(post.date), [post.date]);
  const readingTime = useMemo(() => calculateReadingTime(post.content), [post.content]);
  const { views } = useViewCount(location.pathname);
  const { hearts, hearted, toggle: toggleHeart } = useReaction(location.pathname);

  const authorName = post.author || 'Yago Mendoza';
  const authorPath = authorName.toLowerCase() === 'yago mendoza' ? '/about' : '/contact';

  const tldrArray: string[] = !post.tldr
    ? []
    : Array.isArray(post.tldr)
      ? post.tldr
      : String(post.tldr).split('\n').map(l => l.trim()).filter(Boolean);

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
    const maxDepth = Math.max(...raw.map(h => h.level)) - minLevel + 1;
    const counters = new Array(maxDepth).fill(0);

    const headings = raw.map(h => {
      const depth = h.level - minLevel;
      counters[depth]++;
      for (let i = depth + 1; i < maxDepth; i++) counters[i] = 0;
      const parts: number[] = [];
      for (let i = 0; i <= depth; i++) parts.push(counters[i]);
      return { ...h, number: parts.join('.'), depth };
    });

    return { headings, contentWithIds: finalProcessed };
  }, [post.content, isBlog]);

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
      if ((e.target as HTMLElement).closest('a')) return;
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
      // 100% when "Have more to say — get in touch" bottom reaches viewport bottom
      const endMarker = document.querySelector('.article-feedback-alt');
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

  // Related posts — from target category, explicit frontmatter IDs or random fallback
  const targetCategory = catCfg?.relatedCategory || post.category;
  const targetCatCfg = CATEGORY_CONFIG[targetCategory];
  const relatedSectionPath = getSectionPath(targetCategory);
  const relatedAccent = targetCatCfg?.accentVar || 'var(--text-secondary)';

  const recommendedPosts = useMemo(() => {
    const pool = posts.filter(p => p.category === targetCategory && p.id !== post.id);

    // If frontmatter specifies explicit IDs, resolve them (preserving order)
    if (post.related?.length) {
      const explicit = post.related
        .map(id => pool.find(p => p.id === id))
        .filter((p): p is Post => p !== undefined);
      if (explicit.length > 0) return explicit.slice(0, 3);
    }

    // Fallback: Fisher-Yates shuffle for unbiased random pick
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3);
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
            <span className="article-toc-num">{h.number}</span>
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  ) : null;

  const backLabel = catCfg?.backLabel || 'RETURN_TO_ARCHIVES';
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
    <div className={`article-page-wrapper article-${post.category}${isBlog ? ' article-blog' : ''} animate-fade-in`}>
      {createPortal(
        <div ref={progressRef} className="article-progress-bar" style={{ backgroundColor: `var(--cat-${post.category}-accent)` }} />,
        document.body
      )}

      {isThreads ? (
        <article className="article-threads-card">
          {post.thumbnail && (
            <div className={`article-threads-image thumb-${post.thumbnailAspect || 'full'}`}>
              <img
                src={post.thumbnail}
                alt={post.displayTitle || post.title}
                loading="lazy"
                className="article-blog-image-img"
              />
            </div>
          )}

          <div className="article-threads-header-content">
            <ArticleHashtags tags={post.tags} technologies={post.technologies} />

            <div className="article-title-block">
              <h1 className="article-title">
                {post.displayTitle || post.title}
              </h1>
              {post.subtitle && (
                <p className="article-subtitle">{post.subtitle}</p>
              )}
            </div>

            <BlogMetabar date={post.date} authorName={authorName} authorPath={authorPath} readingTime={readingTime} views={null} hearts={null} hearted={hearted} toggleHeart={toggleHeart} shareDropdown={null} formatDate={formatDate} />

            <div className="article-engagement-row article-threads-engagement">
              <div className="article-engagement-left">
                {views != null && (
                  <span className="article-meta-views"><EyeIcon size={15} /> {views}</span>
                )}
                {hearts != null && (
                  <button onClick={toggleHeart} className="article-heart-btn" title={hearted ? 'Unlike' : 'Like'}>
                    <HeartIcon size={15} filled={hearted} /> {hearts}
                  </button>
                )}
              </div>
              {shareDropdown}
            </div>

            {post.lead && (
              <div className="article-blog-lead">
                <p>{post.lead}</p>
              </div>
            )}
          </div>

          <div className="article-threads-body">
            <WikiContent
              html={contentWithIds}
              allFieldNotes={brainIndex?.allFieldNotes}
              className="article-content"
            />
            <FeedbackForm title={post.displayTitle || post.title} category={post.category} />
            <GiscusComments />
          </div>
        </article>
      ) : (
      <article className="article-container">

        {/* ── HEADER BAR (projects only) ── */}
        {!isBlog && (
          <div className="article-header-bar">
            <span className="article-header-log">
              // {formattedDate}
            </span>
            {statusConfig && (
              <span className="article-header-status" style={{ color: statusConfig.dotColor }}>
                <span className="article-status-dot" style={{ background: statusConfig.dotColor }} />
                {statusConfig.label}
              </span>
            )}
          </div>
        )}

        {/* ── HERO IMAGE (projects only — grayscale) ── */}
        {!isBlog && post.thumbnail && (
          <div className={`article-hero thumb-${post.thumbnailAspect || 'full'} shade-${post.thumbnailShading || 'heavy'}`}>
            <img
              src={post.thumbnail}
              alt={post.displayTitle || post.title}
              loading="lazy"
              className="article-hero-img"
            />
            <div className="article-hero-gradient" />
          </div>
        )}

        {/* ── BODY ── */}
        <div className="article-body">

          {/* Nav row: back link + engagement buttons */}
          <div className="article-nav-row">
            <Link to={sectionPathUrl} className="article-back-link">
              &lt; {backLabel}
            </Link>
            <div className="article-engagement-row">
              {views != null && (
                <span className="article-meta-views"><EyeIcon size={15} /> {views}</span>
              )}
              {hearts != null && (
                <button onClick={toggleHeart} className="article-heart-btn" title={hearted ? 'Unlike' : 'Like'}>
                  <HeartIcon size={15} filled={hearted} /> {hearts}
                </button>
              )}
              {!isBlog && (
                <a
                  href={post.github || 'https://github.com/yago-mendoza'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-social-btn article-social-github"
                  title={post.github ? 'View on GitHub' : 'GitHub'}
                >
                  <GitHubIcon size={18} />
                </a>
              )}
              {shareDropdown}
            </div>
          </div>

          {/* Blog image — above meta/title (blog only) */}
          {isBlog && post.thumbnail && (
            <div className={`article-blog-image thumb-${post.thumbnailAspect || 'full'}`}>
              <img
                src={post.thumbnail}
                alt={post.displayTitle || post.title}
                loading="lazy"
                className="article-blog-image-img"
              />
            </div>
          )}

          {/* Tags — pills for projects */}
          {!isBlog && (
            <>
              {post.tags && post.tags.length > 0 && (
                <div className="article-pills article-pills-topics">
                  {post.tags.map(tag => (
                    <span key={tag} className="article-pill article-pill-topic">{tag}</span>
                  ))}
                </div>
              )}
              {post.technologies && post.technologies.length > 0 && (
                <div className="article-pills article-pills-tech">
                  {post.technologies.map(tech => (
                    <span key={tech} className="article-pill article-pill-tech">{tech}</span>
                  ))}
                </div>
              )}
            </>
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

          {/* Meta bar (blog non-threads only — threads has its own in header card) */}
          {isBlog && post.category !== 'threads' && (
            <BlogMetabar date={post.date} authorName={authorName} authorPath={authorPath} readingTime={readingTime} views={null} hearts={null} hearted={hearted} toggleHeart={toggleHeart} shareDropdown={null} formatDate={formatDate} />
          )}

          {/* Lead text (blog non-threads only — threads has its own in header card) */}
          {isBlog && post.category !== 'threads' && post.lead && (
            <div className="article-blog-lead">
              <p>{post.lead}</p>
            </div>
          )}

          {/* NOTES + DIVIDERS (projects only) */}
          {!isBlog && (
            <>
              {/* Thin gray line between meta and notes */}
              <div className="article-divider-thin" />

              {/* TLDR */}
              {tldrArray.length > 0 && (
                <div className="article-notes">
                  {tldrArray.map((line, i) => (
                    <p key={i} className="article-notes-line">— {line}</p>
                  ))}
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
            allFieldNotes={brainIndex?.allFieldNotes}
            className="article-content"
          />

          {/* Feedback form — categories with FEEDBACK_COPY */}
          <FeedbackForm title={post.displayTitle || post.title} category={post.category} />

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
                  className="w-full h-full object-cover transition-transform scale-[1.03] group-hover:scale-100"
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
