// Ctrl+K hint — appears periodically until user has used search 3 times

import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'infraphysics:search-uses';
const SHOW_DURATION = 6000; // ms visible before auto-dismiss
const FADE_DURATION = 1200; // ms for enter/exit transitions

export const HomeTour: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already used search enough times
    try {
      const uses = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      if (uses >= 3) return;
    } catch { return; }

    // Delay before showing
    const showTimer = setTimeout(() => {
      setMounted(true);
      // Double rAF to ensure DOM paint before triggering transition
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 1500);

    return () => clearTimeout(showTimer);
  }, []);

  // Auto-dismiss after SHOW_DURATION
  useEffect(() => {
    if (!visible) return;
    const hideTimer = setTimeout(() => setVisible(false), SHOW_DURATION);
    return () => clearTimeout(hideTimer);
  }, [visible]);

  // Unmount after exit transition completes
  useEffect(() => {
    if (mounted && !visible) {
      const unmountTimer = setTimeout(() => setMounted(false), FADE_DURATION);
      return () => clearTimeout(unmountTimer);
    }
  }, [mounted, visible]);

  // Dismiss on Escape
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className="hidden md:block fixed top-6 right-6 z-[90]"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_DURATION}ms ease`,
      }}
    >
      <div className="bg-th-sidebar border border-th-border rounded-lg shadow-2xl px-4 py-3 max-w-xs">
        <p className="text-xs text-th-secondary leading-relaxed font-sans">
          Press{' '}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-th-surface-alt border border-th-border rounded text-th-heading">
            Ctrl+K
          </kbd>
          {' '}to search from anywhere on the site.
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
