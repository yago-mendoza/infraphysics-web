// Fixed top bar for immersive blog article reading — replaces sidebar/mobile nav

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useArticleContext } from '../../contexts/ArticleContext';
import {
  Logo,
  SearchIcon,
  SunIcon,
  MoonIcon,
  CloseIcon,
} from '../icons';
import { sectionPath } from '../../config/categories';

interface ArticleFloatingBarProps {
  onOpenSearch: () => void;
}

export const ArticleFloatingBar: React.FC<ArticleFloatingBarProps> = ({ onOpenSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const { article } = useArticleContext();
  const location = useLocation();

  const [tocOpen, setTocOpen] = useState(false);

  // Headings from article context
  const headings = article?.headings ?? [];
  const topHeadings = headings.filter(h => h.depth === 0);
  const hasToc = headings.length >= 2;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Navigation
  const category = article?.post?.category || '';
  const backUrl = category ? sectionPath(category) : '/home';

  // Close TOC on Escape
  useEffect(() => {
    if (!tocOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTocOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [tocOpen]);

  // Close TOC on route change
  useEffect(() => {
    setTocOpen(false);
  }, [location.pathname]);

  const handleTocClick = useCallback((id: string) => {
    setTocOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }, []);

  const toggleSection = useCallback((id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Group headings: each depth-0 heading owns all subsequent deeper headings until the next depth-0
  const tocSections = useMemo(() => {
    const sections: { parent: typeof headings[0]; children: typeof headings }[] = [];
    for (const h of headings) {
      if (h.depth === 0) {
        sections.push({ parent: h, children: [] });
      } else if (sections.length > 0) {
        sections[sections.length - 1].children.push(h);
      }
    }
    return sections;
  }, [headings]);

  return (
    <>
      {/* Left-side TOC indicator — desktop only */}
      {hasToc && (
        <button
          className="article-toc-indicator"
          onClick={() => setTocOpen(o => !o)}
          title="Table of contents"
          aria-label="Table of contents"
        >
          {topHeadings.map((_, i) => (
            <span key={i} className="article-toc-indicator-line" />
          ))}
        </button>
      )}

      {/* Fixed top bar */}
      <div className="article-floating-bar article-floating-bar--visible">
        {/* Left: back to section */}
        <Link to={backUrl} className="article-bar-back" title="Back to menu">
          <Logo className="w-5 h-5" />
          <span className="article-bar-back-label">Back to menu</span>
        </Link>

        {/* Middle: spacer */}
        <div className="flex-1" />

        {/* Right: controls */}
        <div className="article-bar-controls">
          <button
            className="article-bar-btn"
            onClick={onOpenSearch}
            title="Search (Ctrl+K)"
            aria-label="Search"
          >
            <SearchIcon />
          </button>

          <button
            className="article-bar-btn"
            onClick={toggleTheme}
            title="Toggle theme (Shift+T)"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      {/* Lateral TOC panel */}
      {tocOpen && (
        <>
          <div
            className="article-lateral-toc-backdrop"
            onClick={() => setTocOpen(false)}
          />
          <div className="article-lateral-toc article-lateral-toc--open">
            <div className="article-lateral-toc-header">
              <span className="article-lateral-toc-title">Contents</span>
              <button
                className="article-bar-btn"
                onClick={() => setTocOpen(false)}
                aria-label="Close table of contents"
              >
                <CloseIcon />
              </button>
            </div>
            <ol className="article-lateral-toc-list">
              {tocSections.map((section, i) => {
                const hasChildren = section.children.length > 0;
                const isExpanded = expandedSections.has(section.parent.id);
                return (
                  <li key={section.parent.id}>
                    <div className="article-lateral-toc-row">
                      <button
                        className="article-lateral-toc-link article-lateral-toc-link--parent"
                        onClick={() => handleTocClick(section.parent.id)}
                      >
                        <span className="article-lateral-toc-num">{i + 1}.</span>
                        {section.parent.text}
                      </button>
                      {hasChildren && (
                        <button
                          className="article-lateral-toc-chevron"
                          onClick={() => toggleSection(section.parent.id)}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <svg
                            width="12" height="12" viewBox="0 0 12 12"
                            fill="none" stroke="currentColor" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}
                          >
                            <path d="M4.5 2.5L7.5 6L4.5 9.5" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {hasChildren && isExpanded && (
                      <ol className="article-lateral-toc-children">
                        {section.children.map(child => (
                          <li key={child.id}>
                            <button
                              className="article-lateral-toc-link article-lateral-toc-link--child"
                              onClick={() => handleTocClick(child.id)}
                            >
                              {child.text}
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      )}
    </>
  );
};
