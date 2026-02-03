// Project post view — terminal/cyberpunk theme for category === 'projects'

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, calculateReadingTime } from '../lib';
import { allFieldNotes } from '../lib/brainIndex';
import { WikiContent } from '../components/WikiContent';
import { CATEGORY_CONFIG, sectionPath as getSectionPath, postPath } from '../config/categories';
import { ArrowRightIcon } from '../components/icons';
import { posts } from '../data/data';
import { Post } from '../types';
import '../styles/project-article.css';

// ── SVG Icons (inline for full hover control) ──

const GitHubSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const LinkedInSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface ProjectPostViewProps {
  post: Post;
}

export const ProjectPostView: React.FC<ProjectPostViewProps> = ({ post }) => {
  const sectionPathUrl = getSectionPath(post.category);

  // Status label — real project status
  const statusLabel = (() => {
    switch (post.status) {
      case 'completed': return 'FINISHED';
      case 'active': return 'IN PROGRESS';
      case 'in-progress': return 'IN PROGRESS';
      case 'archived': return 'ARCHIVED';
      default: return 'LOGGED';
    }
  })();

  // Date: extract YYYY/MM/DD only (handle ISO strings like "2025-06-01T00:00:00.000Z")
  const formattedDate = (() => {
    if (!post.date) return '';
    const dateStr = String(post.date);
    const cleaned = dateStr.split('T')[0];
    return cleaned.replace(/-/g, '/');
  })();

  // Author display
  const authorDisplay = post.author
    ? post.author.toUpperCase()
    : 'UNKNOWN';

  // Notes: normalize to array
  const notesArray: string[] = (() => {
    if (!post.notes) return [];
    if (Array.isArray(post.notes)) return post.notes;
    return String(post.notes).split('\n').map(l => l.trim()).filter(Boolean);
  })();

  // Related posts
  const recommendedPosts = useMemo(() => {
    const others = posts.filter(p => p.id !== post.id && p.category !== 'fieldnotes');
    const shuffled = others.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [post]);

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
                  <GitHubSvg />
                </a>
              )}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="project-social-btn project-social-linkedin"
                title="Share on LinkedIn"
              >
                <LinkedInSvg />
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

          {/* Article content */}
          <WikiContent
            html={post.content}
            allFieldNotes={allFieldNotes}
            className="project-article"
          />

          {/* Share bar — reader perspective */}
          <div className="project-actions">
            <div className="project-actions-left">
              <span className="project-actions-label">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this project: ${post.displayTitle || post.title}`)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="project-actions-link"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
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
                <GitHubSvg />
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
