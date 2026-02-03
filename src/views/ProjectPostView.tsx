// Project post view — terminal/cyberpunk theme for category === 'projects'

import React, { useMemo, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatDate, formatDateTerminal } from '../lib';
import { allFieldNotes } from '../lib/brainIndex';
import { WikiContent } from '../components/WikiContent';
import { CATEGORY_CONFIG, sectionPath as getSectionPath, postPath } from '../config/categories';
import { ArrowRightIcon, GitHubIcon, LinkedInIcon } from '../components/icons';
import { posts } from '../data/data';
import { Post } from '../types';
import '../styles/project-article.css';

interface ProjectPostViewProps {
  post: Post;
}

export const ProjectPostView: React.FC<ProjectPostViewProps> = ({ post }) => {
  const sectionPathUrl = getSectionPath(post.category);
  const location = useLocation();

  // Status label — real project status
  const statusLabel = (() => {
    switch (post.status) {
      case 'completed': return 'FINISHED';
      case 'active':
      case 'in-progress': return 'IN PROGRESS';
      case 'archived': return 'ARCHIVED';
      default: return 'LOGGED';
    }
  })();

  const formattedDate = formatDateTerminal(post.date);

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
   *
   * 1. Regex scans post.content for <h1>–<h4> tags.
   * 2. For each heading it generates a URL-safe slug (deduped with a suffix counter),
   *    injects an `id` attribute for anchor linking, and appends a small "back to
   *    index" SVG button (visible on hover via CSS).
   * 3. Headings are collected into a flat array with hierarchical numbering
   *    (1, 1.1, 1.2, 2, …) derived from depth relative to the shallowest heading level.
   *
   * Returns:
   * - headings: ordered list with { level, text, id, number, depth }
   * - contentWithIds: the enriched HTML string ready for WikiContent
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
  // Kept as a scroll listener (rather than IntersectionObserver) because the TOC
  // needs to highlight the *last* heading that scrolled past a fixed offset (120px),
  // which is simpler with getBoundingClientRect than with IO threshold math.
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
    <ol className="project-toc-list">
      {headings.map((h) => (
        <li
          key={h.id}
          className={`project-toc-item project-toc-depth-${h.depth}`}
        >
          <a
            href={`#${h.id}`}
            className={`project-toc-link${activeIds.has(h.id) ? ' project-toc-link--active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span className="project-toc-num">{h.number}</span>
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  ) : null;

  return (
    <div className="project-page-wrapper animate-fade-in">

      {/* ════════════════════════════════════════════
          THE BOX — .project-container
          Everything except Related Posts lives here
          ════════════════════════════════════════════ */}
      <article className="project-container">

        {/* ── HEADER BAR ── */}
        <div className="project-header-bar">
          <span className="project-header-log">
            // {formattedDate}
          </span>
          <span className="project-header-status">
            <span className="project-status-dot" />
            {statusLabel}
          </span>
        </div>

        {/* ── HERO IMAGE ── */}
        {post.thumbnail && (
          <div className="project-hero">
            <img
              src={post.thumbnail}
              alt={post.displayTitle || post.title}
              className="project-hero-img"
            />
            <div className="project-hero-gradient" />
          </div>
        )}

        {/* ── BODY ── */}
        <div className="project-body">

          {/* Nav row: return link + social icons */}
          <div className="project-nav-row">
            <Link to={sectionPathUrl} className="project-back-link">
              &lt; RETURN_TO_ARCHIVES
            </Link>
            <div className="project-social-icons">
              {post.github && (
                <a
                  href={post.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-social-btn project-social-github"
                  title="GitHub"
                >
                  <GitHubIcon size={18} />
                </a>
              )}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="project-social-btn project-social-linkedin"
                title="Share on LinkedIn"
              >
                <LinkedInIcon size={18} />
              </a>
            </div>
          </div>

          {/* Topic pills (PURPLE) — above technologies */}
          {post.topics && post.topics.length > 0 && (
            <div className="project-pills project-pills-topics">
              {post.topics.map(topic => (
                <span key={topic} className="project-pill project-pill-topic">{topic}</span>
              ))}
            </div>
          )}

          {/* Technology pills (LIME) — below topics */}
          {post.technologies && post.technologies.length > 0 && (
            <div className="project-pills project-pills-tech">
              {post.technologies.map(tech => (
                <span key={tech} className="project-pill project-pill-tech">{tech}</span>
              ))}
            </div>
          )}

          {/* TITLE — displayTitle large + subtitle below smaller/gray */}
          <div className="project-title-block">
            <h1 className="project-title">
              {post.displayTitle || post.title}
            </h1>
            {post.subtitle && (
              <p className="project-subtitle">{post.subtitle}</p>
            )}
          </div>

          {/* META — date + author on same line */}
          <div className="project-meta">
            <span className="project-meta-date">{formattedDate}</span>
            <Link to="/contact" className="project-meta-author">{authorDisplay}</Link>
          </div>

          {/* Thin gray line between meta and notes */}
          <div className="project-divider-thin" />

          {/* Author notes */}
          {notesArray.length > 0 && (
            <div className="project-notes">
              {notesArray.map((note, i) => (
                <p key={i} className="project-notes-line">— {note}</p>
              ))}
            </div>
          )}

          {/* Thick white line before article */}
          <div className="project-divider-thick" />

          {/* Table of Contents — collapsible */}
          {headings.length > 1 && (
            <nav className="project-toc" id="project-toc">
              <button
                type="button"
                className="project-toc-toggle"
                onClick={() => setTocOpen(o => !o)}
                aria-expanded={tocOpen}
              >
                <span className="project-toc-label">// CONTENTS</span>
                <svg
                  className={`project-toc-chevron${tocOpen ? ' project-toc-chevron--open' : ''}`}
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
            className="project-article"
          />

          {/* Share bar — reader perspective */}
          <div className="project-actions">
            <div className="project-actions-left">
              <span className="project-actions-label">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this project: ${post.displayTitle || post.title}`)}&url=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="project-actions-link"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}${location.pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="project-actions-link"
              >
                LinkedIn
              </a>
            </div>
            {post.github && (
              <a
                href={post.github}
                target="_blank"
                rel="noopener noreferrer"
                className="project-actions-github"
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
      <div className="project-related">
        <div className="project-related-header">
          <h3 className="project-related-title">Related Case Studies</h3>
          <Link to={sectionPathUrl} className="project-related-viewall">
            View all <ArrowRightIcon />
          </Link>
        </div>
        <div className="project-related-grid">
          {recommendedPosts.map(rec => {
            const recCfg = CATEGORY_CONFIG[rec.category];
            const recColor = recCfg?.colorClass || 'text-gray-400';

            return (
              <Link
                key={rec.id}
                to={postPath(rec.category, rec.id)}
                className="project-related-card group"
              >
                <div className="project-related-thumb">
                  <img
                    src={rec.thumbnail || ''}
                    alt=""
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="project-related-info">
                  <div className="project-related-meta">
                    <span className={`text-[10px] uppercase ${recColor}`}>{rec.category}</span>
                    <span className="text-[10px] text-gray-500">{formatDate(rec.date)}</span>
                  </div>
                  <h4 className="project-related-name">
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
