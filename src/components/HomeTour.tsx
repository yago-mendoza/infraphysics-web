// First-visit Ctrl+K hint — single popup, shown once per browser

import React, { useState, useEffect } from 'react';

export const HomeTour: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[90] animate-fade-in">
      <div className="bg-th-sidebar border border-th-border rounded-lg shadow-2xl px-4 py-3 max-w-xs">
        <p className="text-xs text-th-secondary leading-relaxed font-sans">
          Press{' '}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-th-surface-alt border border-th-border rounded text-th-heading">
            Ctrl+K
          </kbd>
          {' '}to search from anywhere on the site.
        </p>
        <button
          onClick={dismiss}
          className="mt-2 text-[10px] text-th-tertiary hover:text-th-secondary transition-colors uppercase tracking-wider"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
