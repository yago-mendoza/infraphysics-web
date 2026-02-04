// Article post view — unified terminal/cyberpunk theme for all article categories

import React, { useMemo, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatDate, formatDateTerminal, calculateReadingTime } from '../lib';
import { allFieldNotes } from '../lib/brainIndex';
import { WikiContent } from '../components/WikiContent';
import { CATEGORY_CONFIG, sectionPath as getSectionPath, postPath } from '../config/categories';
import { ArrowRightIcon, GitHubIcon, LinkedInIcon } from '../components/icons';
import { posts } from '../data/data';
import { Post } from '../types';
import '../styles/article.css';

interface ArticlePostViewProps {
  post: Post;
}

export const ArticlePostView: React.FC<ArticlePostViewProps> = ({ post }) => {
  const sectionPathUrl = getSectionPath(post.category);
  const location = useLocation();
  const catCfg = CATEGORY_CONFIG[post.category];

  // Status label + dot color — derived from PostStatus
  const statusConfig = (() => {
    switch (post.status) {
      case 'ongoing':      return { label: 'ONGOING',      dotColor: '#a78bfa' }; // violet-400
      case 'implemented':  return { label: 'IMPLEMENTED',  dotColor: '#34d399' }; // emerald-400
      case 'active':       return { label: 'ACTIVE',       dotColor: '#34d399' }; // emerald-400
      case 'in-progress':  return { label: 'IN PROGRESS',  dotColor: '#fbbf24' }; // amber-400
      case 'completed':    return { label: 'COMPLETED',    dotColor: '#60a5fa' }; // blue-400
      case 'archived':     return { label: 'ARCHIVED',     dotColor: '#9ca3af' }; // gray-400
      default:             return null;
    }
  })();

  const formattedDate = formatDateTerminal(post.date);
  const readingTime = calculateReadingTime(post.content);

  const authorDisplay = post.author
    ? post.author.toUpperCase()
    : 'UNKNOWN';

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
        const text = inner.replace(/<[^>]*>/g, '').trim();
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
        return `<${tag}${attrs || ''} id="${id}">${inner}</${tag}>`;
      }
    );

    if (raw.length === 0) {
      return { headings: [] as { level: number; text: string; id: string; number: string; depth: number }[], contentWithIds: processed };
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

    return { headings, contentWithIds: processed };
  }, [post.content]);

  const [tocOpen, setTocOpen] = useState(false);

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

  // Related posts — Fisher-Yates shuffle (unbiased, unlike sort+Math.random)
  const recommendedPosts = useMemo(() => {
    const others = posts.filter(p => p.id !== post.id && p.category !== 'fieldnotes');
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    return others.slice(0, 3);
  }, [post]);

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
    <div className={`article-page-wrapper article-${post.category} animate-fade-in`}>

      {/* ════════════════════════════════════════════
          THE BOX — .article-container
          Everything except Related Posts lives here
          ════════════════════════════════════════════ */}
      <article className="article-container">

        {/* ── HEADER BAR ── */}
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

        {/* ── HERO IMAGE ── */}
        {post.thumbnail && (
          <div className="article-hero">
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

          {/* Nav row: return link + social icons */}
          <div className="article-nav-row">
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
          </div>

          {/* Tag pills — above technologies */}
          {post.tags && post.tags.length > 0 && (
            <div className="article-pills article-pills-topics">
              {post.tags.map(tag => (
                <span key={tag} className="article-pill article-pill-topic">{tag}</span>
              ))}
            </div>
          )}

          {/* Technology pills — below topics */}
          {post.technologies && post.technologies.length > 0 && (
            <div className="article-pills article-pills-tech">
              {post.technologies.map(tech => (
                <span key={tech} className="article-pill article-pill-tech">{tech}</span>
              ))}
            </div>
          )}

          {/* TITLE — displayTitle large + subtitle below smaller/gray */}
          <div className="article-title-block">
            <h1 className="article-title">
              {post.displayTitle || post.title}
            </h1>
            {post.subtitle && (
              <p className="article-subtitle">{post.subtitle}</p>
            )}
          </div>

          {/* META — date + reading time + author on same line */}
          <div className="article-meta">
            <span className="article-meta-date">{formattedDate}</span>
            <span className="article-meta-reading-time">{readingTime} min read</span>
            <Link to="/contact" className="article-meta-author">{authorDisplay}</Link>
          </div>

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

          {/* Table of Contents — collapsible */}
          {headings.length > 1 && (
            <nav className="article-toc" id="article-toc">
              <button
                type="button"
                className="article-toc-toggle"
                onClick={() => setTocOpen(o => !o)}
                aria-expanded={tocOpen}
              >
                <span className="article-toc-label">// CONTENTS</span>
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
            <div className="article-actions-left">
              <span className="article-actions-label">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out: ${post.displayTitle || post.title}`)}&url=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="article-actions-link"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="article-actions-link"
              >
                LinkedIn
              </a>
            </div>
            {post.github && (
              <a
                href={post.github}
                target="_blank"
                rel="noopener noreferrer"
                className="article-actions-github"
              >
                <GitHubIcon size={18} />
                View on GitHub
              </a>
            )}
          </div>

        </div>
      </article>

      {/* ════════════════════════════════════════════
          RELATED POSTS — OUTSIDE the box
          ════════════════════════════════════════════ */}
      <div className="article-related">
        <div className="article-related-header">
          <h3 className="article-related-title">{relatedLabel}</h3>
          <Link to={sectionPathUrl} className="article-related-viewall">
            View all <ArrowRightIcon />
          </Link>
        </div>
        <div className="article-related-grid">
          {recommendedPosts.map(rec => {
            const recCfg = CATEGORY_CONFIG[rec.category];
            const recColor = recCfg?.colorClass || 'text-gray-400';

            return (
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
                    <span className={`text-[10px] uppercase ${recColor}`}>{rec.category}</span>
                    <span className="text-[10px] text-gray-500">{formatDate(rec.date)}</span>
                  </div>
                  <h4 className="article-related-name">
                    {rec.displayTitle || rec.title}
                  </h4>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
};
