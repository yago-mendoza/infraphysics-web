// Command palette triggered by search button or Ctrl+K / Cmd+K

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { posts } from '../data/data';
import { shortNotes } from '../data/notes';
import { postPath, sectionPath, secondBrainPath } from '../config/categories';
import { ContentEntityIcon } from '../config/contentEntities';
import { COMMAND_KEY } from './layout/Sidebar';
import { initBrainIndex, type BrainIndex } from '../lib/brainIndex';
import { useArticleContext } from '../contexts/ArticleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCursorPreference } from '../contexts/CursorPreferenceContext';
import {
  HomeIcon,
  GitHubIcon,
  DiceIcon,
  MailIcon,
  SearchIcon,
  ExternalLinkIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
} from './icons';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickAction {
  label: string;
  keywords?: string[];
  displayLabel?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  group?: 'contextual' | 'global' | 'nav' | 'concept' | 'notes' | 'articles-title' | 'articles-content';
}

/** Strip HTML tags for plain-text search */
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

// This module is lazy-loaded. Build normalized article text once when search is
// first requested instead of stripping HTML and lower-casing every keystroke.
const SEARCHABLE_POSTS = posts.map(post => ({
  post,
  title: (post.displayTitle || post.title).toLowerCase(),
  description: post.description.toLowerCase(),
  plain: stripHtml(post.content),
})).map(entry => ({ ...entry, plainLower: entry.plain.toLowerCase() }));

/** Every query word must match the start of at least one label word */
const matchesWordStart = (label: string, q: string): boolean => {
  const labelWords = label.toLowerCase().split(/\s+/);
  const queryWords = q.toLowerCase().split(/\s+/).filter(Boolean);
  return queryWords.every(qw => labelWords.some(lw => lw.startsWith(qw)));
};

/** Highlight first occurrence of query inside text (case-insensitive, preserves original case) */
const highlightMatch = (text: string, query: string): React.ReactNode => {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-400/30 text-inherit rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
};

/** Extract a short snippet around the first match */
const extractSnippet = (text: string, query: string, radius = 40): string => {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  let snippet = text.slice(start, end).replace(/\s+/g, ' ');
  if (start > 0) snippet = '\u2026' + snippet;
  if (end < text.length) snippet += '\u2026';
  return snippet;
};

export const SearchPalette: React.FC<SearchPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { article } = useArticleContext();
  const { theme, toggleTheme } = useTheme();
  const { aestheticCursor, toggleAestheticCursor } = useCursorPreference();

  // Animate open/close
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const id = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  // Async brain index for concept search
  const [brainIndex, setBrainIndex] = useState<BrainIndex | null>(null);
  useEffect(() => {
    if (!isOpen || brainIndex) return;
    let cancelled = false;
    initBrainIndex().then(index => { if (!cancelled) setBrainIndex(index); }).catch(() => {});
    return () => { cancelled = true; };
  }, [isOpen, brainIndex]);
  const allFieldNotes = brainIndex?.allFieldNotes ?? [];
  const searchableConcepts = useMemo(() => allFieldNotes.map(note => {
    const address = note.address || '';
    const lastSegment = address.includes('//') ? address.split('//').pop() || '' : address;
    return {
      note,
      haystack: [note.name || '', lastSegment, ...(note.aliases || [])].join('\u0000').toLowerCase(),
    };
  }), [allFieldNotes]);

  const executeAndClose = useCallback((fn: () => void) => {
    fn();
    onClose();
  }, [onClose]);

  // ── Current page detection ──
  const pathname = location.pathname;
  const isHome = pathname === '/home' || pathname === '/';
  const currentCategory = useMemo(() => {
    const m = pathname.match(/^\/(?:lab|blog)\/(projects|threads|bits2bricks)/);
    return m ? m[1] : null;
  }, [pathname]);

  // Build all actions: contextual (article) → navigation → global shortcuts
  const actions = useMemo<QuickAction[]>(() => {
    const result: QuickAction[] = [];

    // ── Contextual actions (only when viewing an article) ──
    if (article) {
      const { post, nextPost, prevPost } = article;
      if (post.github) {
        result.push({
          label: 'Open GitHub Repo',
          icon: <GitHubIcon size={22} />,
          action: () => executeAndClose(() => window.open(post.github!, '_blank')),
          shortcut: 'G',
          group: 'contextual',
        });
      }
      if (post.demo) {
        result.push({
          label: 'View Live Demo',
          icon: <ExternalLinkIcon />,
          action: () => executeAndClose(() => window.open(post.demo!, '_blank')),
          shortcut: 'D',
          group: 'contextual',
        });
      }
      result.push({
        label: 'Scroll to Top',
        icon: <span className="w-[22px] h-[22px] flex items-center justify-center text-[13px] text-th-secondary">↑</span>,
        action: () => executeAndClose(() => window.scrollTo({ top: 0, behavior: 'smooth' })),
        shortcut: 'T',
        group: 'contextual',
      });
      result.push({
        label: 'Scroll to Bottom',
        icon: <span className="w-[22px] h-[22px] flex items-center justify-center text-[13px] text-th-secondary">↓</span>,
        action: () => executeAndClose(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })),
        shortcut: 'B',
        group: 'contextual',
      });
      if (nextPost) {
        result.push({
          label: `Newer: ${nextPost.displayTitle || nextPost.title}`,
          icon: <span className="w-[22px] h-[22px] flex items-center justify-center text-[13px] text-th-secondary">→</span>,
          action: () => executeAndClose(() => navigate(postPath(nextPost.category, nextPost.id))),
          shortcut: 'N',
          group: 'contextual',
        });
      }
      if (prevPost) {
        result.push({
          label: `Older: ${prevPost.displayTitle || prevPost.title}`,
          icon: <span className="w-[22px] h-[22px] flex items-center justify-center text-[13px] text-th-secondary">←</span>,
          action: () => executeAndClose(() => navigate(postPath(prevPost.category, prevPost.id))),
          shortcut: 'P',
          group: 'contextual',
        });
      }
    }

    // ── Navigation actions (hide item matching current section/page) ──
    const navItems: { label: string; keywords?: string[]; icon: React.ReactNode; path: string; external?: boolean; hideWhen?: () => boolean }[] = [
      { label: 'Go to Home', keywords: ['start', 'landing', 'index'], icon: <HomeIcon />, path: '/home', hideWhen: () => isHome },
      { label: 'About', keywords: ['profile', 'bio', 'me', 'yago'], icon: <UserIcon />, path: '/about' },
      { label: 'Experience / CV', keywords: ['resume', 'career', 'work', 'education', 'degree'], icon: <UserIcon />, path: '/about/cv' },
      { label: 'Stack', keywords: ['skills', 'tools', 'technology', 'software', 'hardware'], icon: <UserIcon />, path: '/about/stack' },
      { label: 'Writing', keywords: ['articles', 'blog', 'posts', 'read'], icon: <ContentEntityIcon kind="writing" />, path: '/writing' },
      { label: 'View Projects', keywords: ['portfolio', 'builds', 'work', 'lab'], icon: <ContentEntityIcon kind="projects" />, path: sectionPath('projects'), hideWhen: () => currentCategory === 'projects' },
      { label: 'View Essays', keywords: ['threads', 'articles', 'opinion', 'longform'], icon: <ContentEntityIcon kind="threads" />, path: sectionPath('threads'), hideWhen: () => currentCategory === 'threads' },
      { label: 'View Bits2Bricks', keywords: ['technical', 'engineering', 'tutorials', 'bits'], icon: <ContentEntityIcon kind="bits2bricks" />, path: sectionPath('bits2bricks'), hideWhen: () => currentCategory === 'bits2bricks' },
      { label: 'Open Source / GitHub', keywords: ['code', 'repository', 'repo', 'source'], icon: <GitHubIcon size={22} />, path: 'https://github.com/infraphysics', external: true },
      { label: 'Wiki', keywords: ['knowledge', 'brain', 'fieldnotes', 'concepts'], icon: <ContentEntityIcon kind="wiki" />, path: secondBrainPath() },
      { label: 'Notes', keywords: ['notes', 'now', 'short', 'thoughts', 'log'], icon: <ContentEntityIcon kind="notes" />, path: '/notes' },
      { label: 'Contact', keywords: ['email', 'message', 'talk', 'hire'], icon: <MailIcon />, path: '/contact' },
    ];

    for (const item of navItems) {
      if (item.hideWhen?.()) continue;
      result.push({
        label: item.label,
        keywords: item.keywords,
        icon: item.icon,
        action: item.external
          ? () => executeAndClose(() => window.open(item.path, '_blank'))
          : () => executeAndClose(() => navigate(item.path)),
        group: 'nav',
      });
    }

    // Random Article (always shown in nav)
    result.push({
      label: 'Random Article',
      keywords: ['surprise', 'discover', 'shuffle'],
      icon: <DiceIcon />,
      action: () => {
        if (posts.length === 0) return;
        const randomPost = posts[Math.floor(Math.random() * posts.length)];
        executeAndClose(() => navigate(postPath(randomPost.category, randomPost.id)));
      },
      group: 'nav',
    });

    // ── Global shortcut actions ──
    result.push({
      label: `Toggle Theme (${theme === 'dark' ? 'Light' : 'Dark'})`,
      keywords: ['appearance', 'colour', 'color', 'contrast', 'mode', 'dark', 'light'],
      icon: theme === 'dark' ? <SunIcon /> : <MoonIcon />,
      action: () => executeAndClose(toggleTheme),
      shortcut: '⇧T',
      group: 'global',
    });

    result.push({
      label: `Aesthetic Cursor (${aestheticCursor ? 'On' : 'Off'})`,
      keywords: ['mouse', 'pointer', 'speed', 'performance', 'lag', 'latency', 'fps', 'animation', 'effects', 'smooth'],
      icon: <span className="w-[22px] h-[22px] flex items-center justify-center font-mono text-base text-th-secondary">+</span>,
      action: () => executeAndClose(toggleAestheticCursor),
      group: 'global',
    });

    return result;
  }, [article, theme, aestheticCursor, navigate, executeAndClose, toggleTheme, toggleAestheticCursor, isHome, currentCategory]);

  // ── Article search matches (only when query is non-empty) ──
  const articleMatches = useMemo<QuickAction[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    type SearchablePost = typeof SEARCHABLE_POSTS[number];
    type MatchedPost = SearchablePost & { matchType: 'title' | 'content' };

    const searchPosts = (subset: SearchablePost[]): MatchedPost[] => {
      const results: MatchedPost[] = [];
      for (const entry of subset) {
        if (entry.title.includes(q)) {
          results.push({ ...entry, matchType: 'title' });
        } else if (entry.description.includes(q) || entry.plainLower.includes(q)) {
          results.push({ ...entry, matchType: 'content' });
        }
      }
      return results;
    };

    let matched: MatchedPost[];

    // Context-aware: prefer current category, expand if ≤1 result
    if (currentCategory) {
      const catPosts = SEARCHABLE_POSTS.filter(({ post }) => post.category === currentCategory);
      const catResults = searchPosts(catPosts);
      if (catResults.length > 1) {
        matched = catResults;
      } else {
        const allResults = searchPosts(SEARCHABLE_POSTS);
        const catIds = new Set(catResults.map(r => r.post.id));
        matched = [
          ...catResults,
          ...allResults.filter(r => !catIds.has(r.post.id)),
        ];
      }
    } else {
      matched = searchPosts(SEARCHABLE_POSTS);
    }

    // Title matches first, then content matches — max 8 total
    const ordered = [
      ...matched.filter(m => m.matchType === 'title'),
      ...matched.filter(m => m.matchType === 'content'),
    ].slice(0, 8);

    const raw = query.trim();

    return ordered.map(({ post, plain, matchType }) => {
      const title = post.displayTitle || post.title;
      if (matchType === 'title') {
        return {
          label: title,
          displayLabel: highlightMatch(title, raw),
          icon: <ContentEntityIcon kind={post.category} />,
          action: () => executeAndClose(() => navigate(postPath(post.category, post.id))),
          group: 'articles-title' as const,
        };
      }
      // Content match — show snippet with highlight
      const desc = post.description;
      const source = desc.toLowerCase().includes(q) ? desc : plain;
      const snippet = extractSnippet(source, raw);
      return {
        label: title,
        subtitle: highlightMatch(snippet, raw),
        icon: <ContentEntityIcon kind={post.category} />,
        action: () => executeAndClose(() => navigate(postPath(post.category, post.id))),
        group: 'articles-content' as const,
      };
    });
  }, [query, currentCategory, navigate, executeAndClose]);

  // Second Brain concept matches — substring matching (name, last segment, aliases)
  const conceptMatches = useMemo<QuickAction[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return searchableConcepts
      .filter(({ haystack }) => haystack.includes(q))
      .slice(0, 5)
      .map(({ note }) => ({
        label: note.name || note.displayTitle || note.title,
        icon: <ContentEntityIcon kind="wiki" />,
        action: () => {
          try { localStorage.setItem('infraphysics:brain-result-clicked', '1'); } catch {}
          executeAndClose(() => navigate(secondBrainPath(note.id)));
        },
        group: 'concept' as const,
      }));
  }, [query, searchableConcepts, navigate, executeAndClose]);

  // Short notes are small enough to rank locally. Titles carry more weight
  // than prose, while every query term must occur somewhere in the note.
  const noteMatches = useMemo<QuickAction[]>(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return shortNotes
      .map(note => {
        const title = note.title.toLowerCase();
        const body = note.body.join(' ').toLowerCase();
        if (!terms.every(term => title.includes(term) || body.includes(term))) return null;
        const score = terms.reduce((total, term) => total
          + (title.startsWith(term) ? 12 : title.includes(term) ? 8 : 0)
          + (body.includes(term) ? 2 : 0), 0);
        return { note, score };
      })
      .filter((entry): entry is { note: (typeof shortNotes)[number]; score: number } => entry !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ note }) => ({
        label: note.title,
        subtitle: note.date,
        icon: <ContentEntityIcon kind="notes" />,
        action: () => executeAndClose(() => navigate(`/notes/${note.id}`)),
        group: 'notes' as const,
      }));
  }, [query, navigate, executeAndClose]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return actions;
    const lower = q.toLowerCase();
    const matchedActions = actions.filter(a => {
      const searchText = [a.label, ...(a.keywords ?? [])].join(' ');
      return a.group === 'nav'
        ? matchesWordStart(searchText, lower)
        : searchText.toLowerCase().includes(lower);
    });
    // Exact concept matches first, then articles
    const results = [...matchedActions, ...noteMatches, ...conceptMatches, ...articleMatches];
    // Fall back to default actions when nothing matches
    return results.length > 0 ? results : actions;
  }, [query, actions, noteMatches, articleMatches, conceptMatches]);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input — double rAF ensures DOM is ready, setTimeout as fallback for mobile keyboards
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          // Mobile Safari/Chrome may ignore programmatic focus; retry after short delay
          setTimeout(() => inputRef.current?.focus(), 100);
        });
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Clamp selectedIndex when filtered list changes
  useEffect(() => {
    if (selectedIndex >= filtered.length) {
      setSelectedIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-action-item]');
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Stop event from reaching window-level listeners (e.g. SecondBrainView grid nav)
    e.stopPropagation();

    // Shift+T toggles theme even while palette is open
    if (e.key === 'T' && e.shiftKey) {
      e.preventDefault();
      toggleTheme();
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (filtered.length > 0) setSelectedIndex(i => (i + 1) % filtered.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (filtered.length > 0) setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (query) {
          setQuery('');
          setSelectedIndex(0);
        } else {
          onClose();
        }
        break;
    }
  }, [filtered, selectedIndex, onClose, query, toggleTheme]);

  if (!mounted) return null;

  // Group labels for visual separation
  const groupLabel = (group?: string) => {
    switch (group) {
      case 'contextual': return 'Article';
      case 'nav': return 'Navigate';
      case 'global': return 'Shortcuts';
      case 'articles-title': return 'Articles';
      case 'articles-content': return 'In Content';
      case 'concept': return 'Wiki';
      case 'notes': return 'Notes';
      default: return null;
    }
  };

  // Track which groups we've already rendered headers for
  let lastGroup: string | undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-start pt-3 sm:items-center sm:pt-0 justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-th-overlay transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-lg mx-4 max-h-[70vh] flex flex-col rounded-xl bg-th-sidebar border border-th-border shadow-2xl overflow-hidden transition-all duration-200 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onKeyDown={handleKeyDown}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-th-border">
          <span className="text-th-tertiary flex-shrink-0">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-th-primary placeholder:text-th-muted outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-th-tertiary bg-th-surface-alt border border-th-border rounded font-mono">
            {COMMAND_KEY}
          </kbd>
        </div>

        {/* Action list */}
        <div ref={listRef} className="py-2 flex-1 min-h-0 overflow-y-auto thin-scrollbar palette-scrollbar">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-th-tertiary text-center">
              No results found
            </div>
          ) : (
            filtered.map((action, i) => {
              // Show group header when group changes
              let header: React.ReactNode = null;
              if (action.group && action.group !== lastGroup) {
                const label = groupLabel(action.group);
                if (label) {
                  header = (
                    <div className="px-4 pt-3 pb-1.5 text-[11px] font-semibold tracking-wide text-th-muted">
                      {label}
                    </div>
                  );
                }
              }
              lastGroup = action.group;

              return (
                <React.Fragment key={`${action.group}-${action.label}`}>
                  {header}
                  <button
                    data-action-item
                    onClick={action.action}
                    className={`mx-2 w-[calc(100%-1rem)] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      i === selectedIndex
                        ? 'bg-th-elevated text-th-heading'
                        : 'text-th-secondary hover:bg-th-surface-alt'
                    }`}
                  >
                    <span className={i === selectedIndex ? 'text-th-primary' : 'text-th-tertiary'}>
                      {action.icon}
                    </span>
                    <span className="flex-1 text-left min-w-0">
                      <span className="block truncate">{action.displayLabel ?? action.label}</span>
                      {action.subtitle && (
                        <span className="block truncate text-xs text-th-muted mt-0.5">{action.subtitle}</span>
                      )}
                    </span>
                    {action.shortcut && (
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-th-tertiary bg-th-surface-alt border border-th-border rounded font-mono ml-auto flex-shrink-0">
                        {action.shortcut}
                      </kbd>
                    )}
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Footer — keyboard hints (hidden on touch/mobile) */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 border-t border-th-border text-[11px] text-th-muted">
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-th-surface-alt border border-th-border text-[10px] font-mono">↑</kbd>
            <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-th-surface-alt border border-th-border text-[10px] font-mono">↓</kbd>
            <span className="ml-0.5">navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-th-surface-alt border border-th-border text-[10px] font-mono">↵</kbd>
            <span className="ml-0.5">select</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-th-surface-alt border border-th-border text-[10px] font-mono">esc</kbd>
            <span className="ml-0.5">close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
