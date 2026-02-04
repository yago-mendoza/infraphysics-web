// Command palette triggered by search button or Ctrl+K / Cmd+K

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { posts } from '../data/data';
import { postPath } from '../config/categories';
import {
  HomeIcon,
  GearIcon,
  GitHubIcon,
  DiamondIcon,
  MailIcon,
  SearchIcon,
} from './icons';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

export const SearchPalette: React.FC<SearchPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const executeAndClose = useCallback((fn: () => void) => {
    fn();
    onClose();
  }, [onClose]);

  const actions: QuickAction[] = [
    {
      label: 'Go to Home',
      icon: <HomeIcon />,
      action: () => executeAndClose(() => navigate('/home')),
    },
    {
      label: 'View Projects',
      icon: <GearIcon />,
      action: () => executeAndClose(() => navigate('/lab/projects')),
    },
    {
      label: 'Open Source / GitHub',
      icon: <GitHubIcon size={22} />,
      action: () => executeAndClose(() => window.open('https://github.com/infraphysics', '_blank')),
    },
    {
      label: 'Second Brain',
      icon: <DiamondIcon />,
      action: () => executeAndClose(() => navigate('/lab/second-brain')),
    },
    {
      label: 'Contact',
      icon: <MailIcon />,
      action: () => executeAndClose(() => navigate('/contact')),
    },
    {
      label: 'Random Article',
      icon: (
        <span className="w-[22px] h-[22px] flex items-center justify-center bg-th-elevated rounded-sm text-[11px] text-th-secondary">
          ?
        </span>
      ),
      action: () => {
        const validPosts = posts.filter(p => p.category !== 'fieldnotes');
        if (validPosts.length === 0) return;
        const randomPost = validPosts[Math.floor(Math.random() * validPosts.length)];
        executeAndClose(() => navigate(postPath(randomPost.category, randomPost.id)));
      },
    },
  ];

  const filtered = query.trim()
    ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

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

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-th-overlay"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl bg-th-sidebar border border-th-border shadow-2xl animate-fade-in overflow-hidden"
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
            placeholder="Type to search..."
            className="flex-1 bg-transparent text-th-primary placeholder:text-th-muted outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-th-tertiary bg-th-surface-alt border border-th-border rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Action list */}
        <div ref={listRef} className="py-2 max-h-[40vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-th-tertiary text-center">
              No results found
            </div>
          ) : (
            filtered.map((action, i) => (
              <button
                key={action.label}
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
                <span>{action.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
