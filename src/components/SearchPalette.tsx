// Command palette triggered by search button or Ctrl+K / Cmd+K

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { posts } from '../data/data';
import { postPath } from '../config/categories';
import { initBrainIndex, type BrainIndex } from '../lib/brainIndex';
import { useArticleContext } from '../contexts/ArticleContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon,
  GearIcon,
  GitHubIcon,
  DiamondIcon,
  MailIcon,
  SearchIcon,
  ExternalLinkIcon,
  SunIcon,
  MoonIcon,
} from './icons';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  group?: 'contextual' | 'global' | 'nav' | 'concept';
}

export const SearchPalette: React.FC<SearchPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { article } = useArticleContext();
  const { theme, toggleTheme } = useTheme();

  // Async brain index for concept search
  const [brainIndex, setBrainIndex] = useState<BrainIndex | null>(null);
  useEffect(() => { initBrainIndex().then(setBrainIndex); }, []);
  const allFieldNotes = brainIndex?.allFieldNotes ?? [];

  const executeAndClose = useCallback((fn: () => void) => {
    fn();
    onClose();
  }, [onClose]);

  // Build all actions: contextual (article) → global shortcuts → navigation
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

    // ── Global shortcut actions ──
    const mostRecent = [...posts]
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    if (mostRecent) {
      result.push({
        label: `Most Recent: ${mostRecent.displayTitle || mostRecent.title}`,
        icon: <span className="w-[22px] h-[22px] flex items-center justify-center text-[13px] text-th-secondary">⏎</span>,
        action: () => executeAndClose(() => navigate(postPath(mostRecent.category, mostRecent.id))),
        shortcut: '.',
        group: 'global',
      });
    }

    result.push({
      label: `Toggle Theme (${theme === 'dark' ? 'Light' : 'Dark'})`,
      icon: theme === 'dark' ? <SunIcon /> : <MoonIcon />,
      action: () => executeAndClose(toggleTheme),
      shortcut: '⇧T',
      group: 'global',
    });

    // ── Navigation actions ──
    result.push(
      {
        label: 'Go to Home',
        icon: <HomeIcon />,
        action: () => executeAndClose(() => navigate('/home')),
        group: 'nav',
      },
      {
        label: 'View Projects',
        icon: <GearIcon />,
        action: () => executeAndClose(() => navigate('/lab/projects')),
        group: 'nav',
      },
      {
        label: 'Open Source / GitHub',
        icon: <GitHubIcon size={22} />,
        action: () => executeAndClose(() => window.open('https://github.com/infraphysics', '_blank')),
        group: 'nav',
      },
      {
        label: 'Second Brain',
        icon: <DiamondIcon />,
        action: () => executeAndClose(() => navigate('/lab/second-brain')),
        group: 'nav',
      },
      {
        label: 'Contact',
        icon: <MailIcon />,
        action: () => executeAndClose(() => navigate('/contact')),
        group: 'nav',
      },
      {
        label: 'Random Article',
        icon: (
          <span className="w-[22px] h-[22px] flex items-center justify-center bg-th-elevated rounded-sm text-[11px] text-th-secondary">
            ?
          </span>
        ),
        action: () => {
          if (posts.length === 0) return;
          const randomPost = posts[Math.floor(Math.random() * posts.length)];
          executeAndClose(() => navigate(postPath(randomPost.category, randomPost.id)));
        },
        group: 'nav',
      },
    );

    return result;
  }, [article, theme, navigate, executeAndClose, toggleTheme]);

  // Second Brain concept matches — only exact final-segment matches
  const conceptMatches = useMemo<QuickAction[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return allFieldNotes
      .filter(note => {
        // Match against the last segment of the address (after final /)
        const addr = note.address || '';
        const lastSeg = addr.includes('/') ? addr.split('/').pop()! : addr;
        return lastSeg.toLowerCase() === q;
      })
      .slice(0, 5)
      .map(note => ({
        label: note.displayTitle || note.title,
        icon: <DiamondIcon />,
        action: () => executeAndClose(() => navigate(`/lab/second-brain/${note.id}`)),
        group: 'concept' as const,
      }));
  }, [query, navigate, executeAndClose]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return actions;
    const lower = q.toLowerCase();
    const matchedActions = actions.filter(a => a.label.toLowerCase().includes(lower));
    // Append concept matches after action matches
    return [...matchedActions, ...conceptMatches];
  }, [query, actions, conceptMatches]);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after animation frame so the element is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
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
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filtered.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  // Group labels for visual separation
  const groupLabel = (group?: string) => {
    switch (group) {
      case 'contextual': return 'Article';
      case 'global': return 'Shortcuts';
      case 'nav': return 'Navigate';
      case 'concept': return 'Second Brain';
      default: return null;
    }
  };

  // Track which groups we've already rendered headers for
  let lastGroup: string | undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-th-overlay"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 max-h-[70vh] flex flex-col rounded-xl bg-th-sidebar border border-th-border shadow-2xl animate-fade-in overflow-hidden"
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
            placeholder="Type to search... | Ctrl+K to toggle"
            className="flex-1 bg-transparent text-th-primary placeholder:text-th-muted outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-th-tertiary bg-th-surface-alt border border-th-border rounded font-mono">
            ESC
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
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      i === selectedIndex
                        ? 'bg-th-elevated text-th-heading'
                        : 'text-th-secondary hover:bg-th-surface-alt'
                    }`}
                  >
                    <span className={i === selectedIndex ? 'text-th-primary' : 'text-th-tertiary'}>
                      {action.icon}
                    </span>
                    <span className="flex-1 text-left truncate">{action.label}</span>
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

        {/* Footer — keyboard hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-th-border text-[11px] text-th-muted">
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-th-surface-alt border border-th-border text-[10px] font-mono">↑</kbd>
            <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-th-surface-alt border border-th-border text-[10px] font-mono">↓</kbd>
            <span className="ml-0.5">to navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-th-surface-alt border border-th-border text-[10px] font-mono">↵</kbd>
            <span className="ml-0.5">to select</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-th-surface-alt border border-th-border text-[10px] font-mono">esc</kbd>
            <span className="ml-0.5">to close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
