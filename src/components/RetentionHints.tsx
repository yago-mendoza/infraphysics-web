// Contextual retention hints — nudge users toward undiscovered features
// Shows at most one hint at a time, priority ordered. Each hint has its own
// trigger condition and dismissal criteria tracked in localStorage.

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const FADE_MS = 1200;
const SHOW_MS = 7000;

function ls(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function lsInt(key: string): number {
  return parseInt(ls(key) || '0', 10) || 0;
}

// ── Hint definitions ──────────────────────────────────────────────

interface HintDef {
  id: string;
  text: React.ReactNode;
  /** Return true if this hint should show right now */
  shouldShow: (pathname: string) => boolean;
  /** Optional: setup that runs when hint mounts (e.g. scroll listener). Return cleanup. */
  setup?: (show: () => void) => (() => void) | void;
  /** If true, show immediately without waiting for setup callback */
  immediate?: boolean;
}

const hints: HintDef[] = [
  // 1. Second Brain discovery — on article pages with wiki-links
  {
    id: 'second-brain',
    text: (
      <>
        Purple links connect to the{' '}
        <span className="text-violet-400 font-semibold">Second Brain</span>{' '}
        — a web of concepts behind the articles.
      </>
    ),
    shouldShow: (pathname) => {
      if (lsInt('infraphysics:wikilink-clicks') >= 2) return false;
      // Only on article pages
      return /^\/(lab|blog)\/[^/]+\/[^/]+/.test(pathname) && !pathname.startsWith('/lab/second-brain');
    },
    setup: (show) => {
      // Wait for article to render, then check for wiki-links
      const timer = setTimeout(() => {
        if (document.querySelector('a.wiki-ref-resolved')) show();
      }, 2000);
      return () => clearTimeout(timer);
    },
  },

  // 2. More categories — after scrolling 80% of an article, if only 1 category visited
  {
    id: 'more-categories',
    text: 'Liked this? There\'s more — threads, tutorials, and 200+ connected notes.',
    shouldShow: (pathname) => {
      if (!/^\/(lab|blog)\/[^/]+\/[^/]+/.test(pathname)) return false;
      if (pathname.startsWith('/lab/second-brain')) return false;
      // Check unique categories in history
      try {
        const raw = ls('infraphysics:article-history');
        if (!raw) return true;
        const history: { category: string }[] = JSON.parse(raw);
        const unique = new Set(history.map(h => h.category));
        return unique.size < 2;
      } catch { return false; }
    },
    setup: (show) => {
      const onScroll = () => {
        const scrollPct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
        if (scrollPct > 0.8) {
          show();
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    },
  },

  // 3. Theme toggle — on blog pages after 3+ visits without toggling
  {
    id: 'theme-toggle',
    text: (
      <>
        Press{' '}
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-th-surface-alt border border-th-border rounded text-th-heading">
          Shift+T
        </kbd>
        {' '}to switch between dark and light mode.
      </>
    ),
    shouldShow: (pathname) => {
      if (ls('infraphysics:theme-toggled') === '1') return false;
      return pathname.startsWith('/blog');
    },
    immediate: true,
  },

  // 4. Search finds Second Brain — after 5+ searches without clicking a brain result
  {
    id: 'search-power',
    text: 'Search also finds concepts from the Second Brain — try a technical term.',
    shouldShow: () => {
      if (ls('infraphysics:brain-result-clicked') === '1') return false;
      return lsInt('infraphysics:search-uses') >= 2;
    },
    immediate: true,
  },
];

// ── Component ─────────────────────────────────────────────────────

export const RetentionHints: React.FC = () => {
  const { pathname } = useLocation();
  const [activeHint, setActiveHint] = useState<HintDef | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Find the highest-priority eligible hint on route change
  useEffect(() => {
    setActiveHint(null);
    setVisible(false);
    setMounted(false);

    // Skip on home page (HomeTour handles that)
    if (pathname === '/home' || pathname === '/') return;

    // Small delay to let the page settle
    const timer = setTimeout(() => {
      for (const hint of hints) {
        // Check per-session: don't show the same hint twice in one session
        if (sessionStorage.getItem(`hint-shown:${hint.id}`)) continue;
        if (hint.shouldShow(pathname)) {
          setActiveHint(hint);
          break;
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  const showHint = useCallback(() => {
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  // Run setup or show immediately
  useEffect(() => {
    if (!activeHint) return;
    sessionStorage.setItem(`hint-shown:${activeHint.id}`, '1');

    if (activeHint.immediate) {
      const timer = setTimeout(showHint, 1500);
      return () => clearTimeout(timer);
    }
    if (activeHint.setup) {
      return activeHint.setup(showHint) || undefined;
    }
  }, [activeHint, showHint]);

  // Auto-dismiss
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), SHOW_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  // Unmount after fade-out
  useEffect(() => {
    if (mounted && !visible) {
      const timer = setTimeout(() => setMounted(false), FADE_MS);
      return () => clearTimeout(timer);
    }
  }, [mounted, visible]);

  if (!mounted || !activeHint) return null;

  return (
    <div
      className="hidden md:block fixed top-6 right-6 z-[90]"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <div className="bg-th-sidebar border border-th-border rounded-lg shadow-2xl px-4 py-3 max-w-xs">
        <p className="text-xs text-th-secondary leading-relaxed font-sans">
          {activeHint.text}
        </p>
        <button
          onClick={() => setVisible(false)}
          className="mt-2 text-[10px] text-th-tertiary hover:text-th-secondary transition-colors uppercase tracking-wider"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
