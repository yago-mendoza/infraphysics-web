// Fixed top bar for immersive article reading — replaces sidebar/mobile nav

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useArticleContext } from '../../contexts/ArticleContext';
import { useArticleSearch } from '../../hooks/useArticleSearch';
import {
  SearchIcon,
  SunIcon,
  MoonIcon,
  CloseIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '../icons';
import { sectionPath } from '../../config/categories';
import { getActiveChain, ACTIVE_HEADING_THRESHOLD } from '../../lib/headings';

interface ArticleFloatingBarProps {
  onOpenSearch: () => void;
}

export const ArticleFloatingBar: React.FC<ArticleFloatingBarProps> = ({ onOpenSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const { article } = useArticleContext();
  const location = useLocation();
  const search = useArticleSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [tocOpen, setTocOpen] = useState(false);

  // Headings from article context
  const headings = article?.headings ?? [];
  const topHeadings = headings.filter(h => h.depth === 0);
  const hasToc = headings.length >= 2;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Active heading tracking for TOC highlight
  const [activeChain, setActiveChain] = useState<Set<string>>(new Set());

  // Snapshot active heading when TOC opens + track scroll while open
  useEffect(() => {
    if (!tocOpen || headings.length < 2) return;

    const computeActive = () => {
      let activeId = '';
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_HEADING_THRESHOLD) activeId = h.id;
      }
      setActiveChain(getActiveChain(headings, activeId));
    };

    computeActive();

    // Auto-expand the section containing the active heading
    let activeId = '';
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el && el.getBoundingClientRect().top <= ACTIVE_HEADING_THRESHOLD) activeId = h.id;
    }
    const chain = getActiveChain(headings, activeId);
    const parentIds = headings.filter(h => h.depth === 0 && chain.has(h.id)).map(h => h.id);
    if (parentIds.length > 0) {
      setExpandedSections(prev => {
        const next = new Set(prev);
        parentIds.forEach(id => next.add(id));
        return next;
      });
    }

    window.addEventListener('scroll', computeActive, { passive: true });
    return () => window.removeEventListener('scroll', computeActive);
  }, [tocOpen, headings]);

  // Navigation
  const category = article?.post?.category || '';
  const backUrl = category ? sectionPath(category) : '/home';

  // Focus input when search opens
  useEffect(() => {
    if (search.isOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [search.isOpen]);

  // Intercept Ctrl+F / Cmd+F → open in-page search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!search.isOpen) {
          search.openSearch();
        } else {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [search.isOpen, search.openSearch]);

  // Close TOC on Escape (when search is not open)
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

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      search.closeSearch();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        search.goToPrev();
      } else {
        search.goToNext();
      }
    }
  }, [search]);

  return (
    <>
      {/* Left-side TOC indicator — desktop only */}
      {hasToc && (
        <button
          className={`article-toc-indicator article-${category}`}
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span className="article-bar-back-label">Back to menu</span>
        </Link>

        {/* Center: page search */}
        <div className="flex-1 flex justify-center">
          {search.isOpen ? (
            <div className="article-page-search">
              <input
                ref={searchInputRef}
                type="text"
                className="article-page-search-input"
                placeholder="Find in page..."
                value={search.query}
                onChange={(e) => search.setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              {search.query.length >= 2 && (
                <span className="article-page-search-count">
                  {search.matchCount > 0
                    ? `${search.currentMatch} of ${search.matchCount}`
                    : 'No matches'}
                </span>
              )}
              <button
                className="article-bar-btn article-page-search-btn"
                onClick={search.goToPrev}
                disabled={search.matchCount === 0}
                title="Previous match (Shift+Enter)"
                aria-label="Previous match"
              >
                <ChevronUpIcon />
              </button>
              <button
                className="article-bar-btn article-page-search-btn"
                onClick={search.goToNext}
                disabled={search.matchCount === 0}
                title="Next match (Enter)"
                aria-label="Next match"
              >
                <ChevronDownIcon />
              </button>
              <button
                className="article-bar-btn article-page-search-btn"
                onClick={search.closeSearch}
                title="Close search (Escape)"
                aria-label="Close search"
              >
                <CloseIcon />
              </button>
            </div>
          ) : (
            <button
              className="article-bar-find-prompt"
              onClick={search.openSearch}
              title="Find in page (Ctrl+F)"
            >
              <SearchIcon />
              <span>Find in page</span>
            </button>
          )}
        </div>

        {/* Right: controls */}
        <div className="article-bar-controls">
          {hasToc && (
            <button
              className="article-bar-btn"
              onClick={() => setTocOpen(o => !o)}
              title="Table of contents"
              aria-label="Table of contents"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="17" y2="12" />
                <line x1="3" y1="18" x2="13" y2="18" />
              </svg>
            </button>
          )}
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
          <div className={`article-lateral-toc article-lateral-toc--open article-${category}`}>
            <div className="article-lateral-toc-header">
              <span className="article-lateral-toc-title">{category === 'projects' ? '// CONTENTS' : 'CONTENTS'}</span>
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
                        className={`article-lateral-toc-link article-lateral-toc-link--parent${activeChain.has(section.parent.id) ? ' article-lateral-toc-link--active' : ''}`}
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
                              className={`article-lateral-toc-link article-lateral-toc-link--child${activeChain.has(child.id) ? ' article-lateral-toc-link--active' : ''}`}
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
