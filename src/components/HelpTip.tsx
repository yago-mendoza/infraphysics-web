// Global help panel for the Second Brain Manager.
// Single ? button triggers a centered overlay explaining all concepts.

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const SECTIONS = [
  {
    title: 'Stats',
    items: [
      ['concepts', 'Total number of entries in the knowledge graph.'],
      ['links', 'Total outgoing references across all concepts.'],
      ['orphans', 'Concepts with zero connections \u2014 no outgoing references and nothing links to them.'],
      ['density', 'Links as a percentage of all possible directed connections (n\u00d7(n\u22121)). Higher = more interlinked.'],
      ['most connected', 'The concept with the highest total connections (outgoing + incoming).'],
    ],
  },
  {
    title: 'Directory',
    items: [
      ['click a row', 'Scopes the grid to concepts under that folder. Click again to remove. Multiple scopes combine with OR.'],
      ['click a concept name', 'Navigates directly to that concept\u2019s detail view.'],
      ['child count', 'Number next to a folder \u2014 total concepts nested at all depth levels, not just direct children.'],
    ],
  },
  {
    title: 'Filters',
    items: [
      ['orphans', 'Show only concepts with zero connections.'],
      ['leaf nodes', 'Show only concepts at the end of an address branch (no sub-concepts beneath them).'],
      ['hubs \u2265 N', 'Show only concepts with at least N total connections (outgoing + incoming). 0 = off.'],
      ['depth range', 'Filter by address tree nesting level. LAPTOP is depth 1, LAPTOP//UI is depth 2.'],
    ],
  },
  {
    title: 'Detail view',
    items: [
      ['links to N', 'How many concepts this entry references in its content.'],
      ['linked from N', 'How many other concepts mention this one.'],
      ['related', 'Concepts listed in the trailing "see also" references of this entry.'],
      ['visit trail', 'The violet breadcrumbs at the top track every concept you\u2019ve visited. Click any to jump back.'],
    ],
  },
  {
    title: 'Grid sort',
    items: [
      ['shuffle', 'Randomizes the grid order. Click again while active to re-roll.'],
    ],
  },
];

export const HelpButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-5 h-5 rounded-full border border-th-hub-border text-[10px] text-th-muted hover:text-th-secondary hover:border-th-border-hover transition-colors flex items-center justify-center flex-shrink-0"
      >
        ?
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          {/* Panel */}
          <div
            className="relative z-10 w-[min(520px,90vw)] max-h-[75vh] overflow-y-auto border border-th-border-hover shadow-2xl p-5"
            style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-th-heading lowercase">reference guide</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-th-muted hover:text-th-secondary text-sm transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              {SECTIONS.map(section => (
                <div key={section.title}>
                  <h3 className="text-[10px] uppercase tracking-wider text-violet-400 mb-1.5">{section.title}</h3>
                  <div className="space-y-1">
                    {section.items.map(([term, desc]) => (
                      <div key={term} className="flex gap-2 text-[11px] leading-relaxed">
                        <span className="text-th-secondary font-medium whitespace-nowrap flex-shrink-0">{term}</span>
                        <span className="text-th-tertiary">&mdash;</span>
                        <span className="text-th-tertiary">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
