// Article post view — unified terminal/cyberpunk theme for all article categories

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatDate, formatDateTerminal, calculateReadingTime } from '../lib';
import { allFieldNotes } from '../lib/brainIndex';
import { WikiContent } from '../components/WikiContent';
import { CATEGORY_CONFIG, STATUS_CONFIG, sectionPath as getSectionPath, postPath, isBlogCategory } from '../config/categories';
import { ArrowRightIcon, GitHubIcon, LinkedInIcon, TwitterIcon, RedditIcon, HackerNewsIcon, ClipboardIcon, CheckIcon } from '../components/icons';
import { posts } from '../data/data';
import { Post } from '../types';
import { useArticleContext } from '../contexts/ArticleContext';
import { useKeyboardShortcuts, ShortcutDef } from '../hooks/useKeyboardShortcuts';
import '../styles/article.css';

interface ArticlePostViewProps {
  post: Post;
}

export const ArticlePostView: React.FC<ArticlePostViewProps> = ({ post }) => {
  const sectionPathUrl = getSectionPath(post.category);
  const location = useLocation();
  const navigate = useNavigate();
  const catCfg = CATEGORY_CONFIG[post.category];
  const isBlog = isBlogCategory(post.category);
  const [copied, setCopied] = useState(false);
  const { setArticleState, clearArticleState, updateActiveHeading } = useArticleContext();

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

  const formattedDate = formatDateTerminal(post.date);
  const readingTime = calculateReadingTime(post.content);

  const authorName = post.author || 'Yago Mendoza';
  const authorPath = authorName.toLowerCase() === 'yago mendoza' ? '/about' : '/contact';

  const notesArray: string[] = !post.notes
    ? []
    : Array.isArray(post.notes)
      ? post.notes
      : String(post.notes).split('\n').map(l => l.trim()).filter(Boolean);

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
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
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
        const tocArrow = `<a class="heading-toc-arrow" data-toc-id="${id}" aria-label="Back to table of contents"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5L6 2.5L8 4.5"/><path d="M4 7.5L6 9.5L8 7.5"/></svg></a>`;
        return `<${tag}${attrs || ''} id="${id}">${inner}${tocArrow}</${tag}>`;
      }
    );

    // Blog posts: strip the first h1 (duplicates the displayTitle rendered above)
    let finalProcessed = processed;
    if (isBlog) {
      finalProcessed = finalProcessed.replace(/<h1[\s][^>]*>.*?<\/h1>/i, '');
      // Also remove it from TOC entries
      const firstH1Idx = raw.findIndex(h => h.level === 1);
      if (firstH1Idx !== -1) raw.splice(firstH1Idx, 1);
    }

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

  // Scroll-based active heading tracking for inline TOC highlight.
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length < 2) return;

    let currentActiveId = '';

    const handleScroll = () => {
      let newActiveId = '';
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            newActiveId = h.id;
          }
        }
      }
      if (newActiveId !== currentActiveId) {
        currentActiveId = newActiveId;
        setActiveId(newActiveId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Click handler for heading TOC arrows — opens TOC, scrolls to it, blinks entry
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const arrow = (e.target as HTMLElement).closest('.heading-toc-arrow') as HTMLElement | null;
      if (!arrow) return;
      e.preventDefault();
      const tocId = arrow.dataset.tocId;
      if (!tocId) return;

      // Open TOC if collapsed
      setTocOpen(true);

      // Wait for React render, then scroll + blink
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const tocEl = document.getElementById('article-toc');
          if (tocEl) {
            tocEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }

          // Delay for scroll to arrive, then blink the matching link
          setTimeout(() => {
            const link = document.querySelector(`.article-toc-link[href="#${tocId}"]`) as HTMLElement | null;
            if (link) {
              link.classList.add('toc-blink');
              link.addEventListener('animationend', () => link.classList.remove('toc-blink'), { once: true });
            }
          }, 300);
        });
      });
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Compute active heading + its ancestor chain (parent sections)
  const activeIds = useMemo(() => {
    const ids = new Set<string>();
    if (!activeId || headings.length < 2) return ids;

    const activeIndex = headings.findIndex(h => h.id === activeId);
    if (activeIndex === -1) return ids;

    ids.add(activeId);

    // Walk backwards to find ancestor headings at each shallower depth
    let currentDepth = headings[activeIndex].depth;
    for (let i = activeIndex - 1; i >= 0; i--) {
      if (headings[i].depth < currentDepth) {
        ids.add(headings[i].id);
        currentDepth = headings[i].depth;
        if (currentDepth === 0) break;
      }
    }

    return ids;
  }, [activeId, headings]);

  // Push article state to ArticleContext (consumed by SearchPalette)
  useEffect(() => {
    setArticleState({
      post,
      headings: headings as any,
      activeHeadingId: activeId,
      nextPost,
      prevPost,
    });
    return () => clearArticleState();
  }, [post, headings, nextPost, prevPost]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync active heading ID to context
  useEffect(() => {
    updateActiveHeading(activeId);
  }, [activeId, updateActiveHeading]);

  // Contextual keyboard shortcuts
  const scrollToHeading = useCallback((direction: 'next' | 'prev') => {
    if (headings.length < 2) return;
    const activeIndex = headings.findIndex(h => h.id === activeId);
    let targetIdx: number;
    if (direction === 'next') {
      targetIdx = activeIndex < headings.length - 1 ? activeIndex + 1 : headings.length - 1;
      // If no active, go to first
      if (activeIndex === -1) targetIdx = 0;
    } else {
      targetIdx = activeIndex > 0 ? activeIndex - 1 : 0;
      if (activeIndex === -1) targetIdx = 0;
    }
    document.getElementById(headings[targetIdx].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [headings, activeId]);

  const articleShortcuts = useMemo<ShortcutDef[]>(() => [
    { key: 'g', label: 'GitHub', action: () => { if (post.github) window.open(post.github, '_blank'); }, enabled: !!post.github },
    { key: 'd', label: 'Demo', action: () => { if (post.demo) window.open(post.demo, '_blank'); }, enabled: !!post.demo },
    { key: 'j', label: 'Next section', action: () => scrollToHeading('next'), enabled: headings.length > 1 },
    { key: 'k', label: 'Prev section', action: () => scrollToHeading('prev'), enabled: headings.length > 1 },
    { key: 't', label: 'Top', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { key: 'b', label: 'Bottom', action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
    { key: 'n', label: 'Newer', action: () => { if (nextPost) navigate(postPath(nextPost.category, nextPost.id)); }, enabled: !!nextPost },
    { key: 'p', label: 'Older', action: () => { if (prevPost) navigate(postPath(prevPost.category, prevPost.id)); }, enabled: !!prevPost },
  ], [post.github, post.demo, headings.length, nextPost, prevPost, scrollToHeading, navigate]);

  useKeyboardShortcuts(articleShortcuts);

  // Related posts — from target category, explicit frontmatter IDs or random fallback
  const targetCategory = catCfg?.relatedCategory || post.category;
  const targetCatCfg = CATEGORY_CONFIG[targetCategory];
  const relatedSectionPath = getSectionPath(targetCategory);
  const relatedHoverColor = targetCatCfg?.colorClass || 'text-th-secondary';

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

  // TOC list rendering
  const tocList = headings.length > 1 ? (
    <ol className="article-toc-list">
      {headings.map((h) => (
        <li
          key={h.id}
          className={`article-toc-item article-toc-depth-${h.depth}`}
        >
          <a
            href={`#${h.id}`}
            className={`article-toc-link${activeIds.has(h.id) ? ' article-toc-link--active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  return (
    <div className={`article-page-wrapper article-${post.category}${isBlog ? ' article-blog' : ''} animate-fade-in`}>

      {/* ════════════════════════════════════════════
          THE BOX — .article-container
          Everything except Related Posts lives here
          ════════════════════════════════════════════ */}
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
              className="article-hero-img"
            />
            <div className="article-hero-gradient" />
          </div>
        )}

        {/* ── BODY ── */}
        <div className="article-body">

          {/* Nav row: return link / breadcrumbs + social icons */}
          <div className="article-nav-row">
            {isBlog ? (
              <nav className="article-breadcrumbs">
                <Link to="/home" className="article-breadcrumb-link">home</Link>
                <span className="article-breadcrumb-sep">/</span>
                <span className="article-breadcrumb-static">blog</span>
                <span className="article-breadcrumb-sep">/</span>
                <Link to={sectionPathUrl} className="article-breadcrumb-link">
                  {catCfg?.breadcrumbLabel || post.category}
                </Link>
                <span className="article-breadcrumb-sep">/</span>
                <span className="article-breadcrumb-current">
                  {(post.displayTitle || post.title).toLowerCase()}
                </span>
              </nav>
            ) : (
              <>
                <Link to={sectionPathUrl} className="article-back-link">
                  &lt; {backLabel}
                </Link>
                <div className="article-social-icons">
                  {post.github && (
                    <a
                      href={post.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-social-btn article-social-github"
                      title="GitHub"
                    >
                      <GitHubIcon size={18} />
                    </a>
                  )}
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-social-btn article-social-linkedin"
                    title="Share on LinkedIn"
                  >
                    <LinkedInIcon size={18} />
                  </a>
                </div>
              </>
            )}
          </div>

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

          {/* META — above title for blog, below for projects */}
          {isBlog && (
            <div className="article-meta">
              <span className="article-meta-date">{formatDate(post.date)}</span>
              <span className="article-meta-reading-time">{readingTime} min read</span>
              <Link to={authorPath} className="article-meta-author">{authorName}</Link>
            </div>
          )}

          {/* Tag pills — below meta, above title (blog only) */}
          {isBlog && (post.tags?.length || post.technologies?.length) ? (
            <div className="article-hashtags">
              {[
                ...(post.tags || []).map(t => ({ label: t, tech: false })),
                ...(post.technologies || []).map(t => ({ label: t, tech: true })),
              ]
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(({ label, tech }) => (
                  <span key={label} className={`article-hashtag${tech ? ' article-hashtag-tech' : ''}`}>#{label}</span>
                ))}
            </div>
          ) : null}

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

          {/* Separator between subtitle and image (blog only) */}
          {isBlog && <hr className="article-blog-sep" />}

          {/* Blog image — natural color, below meta (blog only) */}
          {isBlog && post.thumbnail && (
            <div className={`article-blog-image thumb-${post.thumbnailAspect || 'full'}`}>
              <img
                src={post.thumbnail}
                alt={post.displayTitle || post.title}
                className="article-blog-image-img"
              />
            </div>
          )}

          {/* NOTES + DIVIDERS (projects only) */}
          {!isBlog && (
            <>
              {/* Thin gray line between meta and notes */}
              <div className="article-divider-thin" />

              {/* Author notes */}
              {notesArray.length > 0 && (
                <div className="article-notes">
                  {notesArray.map((note, i) => (
                    <p key={i} className="article-notes-line">— {note}</p>
                  ))}
                </div>
              )}

              {/* Thick white line before article */}
              <div className="article-divider-thick" />
            </>
          )}

          {/* Table of Contents — collapsible */}
          {headings.length > 1 && (
            <nav className={`article-toc${isBlog ? ' article-toc--blog' : ''}`} id="article-toc">
              <button
                type="button"
                className="article-toc-toggle"
                onClick={() => setTocOpen(o => !o)}
                aria-expanded={tocOpen}
              >
                <span className="article-toc-label">{isBlog ? 'Contents' : '// CONTENTS'}</span>
                <svg
                  className={`article-toc-chevron${tocOpen ? ' article-toc-chevron--open' : ''}`}
                  viewBox="0 0 12 12"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 4.5L6 7.5L9 4.5" />
                </svg>
              </button>
              {tocOpen && tocList}
            </nav>
          )}

          {/* Article content */}
          <WikiContent
            html={contentWithIds}
            allFieldNotes={allFieldNotes}
            className="article-content"
          />

          {/* Share bar — reader perspective */}
          <div className="article-actions">
            <div className="article-share-icons">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out: ${post.displayTitle || post.title}`)}&url=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="article-share-icon article-social-twitter"
                title="Share on X"
              >
                <TwitterIcon size={18} />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="article-share-icon article-social-linkedin"
                title="Share on LinkedIn"
              >
                <LinkedInIcon size={18} />
              </a>
              <a
                href={`https://reddit.com/submit?url=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}&title=${encodeURIComponent(post.displayTitle || post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="article-share-icon article-social-reddit"
                title="Share on Reddit"
              >
                <RedditIcon size={18} />
              </a>
              <a
                href={`https://news.ycombinator.com/submitlink?u=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}&t=${encodeURIComponent(post.displayTitle || post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="article-share-icon article-social-hn"
                title="Share on Hacker News"
              >
                <HackerNewsIcon size={18} />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}${location.pathname}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="article-share-icon article-social-copy"
                title={copied ? 'Copied!' : 'Copy link'}
              >
                {copied ? <CheckIcon size={18} /> : <ClipboardIcon size={18} />}
              </button>
            </div>
          </div>

        </div>
      </article>

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
                  alt=""
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="article-related-info">
                <div className="article-related-meta">
                  <span className={`text-[10px] uppercase ${relatedHoverColor}`}>{rec.category}</span>
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
