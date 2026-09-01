// Static cheatsheet panel showing custom syntax features
// Two-column: syntax → description

import React from 'react';

const FEATURES = [
  { syntax: '[[uid]]', desc: 'Wiki-link to a fieldnote (by UID)' },
  { syntax: '[[uid|display]]', desc: 'Wiki-link with custom display text' },
  { syntax: '[[projects/slug|Text]]', desc: 'Cross-doc link (projects, threads, bits2bricks)' },
  { syntax: '[[https://url|Text]]', desc: 'External URL link' },
  { syntax: '## Interactions\\n- [[uid]] : : annotation', desc: 'Trailing ref (interaction) — must have : : annotation' },
  { syntax: '{bkqt/note}...{/bkqt}', desc: 'Typed box (note, tip, warning, danger, keyconcept)' },
  { syntax: '> quoted text', desc: 'Quotation with a restrained left border' },
  { syntax: '{optional|Title}...{/optional}', desc: 'Collapsible alternatives with option tabs' },
  { syntax: '^[explanation]', desc: 'Inline footnote' },
  { syntax: '{^:text}', desc: 'Superscript' },
  { syntax: '{v:text}', desc: 'Subscript' },
  { syntax: '{kbd:key}', desc: 'Keyboard key' },
  { syntax: '- term:: definition', desc: 'Definition list' },
  { syntax: 'a. item  b. item', desc: 'Alphabetical list (a./A.)' },
  { syntax: '>> 26.02.15 - text', desc: 'Context annotation (timestamped note)' },
];

export const SyntaxCheatsheet: React.FC = () => (
  <div className="overflow-y-auto thin-scrollbar p-4 space-y-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
    <h3 className="text-xs text-th-secondary uppercase tracking-wider mb-3">Custom Syntax</h3>
    {FEATURES.map((f, i) => (
      <div key={i} className="flex gap-3 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <code className="text-[10px] text-violet-400 whitespace-nowrap flex-shrink-0 font-mono" style={{ minWidth: 200 }}>
          {f.syntax}
        </code>
        <span className="text-[11px] text-th-secondary">{f.desc}</span>
      </div>
    ))}
  </div>
);
