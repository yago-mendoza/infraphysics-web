// In-page text search for article content — TreeWalker-based highlight + navigation

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CONTAINER_SELECTOR = '.article-content';
const MARK_ATTR = 'data-page-search';
const MARK_CLASS = 'page-search-highlight';
const CURRENT_CLASS = 'page-search-current';
const MIN_QUERY = 2;
const DEBOUNCE_MS = 200;

export interface ArticleSearch {
  isOpen: boolean;
  query: string;
  matchCount: number;
  currentMatch: number; // 1-based
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (q: string) => void;
  goToNext: () => void;
  goToPrev: () => void;
}

/** Remove all <mark data-page-search> elements, restoring original text nodes */
function clearHighlights() {
  const marks = document.querySelectorAll(`mark[${MARK_ATTR}]`);
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    const text = document.createTextNode(mark.textContent || '');
    parent.replaceChild(text, mark);
    parent.normalize();
  });
}

/** Walk article content, wrap matches in <mark> elements. Returns total match count. */
function highlightMatches(query: string): number {
  const container = document.querySelector(CONTAINER_SELECTOR);
  if (!container) return 0;

  const lowerQuery = query.toLowerCase();
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  const textNodes: Text[] = [];

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const parent = node.parentElement;
    if (!parent) continue;
    const tag = parent.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'mark') continue;
    textNodes.push(node);
  }

  let matchIndex = 0;

  for (const textNode of textNodes) {
    const content = textNode.textContent || '';
    const lowerContent = content.toLowerCase();
    if (lowerContent.indexOf(lowerQuery) === -1) continue;

    const frag = document.createDocumentFragment();
    let cursor = 0;
    let searchFrom = 0;

    while (searchFrom <= lowerContent.length - lowerQuery.length) {
      const idx = lowerContent.indexOf(lowerQuery, searchFrom);
      if (idx === -1) break;

      if (idx > cursor) {
        frag.appendChild(document.createTextNode(content.slice(cursor, idx)));
      }

      const mark = document.createElement('mark');
      mark.className = MARK_CLASS;
      mark.setAttribute(MARK_ATTR, '');
      mark.setAttribute('data-match-index', String(matchIndex));
      mark.textContent = content.slice(idx, idx + query.length);
      frag.appendChild(mark);

      matchIndex++;
      cursor = idx + query.length;
      searchFrom = cursor;
    }

    if (cursor < content.length) {
      frag.appendChild(document.createTextNode(content.slice(cursor)));
    }

    textNode.parentNode!.replaceChild(frag, textNode);
  }

  return matchIndex;
}

/** Visually activate match at 0-based index, scroll into view */
function activateMatch(zeroIndex: number) {
  document.querySelectorAll(`.${CURRENT_CLASS}`).forEach((el) => {
    el.classList.remove(CURRENT_CLASS);
  });
  const mark = document.querySelector(`mark[${MARK_ATTR}][data-match-index="${zeroIndex}"]`);
  if (mark) {
    mark.classList.add(CURRENT_CLASS);
    mark.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
}

export function useArticleSearch(): ArticleSearch {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0); // 1-based
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  // Clear everything on route change
  useEffect(() => {
    clearHighlights();
    setIsOpen(false);
    setQueryState('');
    setMatchCount(0);
    setCurrentMatch(0);
  }, [location.pathname]);

  // Sync DOM highlight whenever currentMatch changes
  useEffect(() => {
    if (currentMatch > 0) {
      requestAnimationFrame(() => activateMatch(currentMatch - 1));
    }
  }, [currentMatch]);

  const performSearch = useCallback((q: string) => {
    clearHighlights();
    if (q.length < MIN_QUERY) {
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }
    const count = highlightMatches(q);
    setMatchCount(count);
    if (count > 0) {
      setCurrentMatch(1);
    } else {
      setCurrentMatch(0);
    }
  }, []);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(q), DEBOUNCE_MS);
  }, [performSearch]);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQueryState('');
    clearHighlights();
    setMatchCount(0);
    setCurrentMatch(0);
  }, []);

  const goToNext = useCallback(() => {
    if (matchCount === 0) return;
    setCurrentMatch((cm) => (cm >= matchCount ? 1 : cm + 1));
  }, [matchCount]);

  const goToPrev = useCallback(() => {
    if (matchCount === 0) return;
    setCurrentMatch((cm) => (cm <= 1 ? matchCount : cm - 1));
  }, [matchCount]);

  return { isOpen, query, matchCount, currentMatch, openSearch, closeSearch, setQuery, goToNext, goToPrev };
}
